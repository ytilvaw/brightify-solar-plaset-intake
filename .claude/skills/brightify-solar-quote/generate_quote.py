#!/usr/bin/env python3
"""
Brightify Solar - Quote/Estimate PDF Generator
------------------------------------------------
Usage:
    python3 generate_quote.py input.json output.pdf
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
LOGO_PATH = os.path.join(SCRIPT_DIR, "assets", "logo_cropped.jpg")
PRICE_LIST_PATH = os.path.join(SCRIPT_DIR, "price_list.json")

ORANGE_HEADER = HexColor("#F2A55C")
GREY_LABEL = HexColor("#8A8A8A")
GREY_LINE = HexColor("#DDDDDD")
GREY_BOX = HexColor("#F2F2F2")
LINK_BLUE = HexColor("#3B6FD4")
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

    try:
        img = ImageReader(LOGO_PATH)
        iw, ih = img.getSize()
        target_w = 1.1 * inch
        target_h = target_w * ih / iw
        top_gap = 0.2 * inch
        logo_y = top_y - top_gap - target_h
        c.drawImage(img, MARGIN_L - 6, logo_y, width=target_w, height=target_h, mask="auto")
    except Exception:
        c.setFont("Helvetica-Bold", 16)
        c.drawString(MARGIN_L, top_y - 20, "BRIGHTIFY")

    c.setFont("Helvetica", 26)
    c.setFillColor(DARK)
    title = doc.get("doc_type", "ESTIMATE").upper()
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 8, title)

    c.setFont("Helvetica", 9)
    c.setFillColor(LINK_BLUE)
    email = company.get("email", "")
    email_x = PAGE_W - MARGIN_R
    email_y = top_y - 26
    c.drawRightString(email_x, email_y, email)
    if email:
        email_w = c.stringWidth(email, "Helvetica", 9)
        c.setStrokeColor(LINK_BLUE)
        c.setLineWidth(0.5)
        c.line(email_x - email_w, email_y - 1.5, email_x, email_y - 1.5)
        c.linkURL(f"mailto:{email}", (email_x - email_w, email_y - 2, email_x, email_y + 9), relative=0)

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(DARK)
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 42, company.get("name", ""))
    c.setFont("Helvetica", 9)
    c.setFillColor(GREY_LABEL)
    c.drawRightString(PAGE_W - MARGIN_R, top_y - 55, company.get("address", ""))

    website = company.get("website", "")
    if website:
        website_y = top_y - 68
        website_label = website.replace("https://", "").replace("http://", "").rstrip("/")
        c.setFont("Helvetica", 9)
        c.setFillColor(LINK_BLUE)
        c.drawRightString(PAGE_W - MARGIN_R, website_y, website_label)
        website_w = c.stringWidth(website_label, "Helvetica", 9)
        c.setStrokeColor(LINK_BLUE)
        c.setLineWidth(0.5)
        c.line(PAGE_W - MARGIN_R - website_w, website_y - 1.5, PAGE_W - MARGIN_R, website_y - 1.5)
        c.linkURL(website, (PAGE_W - MARGIN_R - website_w, website_y - 2, PAGE_W - MARGIN_R, website_y + 9), relative=0)

    return top_y - 1.55 * inch


def draw_divider(c, y):
    c.setStrokeColor(GREY_LINE)
    c.setLineWidth(0.75)
    c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)


def compute_totals(doc):
    items = doc.get("items", [])
    subtotal = sum(item["qty"] * item["price"] for item in items)
    credits = doc.get("credits", [])
    credit_total = sum(c.get("amount", 0) for c in credits)
    shipping = doc.get("shipping", 0) or 0
    tax = doc.get("tax", 0) or 0
    grand_total = subtotal - credit_total + shipping + tax
    return {"subtotal": subtotal, "credit_total": credit_total, "shipping": shipping, "tax": tax, "grand_total": grand_total}


def draw_bill_to_block(c, doc, y):
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY_LABEL)
    c.drawString(MARGIN_L, y, "BILL TO")
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(DARK)
    c.drawString(MARGIN_L, y - 15, doc.get("bill_to", ""))

    label_x = PAGE_W - MARGIN_R - 2.6 * inch
    value_x = PAGE_W - MARGIN_R - 8
    rows = [
        (f"{doc.get('doc_type', 'Estimate').title()} Number:", str(doc.get("estimate_number", ""))),
        (f"{doc.get('doc_type', 'Estimate').title()} Date:", doc.get("date", "")),
        ("Valid Until:", doc.get("valid_until", "")),
    ]
    ry = y
    for label, value in rows:
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(label_x + 1.0 * inch, ry, label)
        c.setFont("Helvetica", 9)
        c.drawRightString(value_x, ry, value)
        ry -= 15

    grand_total = compute_totals(doc)["grand_total"]
    c.setFillColor(GREY_BOX)
    box_h = 16
    c.rect(label_x - 6, ry - 4, value_x - label_x + 6, box_h, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(label_x + 1.0 * inch, ry, f"Grand Total ({doc.get('currency', 'USD')}):")
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(value_x, ry, money(grand_total))

    return y - 55


def wrap_text(c, text, font, size, max_width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if c.stringWidth(test, font, size) > max_width and line:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)
    return lines


def draw_items_table(c, doc, y):
    col_item_x = MARGIN_L + 8
    col_qty_x = MARGIN_L + CONTENT_W * 0.58
    col_price_x = MARGIN_L + CONTENT_W * 0.78
    col_amount_x = PAGE_W - MARGIN_R - 8
    item_col_width = col_qty_x - col_item_x - 14
    bullet_col_width = item_col_width - 10

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
    line_h = 11
    bullet_line_h = 12
    top_pad = 13

    for item in doc.get("items", []):
        name_lines = wrap_text(c, item["name"], "Helvetica-Bold", 9.5, item_col_width)
        bullets = item.get("bullets", [])
        bullet_wrapped = []
        for b in bullets:
            wrapped = wrap_text(c, b, "Helvetica", 9, bullet_col_width)
            bullet_wrapped.append(wrapped)

        content_h = len(name_lines) * line_h
        for wrapped in bullet_wrapped:
            content_h += len(wrapped) * bullet_line_h
        row_h = max(24, content_h + top_pad + 4)

        y -= row_h
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 9.5)
        text_y = y + row_h - 17
        first_line_y = text_y
        for line in name_lines:
            c.drawString(col_item_x, text_y, line)
            text_y -= line_h

        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#4A4A4A"))
        for wrapped in bullet_wrapped:
            for j, line in enumerate(wrapped):
                prefix = u"\u2022 " if j == 0 else "  "
                c.drawString(col_item_x + 6, text_y, prefix + line)
                text_y -= bullet_line_h

        mid_y = first_line_y
        c.setFont("Helvetica", 9.5)
        c.setFillColor(DARK)
        c.drawCentredString(col_qty_x, mid_y, str(item["qty"]))
        c.drawRightString(col_price_x + 0.55 * inch, mid_y, money(item["price"]))
        amount = item["qty"] * item["price"]
        c.setFont("Helvetica-Bold", 9.5)
        c.drawRightString(col_amount_x, mid_y, money(amount))
        c.setStrokeColor(GREY_LINE)
        c.setLineWidth(0.5)
        c.line(MARGIN_L, y, PAGE_W - MARGIN_R, y)

    return y


def draw_totals(c, doc, y):
    totals = compute_totals(doc)
    value_x = PAGE_W - MARGIN_R - 8

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
        c.drawRightString(value_x - 1.6 * inch, y, f"{credit.get('label', 'Discount')}:")
        c.drawRightString(value_x, y, f"(${credit.get('amount', 0):,.2f})")

    y -= 16
    c.setFont("Helvetica", 9.5)
    c.setFillColor(DARK)
    c.drawRightString(value_x - 1.6 * inch, y, "Shipping:")
    c.drawRightString(value_x, y, money(totals["shipping"]))

    y -= 16
    c.setFont("Helvetica", 9.5)
    c.setFillColor(DARK)
    c.drawRightString(value_x - 1.6 * inch, y, "Tax:")
    c.drawRightString(value_x, y, money(totals["tax"]))

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
    if isinstance(notes, str):
        note_items = [notes]
    else:
        note_items = notes

    y -= 40
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColor(DARK)
    c.drawString(MARGIN_L, y, "Notes / Terms")
    y -= 14

    max_width = CONTENT_W - 12
    for note in note_items:
        c.setFont("Helvetica", 8.5)
        c.setFillColor(GREY_LABEL)
        words = note.split()
        line = ""
        first_line = True
        for word in words:
            test = f"{line} {word}".strip()
            if c.stringWidth(test, "Helvetica", 8.5) > max_width and line:
                prefix = u"\u2022 " if first_line else "  "
                c.drawString(MARGIN_L, y, prefix + line)
                y -= 12
                line = word
                first_line = False
            else:
                line = test
        if line:
            prefix = u"\u2022 " if first_line else "  "
            c.drawString(MARGIN_L, y, prefix + line)
            y -= 12
        y -= 3
    return y


def draw_signature_block(c, y):
    y -= 50
    c.setFont("Helvetica", 8.5)
    c.setFillColor(GREY_LABEL)
    ack_text = "I acknowledge receipt of the above item(s) in good condition."
    c.drawString(MARGIN_L, y, ack_text)
    y -= 35

    line_w = 2.6 * inch
    c.setStrokeColor(GREY_LINE)
    c.setLineWidth(0.75)
    c.line(MARGIN_L, y, MARGIN_L + line_w, y)
    c.line(MARGIN_L + line_w + 0.4 * inch, y, MARGIN_L + line_w + 0.4 * inch + 1.6 * inch, y)

    c.setFont("Helvetica", 8)
    c.setFillColor(GREY_LABEL)
    c.drawString(MARGIN_L, y - 12, "Customer Signature")
    c.drawString(MARGIN_L + line_w + 0.4 * inch, y - 12, "Date")
    return y - 12


def draw_footer(c):
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY_LABEL)
    company = load_company()
    email = company.get("email", "")
    phone = company.get("phone", "")
    prefix = f"{company.get('name', '')}  |  {phone}  |  "
    center_x = PAGE_W / 2
    footer = prefix + email
    full_w = c.stringWidth(footer, "Helvetica", 8)
    start_x = center_x - full_w / 2
    c.drawString(start_x, 0.5 * inch, prefix)
    prefix_w = c.stringWidth(prefix, "Helvetica", 8)
    email_x = start_x + prefix_w
    c.setFillColor(LINK_BLUE)
    c.drawString(email_x, 0.5 * inch, email)
    if email:
        email_w = c.stringWidth(email, "Helvetica", 8)
        c.setStrokeColor(LINK_BLUE)
        c.setLineWidth(0.5)
        c.line(email_x, 0.5 * inch - 1.5, email_x + email_w, 0.5 * inch - 1.5)
        c.linkURL(f"mailto:{email}", (email_x, 0.5 * inch - 2, email_x + email_w, 0.5 * inch + 8), relative=0)


def upload_to_s3(file_path):
    """
    Uploads the given file to S3. Requires boto3 and AWS credentials.
    Configure via environment variables (recommended, keeps the key out of
    this script):
        AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY
        AWS_DEFAULT_REGION      (e.g. us-west-1)
        BRIGHTIFY_S3_BUCKET     (your bucket name)
    Silently skipped if BRIGHTIFY_S3_BUCKET isn't set, so this has zero
    effect until you configure it. Returns the S3 URL on success, or None.
    """
    bucket = os.environ.get("BRIGHTIFY_S3_BUCKET")
    if not bucket:
        return None
    try:
        import boto3
        s3 = boto3.client("s3")
        key = f"quotes/{os.path.basename(file_path)}"
        s3.upload_file(file_path, bucket, key)
        region = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
        print(f"Uploaded to S3: {url}")
        return url
    except Exception as e:
        print(f"S3 upload skipped/failed: {e}")
        return None


def upload_to_gdrive(file_path):
    """
    Uploads the given file to Google Drive via a service account.
    Configure via environment variables:
        GDRIVE_SERVICE_ACCOUNT_JSON   path to your service-account key file
        GDRIVE_FOLDER_ID              the Drive folder to upload into (optional —
                                       uploads to the service account's root if omitted)
    Setup (one-time, in Google Cloud Console):
        1. Create a project -> enable "Google Drive API".
        2. Create a Service Account -> create a JSON key for it -> download it.
        3. In Google Drive, share the destination folder with the service
           account's email address (looks like xxx@xxx.iam.gserviceaccount.com),
           giving it Editor access — service accounts have no storage of
           their own, so the file lands in a folder YOU own that you've
           shared with it.
        4. Set GDRIVE_SERVICE_ACCOUNT_JSON to the path of the downloaded key,
           and GDRIVE_FOLDER_ID to that folder's ID (the string after
           /folders/ in its Drive URL).
    Requires: pip install google-api-python-client google-auth --break-system-packages
    Silently skipped if GDRIVE_SERVICE_ACCOUNT_JSON isn't set. Returns the
    Drive file's webViewLink on success, or None.
    """
    key_path = os.environ.get("GDRIVE_SERVICE_ACCOUNT_JSON")
    if not key_path:
        return None
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload

        creds = service_account.Credentials.from_service_account_file(
            key_path, scopes=["https://www.googleapis.com/auth/drive.file"]
        )
        service = build("drive", "v3", credentials=creds)

        file_metadata = {"name": os.path.basename(file_path)}
        folder_id = os.environ.get("GDRIVE_FOLDER_ID")
        if folder_id:
            file_metadata["parents"] = [folder_id]

        media = MediaFileUpload(file_path, mimetype="application/pdf")
        uploaded = service.files().create(
            body=file_metadata, media_body=media, fields="id, webViewLink"
        ).execute()

        link = uploaded.get("webViewLink")
        print(f"Uploaded to Google Drive: {link}")
        return link
    except Exception as e:
        print(f"Google Drive upload skipped/failed: {e}")
        return None


def upload_to_dropbox(file_path):
    """
    Uploads the given file to Dropbox.
    Configure via environment variables — pick ONE of these two setups:

    A) Permanent (recommended): OAuth2 refresh token. The SDK auto-mints a
       fresh short-lived access token from this on every run, so it never
       needs manual renewal.
        DROPBOX_APP_KEY        your app's key (App Console > Settings)
        DROPBOX_APP_SECRET     your app's secret (App Console > Settings)
        DROPBOX_REFRESH_TOKEN  a refresh token for your account (see below)

       One-time setup at https://www.dropbox.com/developers/apps:
        1. Create an app (Scoped access; "App folder" is fine unless you
           want it to land in a specific existing folder).
        2. Under Permissions, enable files.content.write and
           sharing.write (needed for the shared link). Save changes.
        3. Get an authorization code — open this URL in a browser (swap in
           your app key), approve access, and copy the code shown:
             https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&response_type=code&token_access_type=offline
        4. Exchange it for a refresh token:
             curl https://api.dropboxapi.com/oauth2/token \
               -d code=<AUTH_CODE> \
               -d grant_type=authorization_code \
               -d client_id=<APP_KEY> \
               -d client_secret=<APP_SECRET>
           The JSON response's "refresh_token" field is permanent — set it
           as DROPBOX_REFRESH_TOKEN, along with DROPBOX_APP_KEY/SECRET.

    B) Quick/temporary: a raw access token from the App Console's "Generate
       access token" button. Expires in ~4 hours — fine for a one-off test,
       not for ongoing use.
        DROPBOX_ACCESS_TOKEN   short-lived access token

    Also optional either way:
        DROPBOX_FOLDER_PATH    destination folder path (default
                                "/Brightify Quotes")

    Requires: pip install dropbox --break-system-packages
    Silently skipped if neither setup is configured, so this has zero
    effect until you set it up. Returns a shared link on success, or None.
    """
    refresh_token = os.environ.get("DROPBOX_REFRESH_TOKEN")
    app_key = os.environ.get("DROPBOX_APP_KEY")
    app_secret = os.environ.get("DROPBOX_APP_SECRET")
    access_token = os.environ.get("DROPBOX_ACCESS_TOKEN")

    if not (refresh_token and app_key and app_secret) and not access_token:
        return None
    try:
        import dropbox as dbx_sdk

        if refresh_token and app_key and app_secret:
            dbx = dbx_sdk.Dropbox(
                oauth2_refresh_token=refresh_token,
                app_key=app_key,
                app_secret=app_secret,
            )
        else:
            dbx = dbx_sdk.Dropbox(access_token)

        folder = os.environ.get("DROPBOX_FOLDER_PATH", "/Brightify Quotes").rstrip("/")
        dest_path = f"{folder}/{os.path.basename(file_path)}"

        with open(file_path, "rb") as f:
            dbx.files_upload(f.read(), dest_path, mode=dbx_sdk.files.WriteMode.overwrite)

        try:
            link = dbx.sharing_create_shared_link_with_settings(dest_path).url
        except dbx_sdk.exceptions.ApiError:
            existing = dbx.sharing_list_shared_links(path=dest_path, direct_only=True).links
            link = existing[0].url if existing else dest_path

        print(f"Uploaded to Dropbox: {link}")
        return link
    except Exception as e:
        print(f"Dropbox upload skipped/failed: {e}")
        return None


def generate(doc, output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    y = draw_header(c, doc)
    draw_divider(c, y)
    y -= 20
    y = draw_bill_to_block(c, doc, y)
    y = draw_items_table(c, doc, y)
    y = draw_totals(c, doc, y)
    y = draw_notes(c, doc, y)
    if doc.get("signature_block"):
        draw_signature_block(c, y)
    draw_footer(c)
    c.showPage()
    c.save()
    print(f"Wrote {output_path}")
    upload_to_s3(output_path)
    upload_to_gdrive(output_path)
    upload_to_dropbox(output_path)


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
