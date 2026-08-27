import os
import joblib
import pandas as pd
from typing import Dict, Any, Tuple

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models", "sales_forecaster.joblib")


class SalesPredictorService:
    def __init__(self):
        self.model = None
        self.metrics = {}
        self.version = "1.0.0"
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                payload = joblib.load(MODEL_PATH)
                self.model = payload.get("model")
                self.metrics = payload.get("metrics", {})
                self.version = payload.get("version", "1.0.0")
                print(f"✅ ML Sales Model v{self.version} loaded successfully.")
            except Exception as e:
                print(f"⚠️ Error loading ML model: {e}")
        else:
            print(f"⚠️ ML model file not found at {MODEL_PATH}. Run training script first.")

    def predict(self, input_data: Dict[str, Any]) -> Tuple[float, float, int, float]:
        if not self.model:
            # Fallback heuristic calculation if model file hasn't been generated yet
            base_qty = input_data.get("historical_avg_daily_qty", 10.0)
            mult = 1.2 if input_data.get("is_weekend") else 1.0
            predicted_qty = max(1.0, round(base_qty * mult, 2))
            predicted_rev = round(predicted_qty * input_data["unit_price"], 2)
            reorder_level = int(predicted_qty * 3)
            return predicted_qty, predicted_rev, reorder_level, 0.75

        features_df = pd.DataFrame([{
            "unit_price": input_data["unit_price"],
            "day_of_week": input_data["day_of_week"],
            "month": input_data["month"],
            "is_weekend": 1 if input_data["is_weekend"] else 0,
            "is_promotional": 1 if input_data["is_promotional"] else 0,
            "historical_avg_daily_qty": input_data["historical_avg_daily_qty"]
        }])

        predicted_qty = float(self.model.predict(features_df)[0])
        predicted_qty = max(0.0, round(predicted_qty, 2))
        predicted_rev = round(predicted_qty * input_data["unit_price"], 2)
        recommended_reorder = int(np.ceil(predicted_qty * 3))  # 3-day buffer stock
        
        confidence = float(self.metrics.get("r2", 0.85))
        return predicted_qty, predicted_rev, recommended_reorder, confidence


ml_service = SalesPredictorService()