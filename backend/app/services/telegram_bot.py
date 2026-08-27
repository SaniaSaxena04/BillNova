import logging
import httpx
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)
from app.config import settings

logger = logging.getLogger(__name__)

# Base internal URL for API requests
API_BASE_URL = f"http://127.0.0.1:{settings.PORT}"


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command and display help menu."""
    welcome_text = (
        "🤖 **BillNova POS & Inventory Bot**\n\n"
        "Available Commands:\n"
        "• `/lowstock` - List products at or below low stock threshold\n"
        "• `/invoice <bill_id>` - Fetch invoice details by Bill ID\n"
        "• `/summary` - Get today's sales summary\n"
        "• `/help` - Show this message"
    )
    await update.message.reply_text(welcome_text, parse_mode="Markdown")


async def low_stock_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /lowstock command - Query API for low stock products."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/products/low-stock")
            if response.status_code != 200:
                await update.message.reply_text("❌ Failed to fetch low stock items from API.")
                return

            products = response.json()
            if not products:
                await update.message.reply_text("✅ All inventory stock levels are healthy!")
                return

            message = "⚠️ **LOW STOCK ALERTS** ⚠️\n\n"
            for item in products:
                message += (
                    f"📦 **{item.get('name')}**\n"
                    f"   ├ Barcode: `{item.get('barcode', 'N/A')}`\n"
                    f"   ├ Current Stock: *{item.get('stock_quantity', 0)}*\n"
                    f"   └ Reorder Level: {item.get('reorder_level', 10)}\n\n"
                )

            await update.message.reply_text(message, parse_mode="Markdown")

        except Exception as e:
            logger.error(f"Telegram Bot error in /lowstock: {e}")
            await update.message.reply_text("❌ Error connecting to BillNova API server.")


async def invoice_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /invoice <bill_id> command - Lookup bill details."""
    if not context.args:
        await update.message.reply_text("⚠️ Please provide a Bill ID.\nExample: `/invoice 65f1a2b3c4d5e6f7a8b9c0d1`", parse_mode="Markdown")
        return

    bill_id = context.args[0]

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/billing/{bill_id}")
            if response.status_code == 404:
                await update.message.reply_text(f"❌ Invoice `{bill_id}` not found.", parse_mode="Markdown")
                return
            elif response.status_code != 200:
                await update.message.reply_text("❌ Error retrieving invoice.")
                return

            bill = response.json()
            items_str = ""
            for item in bill.get("items", []):
                items_str += f"  • {item.get('product_name')} x{item.get('quantity')} = ${item.get('total_price', 0):.2f}\n"

            message = (
                f"🧾 **Invoice #{bill.get('invoice_number', 'N/A')}**\n"
                f"👤 Customer: *{bill.get('customer_name', 'Walk-in Customer')}*\n"
                f"💳 Payment Mode: *{bill.get('payment_mode', 'N/A')}*\n"
                f"📅 Date: {bill.get('created_at', '')[:10]}\n\n"
                f"**Items Purchased:**\n{items_str}\n"
                f"💵 Subtotal: ${bill.get('subtotal', 0):.2f}\n"
                f"📊 Tax: ${bill.get('total_tax', 0):.2f}\n"
                f"🏷️ Discount: ${bill.get('overall_discount', 0):.2f}\n"
                f"💰 **Grand Total: ${bill.get('grand_total', 0):.2f}**"
            )

            await update.message.reply_text(message, parse_mode="Markdown")

        except Exception as e:
            logger.error(f"Telegram Bot error in /invoice: {e}")
            await update.message.reply_text("❌ Error connecting to BillNova API server.")


async def send_low_stock_broadcast(items: list) -> None:
    """Standalone async function to push immediate notifications to the configured Telegram Chat ID."""
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token":
        logger.warning("Telegram Bot Token not configured. Skipping alert broadcast.")
        return

    if not settings.TELEGRAM_CHAT_ID:
        logger.warning("Telegram Chat ID not configured. Skipping alert broadcast.")
        return

    message = "🚨 **AUTOMATIC LOW STOCK ALERT** 🚨\n\n"
    for item in items:
        message += (
            f"📦 **{item.get('name')}**\n"
            f"   Current Quantity: *{item.get('stock_quantity', 0)}*\n"
            f"   Reorder Threshold: {item.get('reorder_level', 10)}\n\n"
        )

    telegram_url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                telegram_url,
                json={
                    "chat_id": settings.TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "Markdown",
                },
            )
        except Exception as e:
            logger.error(f"Failed to send Telegram low stock alert broadcast: {e}")


def setup_telegram_bot() -> Application:
    """Build and initialize the Telegram Bot Application."""
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token":
        logger.warning("Telegram Bot Token missing. Telegram service will remain disabled.")
        return None

    app = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()

    # Register Command Handlers
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", start_command))
    app.add_handler(CommandHandler("lowstock", low_stock_command))
    app.add_handler(CommandHandler("invoice", invoice_command))

    return app