---
name: brightify-solar-quote
description: Use this skill whenever Yash asks to create, generate, or draft a solar equipment quote, estimate, or price proposal for Brightify Solar / Brightify Group LLC. Triggers include "make a quote for...", "quote out this order", "create an estimate for [customer]", or requests that mention pricing panels, racking, inverters, batteries, installation, etc. for a customer. Looks up prices from the Brightify price list and outputs a branded PDF matching the company's estimate format.
---

# Brightify Solar - Quote Generator

## What this does
Builds a branded PDF quote/estimate (logo, company info, itemized table, subtotal,
credits, shipping, tax, grand total, notes) matching Brightify's existing estimate
format, and looks up equipment prices from `price_list.json`.

## Files
- `generate_quote.py` — renders the PDF from a JSON spec (reportlab-based).
  Optionally uploads the result to S3, Google Drive, or Dropbox after
  writing it — each is a no-op unless its env vars are set (see the
  docstrings on `upload_to_s3` / `upload_to_gdrive` / `upload_to_dropbox`
  in the script). For Dropbox, either set `DROPBOX_ACCESS_TOKEN` directly,
  or set `DROPBOX_REFRESH_TOKEN` + `DROPBOX_APP_KEY` + `DROPBOX_APP_SECRET`
  to have it auto-refresh (access tokens expire in ~4 hours; the refresh
  token doesn't, so this avoids re-authing before every run). Both paths
  also accept `DROPBOX_FOLDER` (optional, defaults to `/Quotes`).
- `price_list.json` — cached copy of the Brightify Solar price list: panels
  (retail + wholesale), inverters, batteries, plus racking/electrical/
  installation/planset defaults. **Re-pull the live Google Sheet before
  trusting these prices for a real quote** — the sheet is the source of
  truth and has 4 tabs (panels, inverter, Batteries, racking/mounting):
  - Panels: https://docs.google.com/spreadsheets/d/1w2RzHKHuDrhuK8QeRAiPDaKzRqiFkUVwRhYzMMNgWeI/edit?usp=drive_link
  - Inverter: https://docs.google.com/spreadsheets/d/1w2RzHKHuDrhuK8QeRAiPDaKzRqiFkUVwRhYzMMNgWeI/edit?gid=1098488535#gid=1098488535
  - Battery: https://docs.google.com/spreadsheets/d/1w2RzHKHuDrhuK8QeRAiPDaKzRqiFkUVwRhYzMMNgWeI/edit?gid=93426633#gid=93426633
  - Racking/mounting: not yet captured — ask Yash for the tab link if a quote needs it.
- `assets/logo_cropped.jpg` — tightly-cropped Brightify logo used in the PDF header.
- `assets/logo.jpg` — original uncropped logo (backup).

## Before generating the PDF — always confirm first

Never jump straight to generating the PDF. Before running `generate_quote.py`:

1. **If no customer name was given**, ask for one — it's required for the
   "Bill To" field.
2. **Ask whether a breakdown is needed**, if not already specified:
   - **Breakdown needed**: show each line item separately — panels,
     inverter, battery, installation, racking, electrical, planset, etc.
   - **Breakdown not needed**: collapse everything into a **single line
     item**. The item `name` (the top-level title) must follow this pattern:
     `<system size in kW> <Brand> System with <battery/inverter summary>,
     <total storage in kWh> Storage` — using whichever brand is the
     defining hardware (inverter brand if it's a standard inverter, or the
     battery brand if the battery is the headline product, e.g. "Tesla" for
     a Powerwall-based system). Examples:
       - "10kW Tesla System with 1 Powerwall 3, 13.5kWh Storage"
       - "7.2kW EG4 System with 2x Ruixu Batteries, 32kWh Storage"
       - "5kW Enphase System" (if no battery — omit the storage clause)
     Keep it to one line, roughly matching the length/style of these
     examples. Then put each sub-item (panels, inverter, battery,
     installation, racking, electrical, planset, etc.) on its own bulleted
     line via the `bullets` array (each string becomes one bulleted sub-line
     under the title). Do NOT put sub-item prices in the bullets — only the
     combined total price appears, as qty 1 × the summed price. No
     per-item prices are broken out on the PDF itself.
3. **Always show the full itemized breakdown** (each line item/part, qty,
   unit price, and the grand total) in the chat as a table, and **wait for
   the user's explicit approval before running `generate_quote.py`** —
   regardless of whether the PDF itself will show a breakdown or a single
   collapsed line. The chat confirmation should always be itemized so Yash
   can verify the math, even if the PDF output will hide it. Never
   generate the PDF on the same turn as showing the table — always stop
   and wait for a reply first.

This applies to every quote, not just complex ones — including
racking-only quotes (see "Racking-only quote" below).

## Notes field — only include what's explicitly instructed

Do NOT invent or auto-generate notes beyond what these rules explicitly
call for. The only notes that should ever appear are:
- The installation disclaimer (when installation is included — see rule 3).
- The owner-builder disclaimer (when installation is included — see rule 3).
- The solar design planset disclaimer (when a planset is included — see rule 4).
- Anything the user explicitly asks to be added as a note/term.

Do NOT add commentary like panel sizing math, "panel brand based on
availability," or roof-type reminders as notes unless the user asked for it
— that kind of detail belongs in the line item name/bullets, not invented
as a note.

## How to build a quote

1. **Get the request details** from the user: customer name, which panel
   model (or "tier 1 panels" generic), quantity, and any other line items
   (racking, electrical, installation, design planset, discounts/credits,
   shipping, tax).

2. **Look up pricing**:
   - Re-fetch the Google Sheet (web_fetch on the sheet URL) if it's been a
     while, since prices change. Otherwise use `price_list.json` as a cache.
   - **Default panel rule**: if the user doesn't name a specific panel brand/
     model, use `default_panel` in `price_list.json`:
       - Standard size (default) → flat **$165/panel**, regardless of quantity.
       - If the user clearly says **"big panels"** (large-format, e.g.
         585W+) → flat **$195/panel** instead, unless the user gives a
         different price.
       - Neither rate gets the quantity-tier discount applied.
     Label the line item with `display_name` from that entry
     ("Tier 1 solar panels (brand based on availability - Trina, JA Solar,
     Jinko, Znshine, Sunplus, Risen, etc.)") rather than naming one brand,
     since the actual brand shipped depends on stock at order time.
   - If the user DOES name a specific brand/model, use the normal quantity
     tier pricing from the sheet (20+ / 10-20 / 1-10 retail tiers, or
     wholesale pallet pricing) and label it with that brand/model.
   - Inverters and batteries: look up by brand/model in `inverters` /
     `batteries` arrays. Note Tesla Powerwall 3 appears in both (it's an
     all-in-one hybrid inverter + battery) — don't double-count it as two
     separate line items unless the customer is buying a standalone inverter
     AND a separate battery.
   - **Tesla system default add-ons**: whenever a **Tesla Powerwall** system
     is quoted, automatically add:
       - **1x Backup Switch** using `other_items.tesla_backup_switch` ($480)
       - **1x Tesla MCI2 for every 2 panels** (round up) using
         `other_items.tesla_mci2_per_2_panels` ($40/unit) — e.g. 23 panels
         → ceil(23/2) = 12 units.
     Only omit either if the user explicitly says not to include it.
   - **SolarEdge optimizer rule**: whenever a SolarEdge inverter/system is
     quoted, **add one optimizer per panel by default** as its own line
     item (qty = panel count), using `other_items.solaredge_optimizer_per_panel`:
       - Standard panel → $80/optimizer
       - Big panel → $110/optimizer
     Only omit this if the user explicitly says not to include optimizers.
   - **EG4 Tigo rapid shutdown rule**: whenever an **EG4** system is quoted
     **with installation included**, add one Tigo rapid shutdown device per
     panel by default as its own line item (qty = panel count), using
     `other_items.tigo_rapid_shutdown_per_panel` ($55/panel). Only omit
     this if the user explicitly says not to include it. Does not apply to
     EG4 quotes without installation.
   - For racking/electrical/installation/planset, use `other_items` in
     `price_list.json` as defaults unless the user gives different numbers —
     these aren't in the live sheet yet, so confirm with Yash if unsure.

3. **Installation pricing rule** (apply automatically based on what the user says):
   - **If installation is included** in the quote:
     - Installation, panel labor: **$450 per panel** for standard-size
       panels if panel count is **10 or more**; **$500 per panel** for
       standard-size panels if panel count is **fewer than 10**. Big panels
       remain **$600 per panel** regardless of count.
     - Installation, battery add-on:
       - **Ruixu** battery → **$750 per battery**
       - **Tesla Powerwall** → **$1,000 per battery unit** (Powerwall +
         each expansion pack each count as one unit)
       - All other battery brands → **$500 per battery**
       This is on top of the per-panel labor cost above. Combine into a
       single Installation line item total (panel labor + battery add-on),
       still shown as qty = panel count with `price` = the computed total
       ÷ qty, OR — if that doesn't divide cleanly — use qty = 1 with
       `price` = the full computed installation total. Prefer whichever
       keeps the line item clean and accurate.
     - Racking hardware and electrical hardware line items always use
       qty = 1, with the `price` field set to the computed total
       (per-panel rate × panel count) — do NOT set qty to the panel count
       for these two items.
     - Racking hardware: per-panel rate depends on roof type —
       - Flat tile roof → `$125/panel`
       - Shingle roof → `$125/panel`
       - Metal roof, concrete tile, or anything else/unspecified → `$150/panel`
       - **SolarEdge or Enphase system** → add `other_items.module_attachment_kit_per_panel`
         ($3/panel) on top of the roof-type rate above (fold into the same
         racking hardware line item total — do not add it as a separate
         line item). Does not apply to other inverter brands.
     - Electrical hardware: `$70 per panel`
     - **Solar design planset is included by default** whenever installation
       is included — see the Solar design planset rule below for pricing
       ($300 without battery / $400 with battery) and the required
       disclaimer note. Only omit it if the user explicitly says not to
       include it.
     - If the user says installation is included but doesn't give a roof
       type, ask before generating the quote (racking price depends on it).
     - **Always append an installation disclaimer to the `notes` field**
       (in addition to any other notes): "Installation pricing reflected in
       this estimate is approximate. The final installation cost will be
       confirmed following an in-person site visit or a review of
       photos/video of the property." Adjust wording slightly to fit
       naturally with any other notes, but the substance must always be
       included whenever installation is part of the quote.
     - **Always append an owner-builder disclaimer to the `notes` field**
       as well: "Customer will act as owner-builder contractor and is
       responsible for working with the city to obtain any required permits
       and pay associated fees." Keep as its own separate bullet point (see
       "Before generating the PDF" rules — each note is its own array entry).
   - **If installation is NOT included** (materials-only / customer self-installs):
     - Do NOT add a racking hardware line item.
     - Do NOT add an electrical hardware line item.
     - Only include panels (and inverter/battery if requested), UNLESS the
       user explicitly asks for racking/electrical anyway — honor explicit
       requests over this default suppression rule (still ask for roof
       type if racking is explicitly requested but not specified). Tesla
       default add-ons (Backup Switch, MCI2) still apply regardless of
       installation status.

