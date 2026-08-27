from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.database import get_database
from app.models.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    StockUpdate,
)
from app.services.email_service import check_and_notify_low_stock

router = APIRouter(prefix="/products", tags=["Products"])


def format_product(product: dict) -> dict:
    """Helper to append computed fields like low stock status and convert ObjectId."""
    product["_id"] = str(product["_id"])
    product["is_low_stock"] = product.get("stock_quantity", 0) <= product.get("reorder_level", 10)
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new product. Ensures barcode uniqueness."""
    existing_barcode = await db.products.find_one({"barcode": product.barcode})
    if existing_barcode:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with barcode '{product.barcode}' already exists."
        )

    product_dict = product.model_dump()
    now = datetime.utcnow()
    product_dict["created_at"] = now
    product_dict["updated_at"] = now

    result = await db.products.insert_one(product_dict)
    created_product = await db.products.find_one({"_id": result.inserted_id})
    return format_product(created_product)


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    search: Optional[str] = Query(None, description="Search by name or barcode"),
    category: Optional[str] = Query(None, description="Filter by category"),
    low_stock_only: bool = Query(False, description="Filter items at or below reorder level"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Fetch products with optional search query, category filtering, low-stock filter, and pagination."""
    query = {}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]

    if category:
        query["category"] = category

    if low_stock_only:
        query["$expr"] = {"$lte": ["$stock_quantity", "$reorder_level"]}

    cursor = db.products.find(query).skip(skip).limit(limit).sort("name", 1)
    products = await cursor.to_list(length=limit)
    return [format_product(p) for p in products]


@router.get("/low-stock", response_model=List[ProductResponse])
async def get_low_stock_alerts(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Dedicated endpoint for Telegram bot / background monitoring task to query low stock items."""
    try:
        cursor = db.products.find({
            "$expr": {"$lte": ["$stock_quantity", "$reorder_level"]}
        }).sort("stock_quantity", 1)
        products = await cursor.to_list(length=100)
        return [format_product(p) for p in products]
    except Exception:
        # Fallback python-level filtering if $expr fails on non-indexed field types
        cursor = db.products.find({})
        all_products = await cursor.to_list(length=500)
        return [
            format_product(p) for p in all_products 
            if p.get("stock_quantity", 0) <= p.get("reorder_level", 10)
        ]


@router.post("/trigger-low-stock-check")
async def trigger_low_stock_check(
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Manual trigger to scan inventory and dispatch low-stock alert emails."""
    try:
        cursor = db.products.find({
            "$expr": {"$lte": ["$stock_quantity", "$reorder_level"]}
        })
        low_stock_products = await cursor.to_list(length=100)
    except Exception:
        cursor = db.products.find({})
        all_products = await cursor.to_list(length=500)
        low_stock_products = [
            p for p in all_products 
            if p.get("stock_quantity", 0) <= p.get("reorder_level", settings.DEFAULT_LOW_STOCK_THRESHOLD)
        ]

    if low_stock_products:
        background_tasks.add_task(check_and_notify_low_stock, low_stock_products)
        return {
            "message": f"Found {len(low_stock_products)} low-stock item(s). Alert email dispatched in background.",
            "count": len(low_stock_products)
        }

    return {"message": "All product stock levels are healthy.", "count": 0}


@router.get("/barcode/{barcode}", response_model=ProductResponse)
async def get_product_by_barcode(
    barcode: str, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Quick product lookup by barcode scanner."""
    product = await db.products.find_one({"barcode": barcode})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode '{barcode}' not found."
        )
    return format_product(product)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Fetch single product details by MongoDB ObjectId."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format.")

    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return format_product(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str, 
    product_update: ProductUpdate, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update product details."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format.")

    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    # Barcode uniqueness check if updating barcode
    if "barcode" in update_data:
        existing = await db.products.find_one({
            "barcode": update_data["barcode"], 
            "_id": {"$ne": ObjectId(product_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Barcode already assigned to another product.")

    update_data["updated_at"] = datetime.utcnow()

    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found.")

    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    return format_product(updated_product)


@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def adjust_stock(
    product_id: str,
    stock_payload: StockUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Adjust product inventory quantity (positive adds stock, negative removes stock)."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format.")

    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    new_quantity = product.get("stock_quantity", 0) + stock_payload.quantity_change
    if new_quantity < 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient stock. Current stock is {product.get('stock_quantity', 0)}."
        )

    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {
            "$set": {
                "stock_quantity": new_quantity,
                "updated_at": datetime.utcnow()
            }
        }
    )

    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    return format_product(updated_product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a product by ID."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product ID format.")

    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found.")
    return None