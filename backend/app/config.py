import secrets
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "BillNova API"
    DEBUG: bool = True
    PORT: int = 8000

    # Database
    MONGODB_URL: str

    # Security & Authentication
    SECRET_KEY: str = secrets.token_hex(32)  # Generates a default fallback key if missing
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # SMTP & Email Notifications
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "saxenasania0235@gmail.com"
    SMTP_PASSWORD: str = "vpag dhoe fyxs vyry"
    EMAILS_FROM_EMAIL: str = "saxenasania0235@gmail.com"
    ALERT_RECIPIENT_EMAIL: str = "saxenasania0235@gmail.com"

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = "8769032389:AAGsfPx6zqpFSQJW20177eaWgLNSOtiEQ2o"
    TELEGRAM_CHAT_ID: str = "8740033234"

    # Inventory Thresholds
    DEFAULT_LOW_STOCK_THRESHOLD: int = 10

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()