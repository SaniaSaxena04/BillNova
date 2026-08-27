import asyncio
import logging
import httpx
from aiogram import Bot, Dispatcher
from telegram_bot.config import BOT_TOKEN, API_BASE_URL, ALLOWED_CHAT_IDS
from telegram_bot.handlers import reports

logging.basicConfig(level=logging.INFO)

async def check_and_notify_low_stock(bot: Bot):
    """Periodic task running every 30 minutes to broadcast alerts for critical stock."""
    while True:
        try:
            if ALLOWED_CHAT_IDS:
                async with httpx.AsyncClient() as client:
                    res = await client.get(f"{API_BASE_URL}/products/low-stock")
                    if res.status_code == 200:
                        products = res.json()
                        if products:
                            alert_msg = f"🚨 <b>Automated Alert:</b> {len(products)} item(s) are running critically low on stock!"
                            for chat_id in ALLOWED_CHAT_IDS:
                                await bot.send_message(chat_id, alert_msg, parse_mode="HTML")
        except Exception as err:
            logging.error(f"Low stock monitoring error: {err}")

        # Sleep for 30 minutes (1800 seconds)
        await asyncio.sleep(1800)


async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()

    # Register handlers
    dp.include_router(reports.router)

    # Launch periodic low-stock background checker
    asyncio.create_task(check_and_notify_low_stock(bot))

    print("🤖 Telegram Bot is starting polling...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())