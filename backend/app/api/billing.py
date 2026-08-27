from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.config import settings
from app.database import get_database
from app.models.bill import BillCreate, BillResponse, BillStatus
from app.services.billing_service import generate_invoice_number, calculate_item_financials
from app.services.pdf_service import generate_bill_pdf
from app.services.email_service import check_and_notify_low_stock
from app.services.telegram_bot import send_low_stock_broadcast

router = APIRouter(prefix="/billing", tags=["Billing & POS"])


@router.post("/checkout", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def process_checkout(
    bill_data: BillCreate,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Processes transaction:
    1. Validates product availability and stock limits.
    2. Deducts stock automatically from product inventory.
    3. Triggers background low-stock checks for Email and Telegram dispatch.
    4. Calculates subtotals, tax, discounts, and total amount.
    5. Links customer and updates spending statistics.
    6. Saves transaction record.
    """
    processed_items = []
    subtotal = 0.0
    total_tax = 0.0

    # 1. Product Validation & Stock Check
    for item in bill_data.items:
        if not ObjectId.is_valid(item.product_id):
            raise HTTPException(status_code=400, detail=f"Invalid Product ID: {item.product_id}")

        product = await db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.product_id}")

        if product.get("stock_quantity", 0) < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product['name']}'. Required: {item.quantity}, Available: {product.get('stock_quantity', 0)}"
            )

        # Financial Calculations per item
        fin = calculate_item_financials(
            unit_price=product["price"],
            quantity=item.quantity,
            discount_pct=item.discount_percentage,
            tax_pct=bill_data.tax_rate_percentage
        )

        subtotal += (product["price"] * item.quantity)
        total_tax += fin["tax_amount"]

        processed_items.append({
            "product_id": str(product["_id"]),
            "product_name": product["name"],
            "barcode": product["barcode"],
            "quantity": item.quantity,
            "unit_price": product["price"],
            "discount_amount": fin["discount_amount"],
            "tax_amount": fin["tax_amount"],
            "total_price": fin["total_price"]
        })

    # 2. Grand Total Calculation
    grand_total = max(0.0, (subtotal + total_tax) - bill_data.discount_amount)

    # 3. Customer Info Handling
    customer_name = "Walk-in Customer"
    customer_phone = None

    if bill_data.customer_id:
        if not ObjectId.is_valid(bill_data.customer_id):
            raise HTTPException(status_code=400, detail="Invalid Customer ID format.")

        customer = await db.customers.find_one({"_id": ObjectId(bill_data.customer_id)})
        if customer:
            customer_name = customer.get("name")
            customer_phone = customer.get("phone")

            # Update customer spending statistics & loyalty points
            await db.customers.update_one(
                {"_id": ObjectId(bill_data.customer_id)},
                {
                    "$inc": {
                        "total_purchases_count": 1,
                        "total_spent": round(grand_total, 2),
                        "loyalty_points": int(grand_total // 100)  # 1 point per 100 currency units
                    }
                }
            )

    # 4. Atomic Stock Deductions & Low-Stock Tracking
    low_stock_items = []
    for item in bill_data.items:
        updated_product = await db.products.find_one_and_update(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock_quantity": -item.quantity}, "$set": {"updated_at": datetime.utcnow()}},
            return_document=ReturnDocument.AFTER
        )

        if updated_product:
            threshold = updated_product.get("reorder_level", settings.DEFAULT_LOW_STOCK_THRESHOLD)
            if updated_product.get("stock_quantity", 0) <= threshold:
                low_stock_items.append(updated_product)

    # 5. Save Bill Document
    bill_doc = {
        "invoice_number": generate_invoice_number(),
        "customer_id": bill_data.customer_id,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "items": processed_items,
        "subtotal": round(subtotal, 2),
        "tax_rate_percentage": bill_data.tax_rate_percentage,
        "total_tax": round(total_tax, 2),
        "overall_discount": bill_data.discount_amount,
        "grand_total": round(grand_total, 2),
        "payment_mode": bill_data.payment_mode,
        "status": BillStatus.PAID,
        "created_at": datetime.utcnow()
    }

    result = await db.bills.insert_one(bill_doc)

    # 6. Enqueue Background Tasks for Email & Telegram Alerts
    if low_stock_items:
        background_tasks.add_task(check_and_notify_low_stock, low_stock_items)
        background_tasks.add_task(send_low_stock_broadcast, low_stock_items)

    return await db.bills.find_one({"_id": result.inserted_id})


@router.get("/", response_model=List[BillResponse])
async def get_bills(
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    payment_mode: Optional[str] = Query(None, description="Filter by payment mode"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieve billing history with filters and pagination."""
    query = {}
    if customer_id:
        query["customer_id"] = customer_id
    if payment_mode:
        query["payment_mode"] = payment_mode

    cursor = db.bills.find(query).skip(skip).limit(limit).sort("created_at", -1)
    return await cursor.to_list(length=limit)


@router.get("/{bill_id}/pdf")
async def download_bill_pdf(
    bill_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate and stream a PDF invoice for a specific bill with dynamic payment QR code.
    Placed ABOVE /{bill_id} to avoid path collision.
    """
    if not ObjectId.is_valid(bill_id):
        raise HTTPException(status_code=400, detail="Invalid Bill ID format.")

    bill = await db.bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    # Normalize bill item keys to support pdf_service formatting
    pdf_payload = {
        "invoice_number": bill.get("invoice_number", bill_id),
        "created_at": bill.get("created_at"),
        "customer_name": bill.get("customer_name", "Walk-in Customer"),
        "customer_phone": bill.get("customer_phone", "N/A"),
        "payment_mode": bill.get("payment_mode", "CASH"),
        "subtotal": bill.get("subtotal", 0.0),
        "tax_amount": bill.get("total_tax", 0.0),
        "discount_amount": bill.get("overall_discount", 0.0),
        "grand_total": bill.get("grand_total", 0.0),
        "items": [
            {
                "name": item.get("product_name", "Product"),
                "quantity": item.get("quantity", 1),
                "unit_price": item.get("unit_price", 0.0),
                "total_amount": item.get("total_price", 0.0),
            }
            for item in bill.get("items", [])
        ]
    }

    pdf_buffer = generate_bill_pdf(pdf_payload)
    filename = f"Invoice_{bill.get('invoice_number', bill_id)}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill_by_id(
    bill_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Fetch invoice details by MongoDB ID."""
    if not ObjectId.is_valid(bill_id):
        raise HTTPException(status_code=400, detail="Invalid Bill ID format.")

    bill = await db.bills.find_one({"_id": ObjectId(bill_id)})
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return bill