#!/usr/bin/env python3
"""
Brightify Solar - Quote/Estimate PDF Generator
------------------------------------------------
Usage:
    python3 generate_quote.py input.json output.pdf

input.json shape:
{
  "doc_type": "ESTIMATE",          # or "QUOTE" / "INVOICE"
  "estimate_number": "32",
  "date": "August 14, 2026",
  "valid_until": "September 14, 2026",
  "bill_to": "Customer Name",
  "items": [
    {"name": "Tier 1 solar panels (JA, Jinko, Sunplus...)", "qty": 16, "price": 165.00},
    {"name": "Racking hardware", "qty": 16, "price": 100.00},
    {"name": "Electrical hardware", "qty": 1, "price": 1470.00},
    {"name": "Installation", "qty": 1, "price": 7900.00}
  ],
  "credits": [
    {"label": "Planset credit", "amount": 300.00}
  ],
  "notes": "Free text notes / terms shown at the bottom of the quote."
}

Any "credits" are subtracted from the subtotal to get the grand total,
matching the reference Brightify estimate format.
"""

import json
import sys
import os

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(SCRIPT_DIR, "assets", "logo.jpg")
PRICE_LIST_PATH = os.path.join(SCRIPT_DIR, "price_list.json")

# Brand palette (sampled from the Brightify logo gradient / reference estimate)
ORANGE = HexColor("#F2A155")
ORANGE_HEADER = HexColor("#F2A55C")
GREY_LABEL = HexColor("#8A8A8A")
GREY_LINE = HexColor("#DDDDDD")
GREY_BOX = HexColor("#F2F2F2")
DARK = HexColor("#1A1A1A")

PAGE_W, PAGE_H = letter
MARGIN_L = 0.55 * inch
MARGIN_R = 0.55 * inch
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R


def load_company():
    with open(PRICE_LIST_PATH) as f:
        data = json.load(f)
    return data.get("company", {})


def money(v):
    return f"${v:,.2f}"


def draw_header(c, doc):
    company = load_company()
    top_y = PAGE_H - 0.6 * inch

    # Logo top-left
    try:
        img = ImageReader(LOGO_PATH)
        iw, ih = img.getSize()
        target_w = 1.5 * inch
        target_h = target_w * ih / iw
        c.drawImage(img, MARGIN_L, top_y - target_h, width=target_w, height=target_h, mask="auto")
    except Exception:
        c.setFont("Helvetica-Bold", 16)
        c.drawString(MARGIN_L, top_y - 20, "BRIGHTIFY")

    # Doc title top-right
    c.setFont("Helvetica", 26)
    c.setFillColor(DARK)
    title = doc.get("doc_type", "ESTIMATE").upper()
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 8, title)

    c.setFont("Helvetica", 9)
    c.setFillColor(GREY_LABEL)
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 26, company.get("email", ""))

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(DARK)
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 42, company.get("name", ""))
    c.setFont("Helvetica", 9)
    c.setFillColor(GREY_LABEL)
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 55, company.get("address", ""))

    return top_y - 1.15 * inch  # y position after header block


def draw_divider(c, y):
    c.setStrokeColor(GREY_LINE)
    c.setLineWidth(0.75)
    c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)