4. **Solar design planset rule**: whenever a solar design/planset line item
   is included in the quote, price it using `other_items.solar_design_planset`
   in `price_list.json`:
     - No battery in the system → **$300**
     - Battery included in the system → **$400**
   **Always append this disclaimer to the `notes` field** as its own
   separate bullet point: "Brightify provides solar planset design drafting
   services. A structural/electrical engineer should be consulted for
   stamped designs." Adjust wording slightly to fit naturally, but the
   substance must always be included.

5. **Discount rule**: if the user mentions a discount, add it to the
   `credits` array (e.g. `{"label": "Discount", "amount": 500.00}`). It
   renders as its own line item between Subtotal and Shipping/Tax, shown
   with the amount in parentheses to indicate it's subtracted, e.g.
   `($500.00)`. Multiple discounts/credits can be listed separately if the
   user gives more than one.

6. **Build the JSON input**:
   ```json
   {
     "doc_type": "ESTIMATE",
     "estimate_number": "<next number, ask Yash or increment>",
     "date": "<today, human readable>",
     "valid_until": "<default: 30 days from date>",
     "bill_to": "<customer name>",
     "items": [ {"name": "...", "qty": N, "price": P, "bullets": ["...", "..."]}, ... ],
     "credits": [ {"label": "Discount", "amount": X}, ... ],
     "shipping": 0,
     "tax": 0,
     "notes": ["Each distinct note/term as its own string in this array."]
   }
   ```
   `shipping` and `tax` each render as their own line item after the
   subtotal (and after any credits). Both default to `0` unless the user
   specifies an amount. `notes` is always a list of separate strings, one
   per distinct point — never one merged paragraph. `bullets` is only used
   on no-breakdown quotes' single collapsed line item.

