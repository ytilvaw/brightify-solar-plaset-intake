---
name: brightify-solar-quote
description: Use this skill whenever Yash asks to create, generate, or draft a solar equipment quote, estimate, or price proposal for Brightify Solar / Brightify Group LLC. Triggers include "make a quote for...", "quote out this order", "create an estimate for [customer]", or requests that mention pricing panels, racking, inverters, batteries, installation, etc. for a customer. Looks up prices from the Brightify price list and outputs a branded PDF matching the company's estimate format.
---

# Brightify Solar - Quote Generator

## What this does
Builds a branded PDF quote/estimate (logo, company info, itemized table, subtotal,
credits, grand total, notes) matching Brightify's existing estimate format, and
looks up equipment prices from `price_list.json`.

## Files
- `generate_quote.py` — renders the PDF from a JSON spec (reportlab-based).
- `price_list.json` — cached copy of the Brightify Solar price list (panels,
  racking, electrical, installation, planset). **Re-pull the live Google Sheet
  before trusting these prices for a real quote** — the sheet is the source of
  truth: https://docs.google.com/spreadsheets/d/1w2RzHKHuDrhuK8QeRAiPDaKzRqiFkUVwRhYzMMNgWeI
- `assets/logo.jpg` — Brightify logo used in the PDF header.
- `sample_input.json` — example input matching Yash's existing estimate #31.

## How to build a quote

1. **Get the request details** from the user: customer name, which panel model
   (or "tier 1 panels" generic), quantity, and any other line items (racking,
   electrical, installation, design planset, discounts/credits).

2. **Look up pricing**:
   - Re-fetch the Google Sheet (web_fetch on the sheet URL) if it's been a
     while, since prices change. Otherwise use `price_list.json` as a cache.
   - Pick the correct price tier based on quantity:
     - Retail sheet: 1-10 units → `price_1_10`, 10-20 → `price_10_20`,
       20+ → `price_20plus`.
     - Wholesale sheet (36-panel pallet MOQ): use `price_per_panel` per unit,
       or `price_pallet` for a full pallet.
   - For racking/electrical/installation/planset, use `other_items` in
     `price_list.json` as defaults unless the user gives different numbers —
     these aren't in the live sheet yet, so confirm with Yash if unsure.

3. **Build the JSON input** (see `sample_input.json` for the exact shape):
   ```json
   {
     "doc_type": "ESTIMATE",
     "estimate_number": "<next number, ask Yash or increment>",
     "date": "<today, human readable>",
     "valid_until": "<default: 30 days from date>",
     "bill_to": "<customer name>",
     "items": [ {"name": "...", "qty": N, "price": P}, ... ],
     "credits": [ {"label": "...", "amount": X}, ... ],
     "notes": "<any terms, e.g. permit responsibility>"
   }
   ```

4. **Generate the PDF**:
   ```bash
   python3 generate_quote.py input.json /mnt/user-data/outputs/<Customer>_Estimate_<number>.pdf
   ```

5. **Present the file** to the user with `present_files`.

## Notes
- Amounts are `qty * price` per line; `credits` are subtracted from the
  subtotal to get the grand total (matches Yash's existing "Planset credit"
  pattern).
- Keep item names on one line — the renderer doesn't wrap the item column,
  only the notes section wraps.
- If Yash wants an INVOICE instead of an ESTIMATE, just set `"doc_type": "INVOICE"`.