def draw_bill_to_block(c, doc, y):
    # Left: BILL TO
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY_LABEL)
    c.drawString(MARGIN_L, y, "BILL TO")
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(DARK)
    c.drawString(MARGIN_L, y - 15, doc.get("bill_to", ""))

    # Right: meta rows
    label_x = PAGE_W - MARGIN_R - 2.6 * inch
    value_x = PAGE_W - MARGIN_R
    rows = [
        (f"{doc.get('doc_type', 'Estimate').title()} Number:", str(doc.get("estimate_number", ""))),
        (f"{doc.get('doc_type', 'Estimate').title()} Date:", doc.get("date", "")),
        ("Valid Until:", doc.get("valid_until", "")),
    ]
    ry = y
    c.setFont("Helvetica-Bold", 9)
    for label, value in rows:
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(label_x + 1.55 * inch, ry, label)
        c.setFont("Helvetica", 9)
        c.drawString(label_x + 1.65 * inch, ry, value)
        ry -= 15

    grand_total = compute_totals(doc)["grand_total"]
    c.setFillColor(GREY_BOX)
    box_h = 16
    c.rect(label_x - 6, ry - 4, value_x - label_x + 6, box_h, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(label_x + 1.55 * inch, ry, f"Grand Total ({doc.get('currency', 'USD')}):")
    c.setFont("Helvetica-Bold", 9)
    c.drawString(label_x + 1.65 * inch, ry, money(grand_total))

    return y - 55


def compute_totals(doc):
    items = doc.get("items", [])
    subtotal = sum(item["qty"] * item["price"] for item in items)
    credits = doc.get("credits", [])
    credit_total = sum(c.get("amount", 0) for c in credits)
    grand_total = subtotal - credit_total
    return {"subtotal": subtotal, "credit_total": credit_total, "grand_total": grand_total}


def draw_items_table(c, doc, y):
    col_item_x = MARGIN_L + 8
    col_qty_x = MARGIN_L + CONTENT_W * 0.58
    col_price_x = MARGIN_L + CONTENT_W * 0.78
    col_amount_x = PAGE_W - MARGIN_R - 8

    header_h = 22
    c.setFillColor(ORANGE_HEADER)
    c.rect(MARGIN_L, y - header_h, CONTENT_W, header_h, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col_item_x, y - header_h + 7, "Items")
    c.drawCentredString(col_qty_x, y - header_h + 7, "Quantity")
    c.drawRightString(col_price_x + 0.55 * inch, y - header_h + 7, "Price")
    c.drawRightString(col_amount_x, y - header_h + 7, "Amount")

    y -= header_h
    row_h = 24
    c.setFont("Helvetica-Bold", 9.5)
    for item in doc.get("items", []):
        y -= row_h
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 9.5)
        # wrap long item names simply if needed
        name = item["name"]
        c.drawString(col_item_x, y + 7, name[:78])
        c.setFont("Helvetica", 9.5)
        c.drawCentredString(col_qty_x, y + 7, str(item["qty"]))
        c.drawRightString(col_price_x + 0.55 * inch, y + 7, money(item["price"]))
        amount = item["qty"] * item["price"]
        c.setFont("Helvetica-Bold", 9.5)
        c.drawRightString(col_amount_x, y + 7, money(amount))
        c.setStrokeColor(GREY_LINE)
        c.setLineWidth(0.5)
        c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)

    return y


def draw_totals(c, doc, y):
    totals = compute_totals(doc)
    label_x = PAGE_W - MARGIN_R - 2.3 * inch
    value_x = PAGE_W - MARGIN_R

    y -= 20
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColor(DARK)
    c.drawRightString(value_x - 1.6 * inch, y, "Subtotal:")
    c.setFont("Helvetica", 9.5)
    c.drawRightString(value_x, y, money(totals["subtotal"]))

    for credit in doc.get("credits", []):
        y -= 16
        c.setFont("Helvetica", 9.5)
        c.setFillColor(DARK)
        c.drawRightString(value_x - 1.6 * inch, y, f"{credit.get('label', 'Credit')}:")
        c.drawRightString(value_x, y, f"(${credit.get('amount', 0):,.2f})")

    y -= 10
    c.setStrokeColor(GREY_LINE)
    c.line(value_x - 2.3 * inch, y, value_x, y)

    y -= 16
    c.setFont("Helvetica-Bold", 10.5)
    c.drawRightString(value_x - 1.6 * inch, y, f"Grand Total ({doc.get('currency', 'USD')}):")
    c.drawRightString(value_x, y, money(totals["grand_total"]))

    return y


def draw_notes(c, doc, y):
    notes = doc.get("notes", "")
    if not notes:
        return y
    y -= 40
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColor(DARK)
    c.drawString(MARGIN_L, y, "Notes / Terms")
    y -= 14
    c.setFont("Helvetica", 8.5)
    c.setFillColor(GREY_LABEL)

    # simple word-wrap
    max_width = CONTENT_W
    words = notes.split()
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if c.stringWidth(test, "Helvetica", 8.5) > max_width:
            c.drawString(MARGIN_L, y, line)
            y -= 12
            line = word
        else:
            line = test
    if line:
        c.drawString(MARGIN_L, y, line)
        y -= 12
    return y


def draw_footer(c):
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY_LABEL)
    company = load_company()
    footer = f"{company.get('name', '')}  |  {company.get('phone', '')}  |  {company.get('email', '')}"
    c.drawCentredString(PAGE_W / 2, 0.5 * inch, footer)


def generate(doc, output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    y = draw_header(c, doc)
    draw_divider(c, y)
    y -= 20
    y = draw_bill_to_block(c, doc, y)
    y = draw_items_table(c, doc, y)
    y = draw_totals(c, doc, y)
    draw_notes(c, doc, y)
    draw_footer(c)
    c.showPage()
    c.save()
    print(f"Wrote {output_path}")


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 generate_quote.py input.json output.pdf")
        sys.exit(1)
    input_path, output_path = sys.argv[1], sys.argv[2]
    with open(input_path) as f:
        doc = json.load(f)
    generate(doc, output_path)


if __name__ == "__main__":
    main()
