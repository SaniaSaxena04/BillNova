import httpx
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from telegram_bot.config import API_BASE_URL, ALLOWED_CHAT_IDS

router = Router()

def is_authorized(user_id: int) -> bool:
    """Check if caller ID matches whitelist (if whitelist is defined)."""
    if not ALLOWED_CHAT_IDS:
        return True
    return user_id in ALLOWED_CHAT_IDS


@router.message(Command("start", "help"))
async def send_welcome(message: Message):
    if not is_authorized(message.from_user.id):
        await message.answer("⚠️ Unauthorized access.")
        return

    help_text = (
        "🤖 <b>Welcome to BillNova Admin Bot</b>\n\n"
        "Available Commands:\n"
        "📈 /sales - Get today's live sales summary\n"
        "⚠️ /lowstock - Check products below reorder threshold\n"
        "❓ /help - View command list"
    )
    await message.answer(help_text, parse_mode="HTML")


@router.message(Command("sales"))
async def get_sales_report(message: Message):
    if not is_authorized(message.from_user.id):
        return

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_BASE_URL}/analytics/summary/today")
            if res.status_code != 200:
                await message.answer("❌ Failed to retrieve sales summary from server.")
                return

            data = res.json()
            report_msg = (
                f"📊 <b>Sales Summary ({data['date']})</b>\n\n"
                f"💰 <b>Total Revenue:</b> ${data['total_revenue']:,.2f}\n"
                f"🧾 <b>Total Invoices:</b> {data['total_bills']}\n"
                f"🏷️ <b>Total Discounts Given:</b> ${data['total_discount']:,.2f}\n"
                f"🏛️ <b>Total Tax Collected:</b> ${data['total_tax']:,.2f}"
            )
            await message.answer(report_msg, parse_mode="HTML")

        except Exception as e:
            await message.answer(f"⚠️ Error communicating with server: {str(e)}")


@router.message(Command("lowstock"))
async def get_low_stock_report(message: Message):
    if not is_authorized(message.from_user.id):
        return

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_BASE_URL}/products/low-stock")
            if res.status_code != 200:
                await message.answer("❌ Failed to fetch stock status.")
                return

            products = res.json()
            if not products:
                await message.answer("✅ <b>All items are well stocked!</b>", parse_mode="HTML")
                return

            msg = "⚠️ <b>Low Stock Inventory Alert</b>\n\n"
            for item in products:
                msg += (
                    f"📦 <b>{item['name']}</b> (Barcode: <code>{item['barcode']}</code>)\n"
                    f"   Available: <b>{item['stock_quantity']} {item['unit_of_measure']}</b> "
                    f"(Threshold: {item['reorder_level']})\n\n"
                )

            await message.answer(msg, parse_mode="HTML")

        except Exception as e:
            await message.answer(f"⚠️ Error fetching low stock items: {str(e)}")