7. **Generate the PDF** — filename must be descriptive, customer name
   first, underscores instead of spaces, and a brief system/equipment
   summary so Yash can identify the quote without opening it. Pattern:
   `<Customer>_<brief_system_description>_Estimate_<number>.pdf`. Examples:
   - `Sailesh_7kW_EG4_2xRuixu32kWh_Estimate_37.pdf`
   - `Adam_25xRisen450W_PanelsOnly_Estimate_40.pdf`
   Keep the description short (system size, key inverter/battery brand,
   panel-only vs full install) — just enough to identify the quote at a
   glance in a file listing.
   ```bash
   python3 generate_quote.py input.json /mnt/user-data/outputs/<Customer>_<description>_Estimate_<number>.pdf
   ```

8. **Present the file** to the user with `present_files`.

## Racking-only quote (SnapNRack materials, no panels/inverter/battery)

When the user asks for a **racking quote only** (just the SnapNRack UR-45
mounting hardware, not a full system), use `snapnrack_racking_parts.parts`
in `price_list.json` instead of the normal panel/inverter/battery flow.

1. **Get panel count and roof type** from the user (or the quantities
   directly, if they give them — always prefer explicit quantities the
   user provides over estimating).
2. **If estimating quantities**, assume a single rail row spanning all
   panels, portrait orientation (panel width ≈ 44.65in, i.e. the
   `dimension` width already used elsewhere in this file), and apply:
   - **Row length (ft)** = panel_count × 44.65in ÷ 12 (ignore small
     inter-panel gaps — not material to a quote-level estimate).
   - **UR-45 Rails (172in = 14.33ft each)**: 2 rail lines (top + bottom) ×
     `ceil(row_length_ft / 14.33)` rails per line.
   - **Splices**: 2 × (`rails_per_line` − 1) — one per joint, on both rail
     lines. Zero if only 1 rail per line is needed.
   - **Mid clamps**: 2 × (panel_count − 1) — one per panel-to-panel joint,
     on both rail lines.
   - **End clamps**: 4 — one at each end of each of the 2 rail lines,
     regardless of panel count.
   - **Roof attachments** (spaced ~4ft/48in on-center along each rail
     line, minimum 2 per line): `attachments_per_line` =
     `ceil(row_length_ft / 4) + 1`; total = 2 × `attachments_per_line`.
     Pick the mount type from the roof type mentioned:
     - **Shingle** (or composition/wood decking) roof → **UltraFoot Anchor**.
     - **Tile** roof (concrete/clay) → **Adjustable Tile Hook (USA)**.
     - **Metal** roof → **Metal Roof Attachment** ($15/each).
     - Anything else/unspecified → ask the user; don't guess a mount type.
     - **Always add 1 Ultrafoot Structural Screw per mount**, regardless of
       which of the three mount types above was used.
   - **Grounding**: 1 OmniLug per rail row (i.e. 1 per system for a
     single-row array; add 1 more per additional row if the user
     describes a multi-row layout).
   These are quoting-level estimates, not a stamped structural layout —
   say so if the user seems to want an as-built BOM rather than a price
   estimate.
