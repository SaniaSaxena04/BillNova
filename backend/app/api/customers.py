from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.customer import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer: CustomerCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new customer profile. Enforces phone number uniqueness."""
    existing_customer = await db.customers.find_one({"phone": customer.phone})
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with phone number '{customer.phone}' already exists."
        )

    customer_dict = customer.model_dump()
    now = datetime.utcnow()
    customer_dict["total_purchases_count"] = 0
    customer_dict["total_spent"] = 0.0
    customer_dict["created_at"] = now
    customer_dict["updated_at"] = now

    result = await db.customers.insert_one(customer_dict)
    created_customer = await db.customers.find_one({"_id": result.inserted_id})
    return created_customer


@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    search: Optional[str] = Query(None, description="Search by name, phone, or email"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Fetch customers with optional search filtering and pagination."""
    query = {}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.customers.find(query).skip(skip).limit(limit).sort("name", 1)
    return await cursor.to_list(length=limit)


@router.get("/phone/{phone}", response_model=CustomerResponse)
async def get_customer_by_phone(
    phone: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Quick lookup by phone number for POS checkout."""
    customer = await db.customers.find_one({"phone": phone})
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with phone '{phone}' not found."
        )
    return customer


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Fetch single customer details by MongoDB ObjectId."""
    if not ObjectId.is_valid(customer_id):
        raise HTTPException(status_code=400, detail="Invalid Customer ID format.")

    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer_update: CustomerUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update customer profile information."""
    if not ObjectId.is_valid(customer_id):
        raise HTTPException(status_code=400, detail="Invalid Customer ID format.")

    update_data = {k: v for k, v in customer_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    # Phone uniqueness check if updating phone
    if "phone" in update_data:
        existing = await db.customers.find_one({
            "phone": update_data["phone"],
            "_id": {"$ne": ObjectId(customer_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered to another customer.")

    update_data["updated_at"] = datetime.utcnow()

    result = await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found.")

    return await db.customers.find_one({"_id": ObjectId(customer_id)})


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a customer record."""
    if not ObjectId.is_valid(customer_id):
        raise HTTPException(status_code=400, detail="Invalid Customer ID format.")

    result = await db.customers.delete_one({"_id": ObjectId(customer_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return None