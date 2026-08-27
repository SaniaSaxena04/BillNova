import random
from datetime import datetime

def generate_invoice_number() -> str:
    """Generates unique invoice format: INV-YYYYMMDD-XXXX."""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = f"{random.randint(1000, 9999)}"
    return f"INV-{date_str}-{random_str}"

def calculate_item_financials(unit_price: float, quantity: int, discount_pct: float, tax_pct: float):
    """Calculates subtotal, discount, tax, and total for an item line."""
    gross_total = unit_price * quantity
    discount_amt = gross_total * (discount_pct / 100.0)
    taxable_amt = gross_total - discount_amt
    tax_amt = taxable_amt * (tax_pct / 100.0)
    line_total = taxable_amt + tax_amt
    
    return {
        "discount_amount": round(discount_amt, 2),
        "tax_amount": round(tax_amt, 2),
        "total_price": round(line_total, 2)
    }