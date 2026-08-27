import asyncio
import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from motor.motor_asyncio import AsyncIOMotorClient

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "billnova_db")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "sales_forecaster.joblib")


async def train_and_export_model():
    print("🚀 Fetching historical sales transactions from MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Pipeline to extract item-level daily sales metrics
    pipeline = [
        {"$unwind": "$items"},
        {
            "$project": {
                "created_at": 1,
                "product_id": "$items.product_id",
                "quantity": "$items.quantity",
                "unit_price": "$items.unit_price",
                "total_amount": "$items.total_amount",
            }
        }
    ]

    bills_cursor = db.bills.aggregate(pipeline)
    records = await bills_cursor.to_list(length=10000)

    if len(records) < 20:
        print("⚠️ Insufficient live data in DB. Generating synthetic baseline dataset for initial model training...")
        np.random.seed(42)
        n_samples = 1200
        data = {
            "unit_price": np.random.uniform(5.0, 100.0, n_samples),
            "day_of_week": np.random.randint(0, 7, n_samples),
            "month": np.random.randint(1, 13, n_samples),
            "is_weekend": np.random.choice([0, 1], n_samples),
            "is_promotional": np.random.choice([0, 1], n_samples),
            "historical_avg_daily_qty": np.random.uniform(2.0, 50.0, n_samples),
        }
        df = pd.DataFrame(data)
        # Target variable with domain logic relations
        df["quantity_sold"] = (
            df["historical_avg_daily_qty"] * 0.7
            + df["is_weekend"] * 3.5
            + df["is_promotional"] * 5.0
            - (df["unit_price"] * 0.05)
            + np.random.normal(0, 2, n_samples)
        ).clip(lower=0)
    else:
        df = pd.DataFrame(records)
        df["created_at"] = pd.to_datetime(df["created_at"])
        df["day_of_week"] = df["created_at"].dt.dayofweek
        df["month"] = df["created_at"].dt.month
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
        df["is_promotional"] = 0
        df["historical_avg_daily_qty"] = df.groupby("product_id")["quantity"].transform("mean")
        df["quantity_sold"] = df["quantity"]

    X = df[[
        "unit_price", 
        "day_of_week", 
        "month", 
        "is_weekend", 
        "is_promotional", 
        "historical_avg_daily_qty"
    ]]
    y = df["quantity_sold"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("🧠 Training Random Forest Regressor Model...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    r2 = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)

    print(f"✅ Model Training Complete!")
    print(f"📊 R² Score: {r2:.4f} | MAE: {mae:.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    metadata = {
        "model": model,
        "metrics": {"r2": r2, "mae": mae},
        "trained_at": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
    joblib.dump(metadata, MODEL_PATH)
    print(f"💾 Model saved successfully at: {os.path.abspath(MODEL_PATH)}")


if __name__ == "__main__":
    asyncio.run(train_and_export_model())