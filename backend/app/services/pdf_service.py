import io
import qrcode
from datetime import datetime
from typing import Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    HRFlowable,
)


def generate_qr_code_image(payment_url_or_upi: str) -> io.BytesIO:
    """Generate a QR code image buffer from a payment link or UPI URI string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(payment_url_or_upi)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1E293B", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def generate_bill_pdf(bill_data: Dict[str, Any]) -> io.BytesIO:
    """Generate a styled PDF invoice stream with an embedded payment QR code."""
    pdf_buffer = io.BytesIO()
    
    # Document Setup
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY_COLOR = colors.HexColor("#1E3A8A")  # Navy Blue
    SECONDARY_COLOR = colors.HexColor("#475569") # Slate Grey
    ACCENT_BG = colors.HexColor("#F1F5F9")       # Light Grey Background

    # Typography Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=24,
        leading=28,
        textColor=PRIMARY_COLOR,
        fontName="Helvetica-Bold",
    )

    header_right_style = ParagraphStyle(
        "HeaderRight",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        alignment=2, # Right aligned
        textColor=SECONDARY_COLOR,
    )

    body_bold = ParagraphStyle(
        "BodyBold",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0F172A"),
    )

    body_normal = ParagraphStyle(
        "BodyNormal",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontSize=10,
        leading=12,
        fontName="Helvetica-Bold",
        textColor=colors.white,
    )

    # -------------------------------------------------------------
    # 1. Header Section (Company Name & Invoice Metadata)
    # -------------------------------------------------------------
    invoice_number = bill_data.get("invoice_number", "INV-0000")
    created_at = bill_data.get("created_at")
    date_str = created_at.strftime("%Y-%m-%d %H:%M") if isinstance(created_at, datetime) else str(created_at or datetime.now().strftime("%Y-%m-%d %H:%M"))

    header_data = [
        [
            Paragraph("<b>BillNova Store</b><br/><font size=8 color='#64748B'>Retail & Inventory Solutions</font>", title_style),
            Paragraph(f"<b>INVOICE</b><br/>#{invoice_number}<br/>Date: {date_str}", header_right_style),
        ]
    ]

    header_table = Table(header_data, colWidths=[3.5 * inch, 3.5 * inch])
    header_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ])
    )
    story.append(header_table)
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_COLOR, spaceAfter=15))

    # -------------------------------------------------------------
    # 2. Customer Details Section
    # -------------------------------------------------------------
    cust_name = bill_data.get("customer_name", "Walk-in Customer")
    cust_phone = bill_data.get("customer_phone", "N/A")
    payment_mode = bill_data.get("payment_mode", "CASH").upper()

    customer_info = [
        [
            Paragraph("<b>Billed To:</b>", body_bold),
            Paragraph("<b>Payment Info:</b>", body_bold),
        ],
        [
            Paragraph(f"Name: {cust_name}<br/>Phone: {cust_phone}", body_normal),
            Paragraph(f"Mode: {payment_mode}<br/>Status: <font color='#16A34A'><b>PAID</b></font>", body_normal),
        ]
    ]

    cust_table = Table(customer_info, colWidths=[3.5 * inch, 3.5 * inch])
    cust_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(cust_table)
    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 3. Itemized Products Table
    # -------------------------------------------------------------
    table_data = [
        [
            Paragraph("Item Description", table_header_style),
            Paragraph("Qty", table_header_style),
            Paragraph("Unit Price", table_header_style),
            Paragraph("Total", table_header_style),
        ]
    ]

    items = bill_data.get("items", [])
    for item in items:
        p_name = item.get("name", "Product")
        qty = item.get("quantity", 1)
        unit_p = item.get("unit_price", 0.0)
        tot_p = item.get("total_amount", qty * unit_p)

        table_data.append([
            Paragraph(p_name, body_normal),
            Paragraph(str(qty), body_normal),
            Paragraph(f"₹{unit_p:.2f}", body_normal),
            Paragraph(f"₹{tot_p:.2f}", body_normal),
        ])

    items_table = Table(table_data, colWidths=[3.5 * inch, 1.0 * inch, 1.25 * inch, 1.25 * inch])
    items_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ACCENT_BG]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ])
    )
    story.append(items_table)
    story.append(Spacer(1, 15))

    # -------------------------------------------------------------
    # 4. Summary & Dynamic Payment QR Code Section
    # -------------------------------------------------------------
    subtotal = bill_data.get("subtotal", 0.0)
    tax_amount = bill_data.get("tax_amount", 0.0)
    discount_amount = bill_data.get("discount_amount", 0.0)
    grand_total = bill_data.get("grand_total", 0.0)

    # Generate UPI Payment Payload for QR Code
    upi_payload = f"upi://pay?pa=billnova@store&pn=BillNovaStore&am={grand_total:.2f}&cu=INR&tn=Invoice_{invoice_number}"
    qr_buffer = generate_qr_code_image(upi_payload)
    qr_img = RLImage(qr_buffer, width=1.2 * inch, height=1.2 * inch)

    summary_text = f"""
    <b>Subtotal:</b> ₹{subtotal:.2f}<br/>
    <b>Tax (GST):</b> +₹{tax_amount:.2f}<br/>
    <b>Discount:</b> -₹{discount_amount:.2f}<br/>
    <hr color="#CBD5E1"/>
    <font size=12 color="#1E3A8A"><b>Grand Total: ₹{grand_total:.2f}</b></font>
    """

    summary_table_data = [
        [
            qr_img,
            Paragraph("<font size=8 color='#64748B'>Scan to pay / verify invoice</font>", body_normal),
            Paragraph(summary_text, ParagraphStyle("SummaryRight", parent=body_normal, alignment=2, leading=16)),
        ]
    ]

    summary_table = Table(summary_table_data, colWidths=[1.3 * inch, 2.2 * inch, 3.5 * inch])
    summary_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ])
    )
    story.append(summary_table)
    story.append(Spacer(1, 25))

    # Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=SECONDARY_COLOR, spaceAfter=10))
    story.append(Paragraph("Thank you for shopping with BillNova! For questions, email support@billnova.com", header_right_style))

    # Build Document
    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer