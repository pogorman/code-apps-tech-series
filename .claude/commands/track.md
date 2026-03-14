---
name: track
description: Append discussion to a tracked doc. Supports name, header, and p params. Creates files/folders as needed.
user_invocable: true
---

# Track Discussion

You are appending content to a tracking document in `docs/tracked/`.

## Parameters (all optional)

Parse the user's arguments for these. They can appear in any order:

| Param | Formats | Example |
|-------|---------|---------|
| **name** | `name:my-doc` or `--name my-doc` | `/track name:architecture` |
| **header** | `header:"section title"` or `--header "section title"` | `/track header:"Dataverse Connectivity"` |
| **p** | `p:"prompt text"` or `--p "prompt text"` | `/track p:"just the gotchas, skip the happy path"` |
| **pdf** | `pdf` or `--pdf` (flag, no value) | `/track pdf` |

The **p** (prompt) parameter gives you specific instructions on *what* to capture and *how* to shape the content. When present, follow these instructions instead of the default "summarize the most recent discussion" behavior. Examples:
- `/track p:"only the decisions we made"` — capture decisions, skip exploratory discussion
- `/track p:"ELI5"` — write it like you're explaining to a five-year-old
- `/track p:"bullet points only, no prose"` — format constraint
- `/track name:gotchas p:"just the things that surprised us"` — combine with other params

Any remaining free text after all params is still treated as additional instructions and merged with the **p** value if both are present.

## Behavior by parameter combination

### `/track` (no params)

Catch-all — append the latest discussion to the main tracked doc.

1. Find the active main doc: look in `docs/tracked/` for `tracked*.md` files. Use the one with the highest version number (`tracked_v3.md` > `tracked_v2.md` > `tracked.md`).
2. If no `tracked*.md` exists, create `docs/tracked/tracked.md` with:

   ```markdown
   # Tracked Notes

   > Catch-all tracking document. Append with `/track`. Start a new version with `/tracknew`.

   ---
   ```

3. If `docs/tracked/` doesn't exist, create it (and `docs/pdf/`).
4. Append a new numbered section:
   - Increment from the last section number in the doc
   - Include a `**Date:**` line with today's date
   - If **p** is provided, follow those instructions to decide what to capture and how to write it
   - Otherwise, summarize the most recent discussion — concise but complete: key points, decisions, code patterns, gotchas
   - Markdown formatting: headers, bullets, code blocks, tables as appropriate
5. Append the section to the end of the doc (do NOT overwrite existing content).

### `/track header:"Section Title"`

Append to the main tracked doc, but use the provided header as the section title instead of auto-generating one.

1. Find the active main doc (same logic as above, create if missing).
2. Create a new numbered section using the provided header text as the `##` title.
3. If **p** is provided, follow those instructions; otherwise summarize the most recent discussion. Write under that header.
4. Append to the doc.

### `/track name:some-doc`

Append to a specific named doc.

1. Look for `docs/tracked/some-doc.md`.
2. If it doesn't exist, create it with:

   ```markdown
   # Some Doc — Tracked Notes

   > Append with `/track name:some-doc`.

   ---
   ```

3. If `docs/tracked/` doesn't exist, create it (and `docs/pdf/`).
4. Append a new numbered section (same formatting as above).
5. Append to the doc.

### `/track name:some-doc header:"Section Title"`

Append to a specific named doc with a custom section title.

1. Look for `docs/tracked/some-doc.md`. Create it if missing (same template as above).
2. Create a new numbered section using the provided header as the `##` title.
3. If **p** is provided, follow those instructions; otherwise summarize the most recent discussion. Write under that header.
4. Append to the doc.

## After appending (all cases)

1. **PDF generation — only if the `pdf` flag is present:**
   - Check if `md-to-pdf` is available (`npx md-to-pdf --version`)
   - If available, run `npx md-to-pdf <path-to-doc> --dest docs/pdf/` to generate a PDF in the pdf subfolder
   - If not available, skip and mention it to the user
   - **Do NOT generate a PDF unless the user explicitly includes the `pdf` flag.**

2. **Report** the section title and doc path to the user. If PDF was generated, include the PDF path too.

## Notes

- All tracked docs live in `docs/tracked/` (not `docs/` root)
- PDFs go in `docs/pdf/`
- The main tracked doc is always `tracked.md` (or `tracked_v{N}.md` — highest version wins)
- Named docs are standalone files in `docs/tracked/` — they do NOT follow the versioning scheme
- When creating new files, title-case the name param for the `#` heading (e.g., `name:api-design` → `# Api Design — Tracked Notes`)
- Named docs use the exact name provided — no prefix added