3. **Show the itemized quantity breakdown in chat as a table** (part name,
   qty, unit price, line total) and **wait for the user's explicit
   approval before running `generate_quote.py`** — same standing rule as
   every other quote (see "Before generating the PDF" above), never
   skipped for racking-only quotes. Call out that quantities are estimated
   (if estimated, not given directly) and could shift once a real
   layout/site visit is done.
4. **Never print the SKU/part number on the PDF** — only `name`, `qty`,
   `price` per the `parts` entries above (the `sku` field is for internal
   lookup only). This applies to every quote, not just racking-only ones.
5. Build the JSON input the same way as any other quote (see "Build the
   JSON input" above) — `doc_type: "ESTIMATE"`, one line item per part.
   No installation/electrical/planset line items apply here since this is
   materials-only racking hardware, not a full install.
6. **Upload the PDF to Dropbox** — `generate_quote.py` already calls
   `upload_to_dropbox` unconditionally after writing every PDF (same as
   any other quote type), so no extra step is needed as long as the
   Dropbox env vars are set; just confirm the upload URL came back in the
   script's output and surface it to the user alongside the PDF.

## Notes
- Amounts are `qty * price` per line; `credits` subtract from the subtotal.
- Long item names auto-wrap in the Items column; bullets also auto-wrap.
- If Yash wants an INVOICE instead of an ESTIMATE, set `"doc_type": "INVOICE"`.
  Similarly, for a customer pickup confirmation, use `"doc_type": "PICKUP
  RECEIPT"` and set `"signature_block": true` in the JSON — this adds an
  acknowledgment line ("I acknowledge receipt of the above item(s) in good
  condition.") plus a Customer Signature line and Date line below the
  totals. Only add `signature_block` when Yash asks for a signature/
  acknowledgment — it's off by default.
- Panel sizing: divide requested kW by 450W (standard) or the actual
  wattage of the named panel to get panel count; round to the nearest
  whole number that best approximates the requested system size.
