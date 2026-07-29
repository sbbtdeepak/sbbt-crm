# Admin User Guide

## SBBT CRM v2 — Universal Import/Export Engine

This guide is for administrators who will use the Bulk Import/Export system. It covers how to import, export, and manage data using Excel templates.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Understanding Import Modes](#2-understanding-import-modes)
3. [Step-by-Step: Import Data](#3-step-by-step-import-data)
4. [Step-by-Step: Export Data](#4-step-by-step-export-data)
5. [Step-by-Step: Rollback Import](#5-step-by-step-rollback-import)
6. [Working with Images](#6-working-with-images)
7. [Understanding the Dry Run](#7-understanding-the-dry-run)
8. [Import Reports](#8-import-reports)
9. [Troubleshooting](#9-troubleshooting)
10. [Best Practices](#10-best-practices)

---

## 1. Quick Start

### What is Bulk Import/Export?

The Bulk Import/Export system allows you to:

- **Import** hundreds or thousands of records at once using Excel files
- **Export** existing data from the CRM into Excel for editing
- **Update** existing records in bulk
- **Rollback** an import if something goes wrong

### Where to Find It

Each module page in the dashboard has an **Import/Export bar** at the top:

```
┌──────────────────────────────────────────────────────────────────┐
│  Packages                                    [📥 Download Template] [📤 Import] [📊 Export] [📋 History] │
│                                                                  │
│  (Existing package list...)                                     │
└──────────────────────────────────────────────────────────────────┘
```

The same buttons appear for **Packages, Testimonials, Projects, Brands, Blogs, and all future modules**.

### Quick Steps

```
1. Click "Download Template" → Get official Excel file
2. Fill in your data in the Excel file
3. Click "Import" → Upload the file
4. Review the Dry Run preview → Click "Confirm Import"
5. Done!
```

---

## 2. Understanding Import Modes

When you import, you choose one of three modes:

### 2.1 Upsert (Default — Recommended)

```
🔄 UPSERT — Insert New + Update Existing

What it does:
  - Creates new records if they don't exist
  - Updates existing records if they do exist
  - Best choice for most imports

Example:
  You have 25 brands in your Excel. 20 are new, 5 already exist.
  → 20 will be inserted
  → 5 will be updated with your new data
  → 0 will be skipped
```

### 2.2 Insert Only

```
➕ INSERT ONLY — Only New Records

What it does:
  - Creates new records only
  - Skips records that already exist
  - Never modifies existing data

Use when:
  - Adding brand new data
  - You want to be absolutely sure nothing is overwritten
  - First-time import

Example:
  You have 25 brands. 20 are new, 5 already exist.
  → 20 will be inserted
  → 5 will be skipped (already exist)
  → Existing records are untouched
```

### 2.3 Update Only

```
✏️ UPDATE ONLY — Only Existing Records

What it does:
  - Updates existing records only
  - Skips records that don't exist
  - Never creates new records

Use when:
  - Correcting existing data
  - Bulk editing field values
  - Syncing changes from another system

Example:
  You have 25 brands. 20 are new, 5 already exist.
  → 0 will be inserted
  → 5 will be updated
  → 20 will be skipped (don't exist)
```

### 2.4 Mode Selection

```
┌──────────────────────────────────────────────────────────────┐
│  Import Mode:                                                │
│                                                              │
│  ○ Insert Only  — Only add new records                      │
│  ○ Update Only  — Only update existing records               │
│  ● Upsert       — Insert new + Update existing (recommended) │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Upsert mode: 20 will be inserted, 5 will be updated │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [← Back] [Next: Dry Run →]                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step: Import Data

### Step 1: Download Template

1. Go to the module page (e.g., Brands)
2. Click **"Download Template"**

```
📥 Download Template
```

3. An Excel file will download: `brands_template_2026-07-28.xlsx`

### Step 2: Fill the Template

The Excel file has two sheets:

**Sheet 1: Instructions** — Read this for column descriptions and rules.

**Sheet 2: Template** — This is where you fill your data.

```
Row 1: TEMPLATE_VERSION:1.0.0 | MODULE:brands | TEMPLATE_DATE:2026-07-28 | CRM_VERSION:v2.0.0
Row 2: name*              | category*    | website_url            | display_order | is_active | logo_image_filename
Row 3: UltraTech Cement   | Cement       | https://ultratech.com  | 1             | yes       | ultratech-logo.png
Row 4: Kajaria Tiles      | Tiles        | https://kajaria.com    | 2             | yes       | kajaria-logo.png
Row 5: JSW Steel          | Steel        |                          | 3             | yes       |
Row 6: Asian Paints       | Paint        | https://asianpaints.com | 4             | no        | asian-logo.png
```

**Tips for filling data:**

| Column Type | How to Fill | Example |
|-------------|-------------|---------|
| Text | Just type normally | "UltraTech Cement" |
| Number | Type the number only (no commas) | "1500000" |
| Price | Type numbers only | "2500000" (not ₹25 Lakh) |
| Boolean | Type "yes" or "no" | "yes" |
| Date | Use DD/MM/YYYY format | "26/07/2026" |
| URL | Include http:// or https:// | "https://example.com" |
| Email | Standard email format | "info@sbbt.in" |
| Image | Type filename only (not URL) | "ultratech-logo.png" |

**Important Rules:**

- Fields marked with `*` in the header are **mandatory**
- Do NOT rename or delete column headers
- Do NOT modify Row 1 (metadata row)
- Each row must be unique (based on the name field)
- Leave empty cells blank (don't type "N/A" or "-")

### Step 3: Upload the File

1. Click **"Import"** button

```
📤 Import
```

2. Select your filled Excel file
3. Choose your **Import Mode** (Upsert is recommended)
4. Click **"Upload & Preview"**

```
┌──────────────────────────────────────────────────────────────┐
│  Upload File                                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📄 Drag & drop file here, or click to browse        │   │
│  │  brands_filled.xlsx (2.4 KB)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Import Mode: [● Upsert] [○ Insert Only] [○ Update Only]    │
│                                                              │
│  [Upload & Preview →]                                       │
└──────────────────────────────────────────────────────────────┘
```

### Step 4: Review Dry Run Preview

The system will show you exactly what will happen — **without writing anything to the database**.

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ DRY RUN — Nothing was written to the database            │
│  Mode: Upsert │ File: brands_filled.xlsx                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Summary:                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Total Rows:     25                                  │   │
│  │  🟢 Will Insert:  20 (new brands)                    │   │
│  │  🔄 Will Update:  5 (existing brands)                │   │
│  │  ⏭️  Will Skip:    0                                  │   │
│  │  ❌ Errors:        0                                  │   │
│  │  ⚠️  Warnings:      1                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚠️  Warnings:                                               │
│  • Row 8: Brand "Asian Paints" — case differs from          │
│    existing "asian paints" in database                      │
│  • Row 12: Image "premium-logo.png" not found in            │
│    storage folder "cms/brands/"                             │
│                                                              │
│  Images: 5 found, 1 missing                                 │
│                                                              │
│  Row Details:                                                │
│  ┌─────┬──────────────────┬──────────┬────────────────────┐ │
│  │ Row │ Name             │ Action   │ Reason             │ │
│  ├─────┼──────────────────┼──────────┼────────────────────┤ │
│  │  3  │ UltraTech Cement │ 🟢 INS   │ New brand          │ │
│  │  4  │ Kajaria Tiles    │ 🟢 INS   │ New brand          │ │
│  │  5  │ JSW Steel        │ 🟢 INS   │ New brand          │ │
│  │  6  │ ACC Cement        │ 🔄 UPD   │ Name exists #12   │ │
│  │ ...│ ...              │ ...      │ ...                │ │
│  └─────┴──────────────────┴──────────┴────────────────────┘ │
│                                                              │
│  [← Back] [Cancel] [✅ Confirm Import]                      │
└──────────────────────────────────────────────────────────────┘
```

Review carefully:
- **Green (INS)** = Will be added as new
- **Blue (UPD)** = Will update an existing record
- **Yellow (SKP)** = Will be skipped (mode mismatch)
- **Red (ERR)** = Has errors, will be skipped
- **Warning icons** = Issues to know about

### Step 5: Confirm Import

If everything looks correct, click **"Confirm Import"**.

The import will process and show progress:

```
┌──────────────────────────────────────────────────────────────┐
│  Importing... 45%                                            │
│                                                              │
│  ┌━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░┐ 45%             │
│  └━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░┘                 │
│                                                              │
│  Processed: 12 / 25 rows                                     │
│  Inserted: 10 │ Updated: 2                                   │
│  Estimated time remaining: 3 seconds                        │
│                                                              │
│  [Cancel Import]                                             │
└──────────────────────────────────────────────────────────────┘
```

### Step 6: View Results

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ IMPORT COMPLETE                                           │
│                                                              │
│  Import ID: #2847                                            │
│  Module: Brands                                              │
│  Date: 28 July 2026, 14:30                                   │
│  Duration: 2.3 seconds                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Summary:                                            │   │
│  │  Total:      25 rows                                 │   │
│  │  Inserted:   20 ✓                                     │   │
│  │  Updated:    5 ✓                                      │   │
│  │  Skipped:    0                                        │   │
│  │  Failed:     0                                        │   │
│  │                                                       │   │
│  │  Images:     5 found, 1 missing ⚠️                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚠️  Warnings:                                               │
│  • Row 8: Case difference — "Asian Paints" vs "asian paints"│
│  • Row 12: Image not found — upload to cms/brands/ folder   │
│                                                              │
│  [📥 Download Report (PDF)]  [📥 Download Report (Excel)]    │
│  [↩️ Rollback This Import]  [✅ Done]                       │
└──────────────────────────────────────────────────────────────┘
```

You can now see the imported data in the module page.

---

## 4. Step-by-Step: Export Data

### Why Export?

- Take a backup of your data
- Edit data in Excel and re-import
- Share data with team members
- Audit your records

### Steps

1. Go to the module page (e.g., Brands)
2. Click **"Export"**

```
📊 Export
```

3. An Excel file downloads: `brands_export_2026-07-28.xlsx`
4. Open in Excel — all your data is there, in the same format as the template
5. Edit as needed
6. Import the edited file back (round-trip guaranteed)

**Round-trip guarantee:**
```
Export → Edit in Excel → Import = Zero data loss
```

The export file uses the exact same format as the template, so you can edit it and re-import without any issues.

---

## 5. Step-by-Step: Rollback Import

Rollback undoes a completed import. Use this if:

- You imported the wrong data
- You found errors after importing
- You changed your mind

### When Can You Rollback?

| Condition | Can Rollback? |
|-----------|---------------|
| Import completed successfully | ✅ Yes |
| Import is the most recent one | ✅ Yes |
| No newer import happened after it | ✅ Yes |
| Import is already rolled back | ❌ No |
| A newer import happened | ❌ Must rollback newer first |

### Steps

1. Click **"History"** on the module page

```
📋 History
```

2. Find the import you want to rollback

```
┌──────────────────────────────────────────────────────────────┐
│  IMPORT HISTORY — Brands                                     │
├──────┬───────────┬────────┬───────┬──────┬───────────────────┤
│ #ID  │ Date      │ Mode   │ Rows  │ User │ Status            │
├──────┼───────────┼────────┼───────┼──────┼───────────────────┤
│ 2847 │ 28/07 14:30│ Upsert│ 25   │ You  │ ✅ Complete [↩️]   │
│ 2842 │ 25/07 10:15│ Insert│ 12   │ You  │ 🔄 Rolled Back    │
│ 2838 │ 20/07 16:45│ Upsert│ 8    │ User │ ✅ Complete        │
└──────┴───────────┴────────┴───────┴──────┴───────────────────┘
```

3. Click **"↩️ Rollback"** on the latest import
4. Review the confirmation message

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  CONFIRM ROLLBACK                                         │
│                                                              │
│  You are about to rollback Import #2847                      │
│                                                              │
│  This will:                                                  │
│  • DELETE 20 newly inserted brands                           │
│  • RESTORE 5 brands to their previous values                 │
│  • NOT delete images from storage                            │
│  • NOT affect records manually edited after this import      │
│                                                              │
│  This action CANNOT BE UNDONE.                               │
│                                                              │
│  [Cancel] [Confirm Rollback]                                 │
└──────────────────────────────────────────────────────────────┘
```

5. Click **"Confirm Rollback"** to proceed

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ ROLLBACK COMPLETE                                         │
│                                                              │
│  Import #2847 has been rolled back.                          │
│                                                              │
│  • 20 brands deleted                                         │
│  • 5 brands restored to previous values                      │
│                                                              │
│  [Done]                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Working with Images

### 6.1 Uploading Images

Images are NOT included in the Excel file. Instead:

1. **Upload image files to Supabase Storage** using the Media Manager or directly
2. **In the Excel file**, type only the **filename** in the image column (e.g., `ultratech-logo.png`)
3. During import, the system looks for that filename in the storage folder

### 6.2 Storage Folder Structure

```
Bucket: cms
Folder per module:
  cms/brands/          ← Brand logos go here
  cms/testimonials/    ← Client photos go here
  cms/projects/        ← Project cover images go here
  cms/packages/        ← Package images (if any)
  cms/blogs/           ← Blog cover images
  cms/team/            ← Team member photos
```

### 6.3 Image Preview Before Import

Before confirming the import, you'll see an image preview:

```
┌──────────────────────────────────────────────────────────────┐
│  IMAGE PREVIEW                                               │
│                                                              │
│  ✅ Found (5):                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ultratech │ │ kajaria  │ │  jsw     │ │  acc     │       │
│  │-logo.png │ │-logo.png │ │-logo.png │ │-logo.png │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ⚠️ Missing (1):                                             │
│  • "premium-logo.png" — expected in folder "cms/brands/"    │
│    Upload this file before import, or ignore.                │
│                                                              │
│  [Continue anyway] [Cancel and upload images first]          │
└──────────────────────────────────────────────────────────────┘
```

### 6.4 Supported Image Formats

| Format | Supported |
|--------|-----------|
| PNG | ✅ Yes |
| JPG / JPEG | ✅ Yes |
| SVG | ✅ Yes |
| WebP | ✅ Yes |
| GIF | ❌ Not recommended |
| BMP | ❌ Not supported |

**Max file size per image: 5 MB**

### 6.5 Bulk Upload Images

For large imports, you can upload multiple images at once:

1. Go to Media Manager
2. Create folder: `cms/brands/` (or your module folder)
3. Upload all images at once (drag & drop)
4. In Excel, use the exact filename for each row

---

## 7. Understanding the Dry Run

The **Dry Run** is one of the most important features. It shows you exactly what will happen BEFORE any data is written to the database.

### What You See

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ DRY RUN — Nothing was written to the database            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Summary Counts:                                             │
│  🟢 Will Insert:  New records to be added                   │
│  🔄 Will Update:  Existing records to be modified           │
│  ⏭️  Will Skip:   Records that won't be touched             │
│  ❌ Errors:       Problem rows that will be skipped         │
│  ⚠️  Warnings:    Issues you should know about              │
│                                                              │
│  Row Table: Each row shows:                                  │
│  - Row number (from Excel)                                   │
│  - Name/identifier                                          │
│  - Action (INS/UPD/SKP/ERR)                                 │
│  - Reason (why this action)                                 │
│                                                              │
│  Image Status: Which images were found/missing               │
│  Duplicate Warnings: Near matches detected                  │
└──────────────────────────────────────────────────────────────┘
```

### What to Check

| Check | Why |
|-------|-----|
| Insert count looks right? | Too many inserts? You might have duplicates. |
| Update count looks right? | Too many updates? Your data might match existing wrong records. |
| Any errors? | Fix error rows and re-upload. |
| Any warnings? | Review case/whitespace/ near duplicates. |
| Images all found? | Upload missing images and re-import. |

### Dry Run is Safe

```
✅   Zero data is written during Dry Run
✅   No temporary records created
✅   No locks on the database
✅   You can cancel anytime
✅   Preview lasts 1 hour before expiring
```

---

## 8. Import Reports

### 8.1 After Every Import

You can download a detailed report:

| Format | Button | Contents |
|--------|--------|----------|
| PDF | 📥 Download Report (PDF) | Summary, errors, warnings, image status |
| Excel | 📥 Download Report (Excel) | Same data as PDF + row-by-row details |

### 8.2 Report Contents

```
┌──────────────────────────────────────────────────────────────┐
│  IMPORT REPORT — #2847                                       │
│  Generated: 28 July 2026, 14:30                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  GENERAL INFORMATION                                         │
│  Import ID:   2847                                           │
│  Module:      Brands                                         │
│  Date:        28 July 2026, 14:30:22                         │
│  User:        admin@sbbt.in                                   │
│  Duration:    2.3 seconds                                    │
│  Mode:        Upsert                                         │
│  File:        brands_filled.xlsx (2.4 KB, 25 rows)          │
│                                                              │
│  RESULTS                                                     │
│  Total rows:  25                                             │
│  Inserted:    20                                             │
│  Updated:     5                                              │
│  Skipped:     0                                              │
│  Failed:      0                                              │
│                                                              │
│  IMAGES                                                      │
│  Found:       5                                              │
│  Missing:     1 (Row 12: premium-logo.png)                  │
│                                                              │
│  WARNINGS                                                    │
│  Row 8: Case difference — "Asian Paints" vs "asian paints"  │
│  Row 12: Image "premium-logo.png" not found                 │
│                                                              │
│  ROLLBACK STATUS                                             │
│  Available:   ✅ Yes (latest import)                         │
│  Status:      Not rolled back                                │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Import History

The **History** page shows all past imports:

```
┌──────────────────────────────────────────────────────────────┐
│  IMPORT HISTORY — Brands                                     │
├──────┬───────────┬────────┬───────┬──────┬──────┬───────────┤
│ #ID  │ Date      │ Mode   │ Rows  │ Ins  │ Upd  │ Status    │
├──────┼───────────┼────────┼───────┼──────┼──────┼───────────┤
│ 2847 │ 28/07 14:30│ Upsert│ 25   │ 20   │ 5    │ ✅ Active │
│ 2842 │ 25/07 10:15│ Insert│ 12   │ 12   │ 0    │ 🔄 Rolled │
│ 2838 │ 20/07 16:45│ Upsert│ 8    │ 5    │ 2    │ ✅ Active │
│ 2835 │ 18/07 11:20│ Insert│ 30   │ 0    │ 0    │ ❌ Failed  │
├──────┴───────────┴────────┴───────┴──────┴──────┴───────────┤
│                                                              │
│  Click any row to view details or rollback.                  │
└──────────────────────────────────────────────────────────────┘
```

- **✅ Active** — Import is live, can be rolled back
- **🔄 Rolled** — Already rolled back
- **❌ Failed** — Import had errors

---

## 9. Troubleshooting

### Common Issues

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| ❌ "Template version mismatch" | You're using an old template | Download a fresh template from the CRM |
| ❌ "Missing required column" | Column header was deleted or renamed | Compare with official template headers |
| ❌ "File type not supported" | File is not .xlsx | Save as .xlsx format in Excel |
| ❌ "File too large" | File exceeds 10 MB limit | Reduce number of rows or remove large data |
| ❌ "Formula injection detected" | Cell starts with =, +, -, @ | Remove formulas, keep only plain text/numbers |
| ⚠️ "Duplicate within file" | Two rows have same name | Remove duplicate rows |
| ⚠️ "Row will be skipped (exists)" | Record already exists but mode is Insert Only | Switch to Upsert mode |
| ⚠️ "Image not found" | Image file missing in storage | Upload image to correct folder |
| ❌ "Import expired" | You waited too long to confirm | Start over — upload again |

### Error Messages Explained

| Error | Meaning | What to Do |
|-------|---------|------------|
| "Brand name exceeds 255 characters" | Text field too long | Shorten the text |
| "Display order must be a whole number" | Wrong data type | Remove decimals |
| "Price must be a number" | Text in numeric field | Remove currency symbols |
| "is_active must be 'yes' or 'no'" | Wrong boolean format | Use "yes" or "no" |
| "Date is not a valid calendar date" | Wrong date format | Use DD/MM/YYYY |
| "Website URL must start with http://" | Wrong URL format | Add https:// |
| "Row X: Case-insensitive duplicate" | Name differs only by case | Choose one spelling |
| "Row X: Near duplicate" | Names are very similar | Verify it's intentional |

### If Import Fails Midway

Don't worry. The import processes in chunks:
- **Completed chunks** are saved to the database
- **Failed chunks** are logged but don't block remaining chunks
- You can see exactly which rows failed in the error report
- Fix the failed rows and import only those

---

## 10. Best Practices

### Before Import

- ✅ **Download a fresh template** each time (not from last month)
- ✅ **Fill data carefully** — check for typos, especially in names
- ✅ **Upload images first** — before importing
- ✅ **Use exact filenames** — "logo.png" not "/images/logo.png" or "Logo.PNG"
- ✅ **Remove duplicate rows** — from your Excel file
- ✅ **Check required fields** — marked with * in headers
- ✅ **Start with a small test** — import 5 rows first, then the rest

### During Import

- ✅ **Use Upsert mode** for most imports
- ✅ **Review Dry Run carefully** — check counts and warnings
- ✅ **Use Insert Only** for first-time data loads
- ✅ **Use Update Only** when correcting existing data
- ✅ **Cancel if Dry Run looks wrong** — nothing is written yet

### After Import

- ✅ **Download the report** — for your records
- ✅ **Check the module page** — verify data looks correct
- ✅ **Upload missing images** — and re-import just those rows
- ✅ **Know rollback is available** — but don't rely on it for testing

### General Guidelines

| Do | Don't |
|----|-------|
| Do use the official template | Don't create your own Excel format |
| Do match filenames exactly | Don't use URLs in filename columns |
| Do use "yes" or "no" for booleans | Don't use "true"/"false" or "1"/"0" |
| Do use DD/MM/YYYY for dates | Don't use MM/DD/YYYY |
| Do test with small batches first | Don't import 10,000 rows without testing |
| Do review the Dry Run | Don't skip the preview step |
| Do download the report | Don't close without saving if you need records |

### Recommended Workflow

```
1. Download template
2. Fill 3-5 test rows
3. Upload images if needed
4. Import (Upsert mode)
5. Review Dry Run
6. Confirm import
7. Check results in module page
8. If good → fill remaining rows and import
9. If bad → rollback, fix issues, try again
```

---

## Appendix: Module Quick Reference

| Module | Template Name | Identity Field | Image Field | Image Folder |
|--------|--------------|----------------|-------------|--------------|
| Packages | packages_template.xlsx | name | — | — |
| Brands | brands_template.xlsx | name | logo_url | cms/brands/ |
| Testimonials | testimonials_template.xlsx | client_name + location | image_url | cms/testimonials/ |
| Projects | projects_template.xlsx | name | cover_image_url | cms/projects/ |
| Blogs | blogs_template.xlsx | title | cover_image_url | cms/blogs/ |
| Team | team_template.xlsx | name | photo_url | cms/team/ |
| Services | services_template.xlsx | name | icon_url | cms/services/ |
| Gallery | gallery_template.xlsx | title | image_url | cms/gallery/ |

## Appendix: Support

If you encounter issues:

1. **Check this guide** — most issues are covered in Troubleshooting
2. **Check the error message** — it tells you exactly what's wrong and which row
3. **Download a fresh template** — old templates may be incompatible
4. **Contact support** — with the Import ID (#2847) for faster help