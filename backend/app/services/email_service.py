import logging
from email.message import EmailMessage
from typing import List, Dict, Any
import aiosmtplib

from app.config import settings

logger = logging.getLogger("fastapi")


async def send_email_async(
    subject: str,
    recipient_email: str,
    html_content: str
) -> bool:
    """Send an HTML email asynchronously via SMTP."""
    message = EmailMessage()
    message["From"] = settings.EMAILS_FROM_EMAIL
    message["To"] = recipient_email
    message["Subject"] = subject
    message.set_content(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info(f"Low stock alert email successfully sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return False


async def check_and_notify_low_stock(low_stock_items: List[Dict[str, Any]]):
    """
    Background worker task to build an HTML report and dispatch
    low stock alerts to the store manager.
    """
    if not low_stock_items:
        return

    items_html = "".join([
        f"<tr>"
        f"<td style='padding:8px;border:1px solid #ddd;'>{item.get('name')}</td>"
        f"<td style='padding:8px;border:1px solid #ddd;'>{item.get('barcode', 'N/A')}</td>"
        f"<td style='padding:8px;border:1px solid #ddd;color:red;'><b>{item.get('stock_quantity')}</b></td>"
        f"</tr>"
        for item in low_stock_items
    ])

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #dc2626;">⚠️ Low Stock Inventory Alert</h2>
        <p>The following items have dropped below the inventory threshold ({settings.DEFAULT_LOW_STOCK_THRESHOLD} units):</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product Name</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Barcode</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {items_html}
          </tbody>
        </table>
        <p style="margin-top:20px;">Please reorder these items as soon as possible to prevent stockouts.</p>
      </body>
    </html>
    """

    subject = f"⚠️ Low Stock Alert: {len(low_stock_items)} item(s) require reordering"
    await send_email_async(
        subject=subject,
        recipient_email=settings.ALERT_RECIPIENT_EMAIL,
        html_content=html_content
    )