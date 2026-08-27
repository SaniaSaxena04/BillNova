from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.models.analytics import SalesPredictionRequest, SalesPredictionResponse
from app.models.user import UserRole
from app.services.auth_service import RoleChecker
from app.services.ml_service import ml_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Role restriction dependency for management endpoints
allow_management = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])


# ==========================================
# 1. Existing Daily Sales & Chart Endpoints
# ==========================================

@router.get("/summary/today")
async def get_today_sales_summary(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Fetch daily sales revenue, invoice count, and top-selling items."""
    now = datetime.utcnow()
    start_of_day = datetime(now.year, now.month, now.day, 0, 0, 0)

    pipeline = [
        {"$match": {"created_at": {"$gte": start_of_day}}},
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$grand_total"},
                "total_bills": {"$sum": 1},
                "total_tax": {"$sum": "$total_tax"},
                "total_discount": {"$sum": "$overall_discount"}
            }
        }
    ]

    result = await db["bills"].aggregate(pipeline).to_list(length=1)

    if not result:
        return {
            "date": start_of_day.strftime("%Y-%m-%d"),
            "total_revenue": 0.0,
            "total_bills": 0,
            "total_tax": 0.0,
            "total_discount": 0.0
        }

    data = result[0]
    data["date"] = start_of_day.strftime("%Y-%m-%d")
    del data["_id"]
    return data


@router.get("/revenue-trend")
async def get_revenue_trend(
    days: int = Query(30, ge=1, le=365, description="Number of historical days to analyze"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    _user=Depends(allow_management)
):
    """
    Returns daily revenue and total invoice count over the specified period.
    Suitable for Line/Bar charts.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "total_revenue": {"$sum": "$grand_total"},
                "total_orders": {"$sum": 1},
                "avg_order_value": {"$avg": "$grand_total"}
            }
        },
        {"$sort": {"_id": 1}},
        {
            "$project": {
                "_id": 0,
                "date": "$_id",
                "revenue": {"$round": ["$total_revenue", 2]},
                "orders": "$total_orders",
                "average_order_value": {"$round": ["$avg_order_value", 2]}
            }
        }
    ]

    result = await db["bills"].aggregate(pipeline).to_list(length=days)
    return {"period_days": days, "data": result}


@router.get("/top-selling-items")
async def get_top_selling_items(
    limit: int = Query(10, ge=1, le=50, description="Top N items to fetch"),
    days: Optional[int] = Query(None, ge=1, le=365, description="Filter by recent N days"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    _user=Depends(allow_management)
):
    """
    Aggregates product sales across transactions to return top-performing items.
    """
    pipeline = []
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        pipeline.append({"$match": {"created_at": {"$gte": start_date}}})

    pipeline.extend([
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.product_id",
                "product_name": {"$first": "$items.product_name"},
                "total_quantity_sold": {"$sum": "$items.quantity"},
                "total_revenue": {"$sum": "$items.total_price"}
            }
        },
        {"$sort": {"total_quantity_sold": -1}},
        {"$limit": limit},
        {
            "$project": {
                "_id": 0,
                "product_id": "$_id",
                "product_name": 1,
                "quantity_sold": "$total_quantity_sold",
                "revenue": {"$round": ["$total_revenue", 2]}
            }
        }
    ])

    result = await db["bills"].aggregate(pipeline).to_list(length=limit)
    return {"limit": limit, "data": result}


@router.get("/payment-modes")
async def get_payment_mode_distribution(
    days: Optional[int] = Query(30, ge=1, le=365, description="Filter by recent N days"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    _user=Depends(allow_management)
):
    """
    Returns breakdown of payment methods (Cash, UPI, Card) by revenue and orders.
    Suitable for Pie/Donut charts.
    """
    pipeline = []
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        pipeline.append({"$match": {"created_at": {"$gte": start_date}}})

    pipeline.extend([
        {
            "$group": {
                "_id": "$payment_mode",
                "count": {"$sum": 1},
                "total_amount": {"$sum": "$grand_total"}
            }
        },
        {"$sort": {"total_amount": -1}},
        {
            "$project": {
                "_id": 0,
                "payment_mode": "$_id",
                "transaction_count": "$count",
                "total_revenue": {"$round": ["$total_amount", 2]}
            }
        }
    ])

    result = await db["bills"].aggregate(pipeline).to_list(length=10)
    return {"period_days": days, "data": result}


@router.get("/summary-cards")
async def get_dashboard_summary(
    db: AsyncIOMotorDatabase = Depends(get_database),
    _user=Depends(allow_management)
):
    """
    Returns high-level KPI card metrics for dashboard overview.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    revenue_pipeline = [
        {
            "$facet": {
                "total": [
                    {"$group": {"_id": None, "revenue": {"$sum": "$grand_total"}, "orders": {"$sum": 1}}}
                ],
                "today": [
                    {"$match": {"created_at": {"$gte": today_start}}},
                    {"$group": {"_id": None, "revenue": {"$sum": "$grand_total"}, "orders": {"$sum": 1}}}
                ]
            }
        }
    ]
    revenue_stats = await db["bills"].aggregate(revenue_pipeline).to_list(length=1)

    total_data = revenue_stats[0]["total"][0] if revenue_stats[0]["total"] else {"revenue": 0, "orders": 0}
    today_data = revenue_stats[0]["today"][0] if revenue_stats[0]["today"] else {"revenue": 0, "orders": 0}

    low_stock_count = await db["products"].count_documents({
        "$expr": {"$lte": ["$stock_quantity", "$reorder_level"]}
    })
    total_customers = await db["customers"].count_documents({})

    return {
        "today_revenue": round(today_data["revenue"], 2),
        "today_orders": today_data["orders"],
        "total_revenue": round(total_data["revenue"], 2),
        "total_orders": total_data["orders"],
        "low_stock_items_count": low_stock_count,
        "total_customers": total_customers
    }


# ==========================================
# 2. ML Sales Prediction & Forecasting Endpoints
# ==========================================

@router.post("/predict-sales", response_model=SalesPredictionResponse)
async def predict_product_sales(
    payload: SalesPredictionRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Predict daily sales demand, revenue, and recommended inventory reorder levels using Scikit-Learn.
    """
    if ObjectId.is_valid(payload.product_id):
        product = await db["products"].find_one({"_id": ObjectId(payload.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{payload.product_id}' not found."
            )

    input_dict = payload.model_dump()
    pred_qty, pred_rev, recommended_reorder, confidence = ml_service.predict(input_dict)

    return SalesPredictionResponse(
        product_id=payload.product_id,
        predicted_daily_units=pred_qty,
        predicted_daily_revenue=pred_rev,
        recommended_reorder_level=recommended_reorder,
        confidence_score=confidence,
        model_version=ml_service.version
    )


@router.post("/retrain-model", status_code=status.HTTP_200_OK)
async def trigger_model_retrain(_user=Depends(allow_management)):
    """Trigger background re-training pipeline and reload model weights."""
    import subprocess
    import sys

    try:
        subprocess.Popen(
            [sys.executable, "scripts/train_sales_model.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return {"message": "Model retraining pipeline initiated asynchronously."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger retraining pipeline: {str(e)}"
        )