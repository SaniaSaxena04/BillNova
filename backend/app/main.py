import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="BillNova POS API")

# Configure allowed origins for local dev and production (Vercel)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Pull Vercel URL from environment if present
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Matches any Vercel preview/production deployment URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telegram Credentials (Loads from .env with fallbacks)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8769032389:AAGsfPx6zqpFSQJW20177eaWgLNSOtiEQ2o")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "8740033234")

# Pydantic Schemas for Checkout
class OrderItem(BaseModel):
    name: str
    qty: int
    price: float

class OrderRequest(BaseModel):
    customer_name: str = "Walk-in Customer"
    items: List[OrderItem]
    total_amount: float
    payment_method: str = "Cash"

# GET Products Route
@app.get("/api/v1/products")
def get_products():
    return [
        {"id": 1, "name": "Wireless Headphones", "price": 1999.00, "stock": 42},
        {"id": 2, "name": "Smart Fitness Watch", "price": 2499.00, "stock": 18},
    ]

# POST Simple Telegram Notification Route
@app.post("/api/v1/notify-telegram")
def send_telegram_alert(message: str = "New Order Created in BillNova POS!"):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    response = requests.post(url, json=payload)
    return response.json()

# POST Checkout & Send Detailed Telegram Receipt
@app.post("/api/v1/checkout")
def process_checkout(order: OrderRequest):
    # Format receipt message for Telegram using Markdown
    item_list_str = "\n".join([f"• {item.name} x{item.qty} - ₹{item.price * item.qty:.2f}" for item in order.items])
    
    receipt_text = (
        f"🧾 *NEW INVOICE - BILLNOVA POS*\n\n"
        f"👤 *Customer:* {order.customer_name}\n"
        f"💳 *Payment:* {order.payment_method}\n"
        f"───────────────────\n"
        f"*Items Purchased:*\n{item_list_str}\n"
        f"───────────────────\n"
        f"💰 *Total Paid:* ₹{order.total_amount:.2f}\n\n"
        f"✨ *Thank you for shopping!*"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": receipt_text,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload)
        telegram_res = response.json()
    except Exception as e:
        telegram_res = {"error": str(e)}

    return {
        "status": "success",
        "message": "Order processed successfully",
        "telegram_status": telegram_res
    }