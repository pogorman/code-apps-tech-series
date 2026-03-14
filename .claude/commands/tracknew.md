---
name: tracknew
description: Start a new version of the tracked doc. No args = next tracked version. Supports name and header params for custom docs.
user_invocable: true
---

# Start New Tracking Doc

You are creating a new tracking document. Behavior depends on parameters.

## Parameters (all optional)

| Param | Formats | Example |
|-------|---------|---------|
| **name** | `name:my-doc` or `--name my-doc` | `/tracknew name:sprint-retro` |
| **header** | `header:"some notes"` or `--header "some notes"` | `/tracknew header:"Q2 planning session"` |

## Behavior by parameter combination

### `/tracknew` (no params)

Default versioning flow for the main tracked doc:

1. Check `docs/tracked/` for existing `tracked*.md` files. Create `docs/tracked/` (and `docs/pdf/`) if they don't exist.
2. Determine the next version:
   - No files exist → create `tracked.md`
   - Only `tracked.md` exists → create `tracked_v2.md` (original is implicitly v1)
   - Versioned files exist → find highest N, create `tracked_v{N+1}.md`
3. Create the file with:

   ```markdown
   # Tracked Notes — v{VERSION}

   > Catch-all tracking document. Append with `/track`. Start a new version with `/tracknew`.
   > Previous version: `tracked{_vN}.md`

   ---
   ```

4. Report the new file path and version. Mention `/track` now appends here.

### `/tracknew header:"Custom subtitle"`

Same versioning flow, but with custom header notes:

   ```markdown
   # Tracked Notes — v{VERSION}

   > {HEADER_NOTES}
   > Append with `/track`. Start a new version with `/tracknew`.
   > Previous version: `tracked{_vN}.md`

   ---
   ```

### `/tracknew name:some-doc`

Create a standalone named tracking doc:

1. Create `docs/tracked/` (and `docs/pdf/`) if they don't exist.
2. Create `docs/tracked/some-doc.md` (kebab-case the name if needed).
3. If the file already exists, **do not overwrite** — tell the user and suggest `/track name:some-doc` to append.
4. Use this header:

   ```markdown
   # Some Doc — Tracked Notes

   > Append with `/track name:some-doc`.

   ---
   ```

5. Report the new file path.

### `/tracknew name:some-doc header:"Custom notes"`

Same as above but with custom header:

   ```markdown
   # Some Doc — Tracked Notes

   > {HEADER_NOTES}
   > Append with `/track name:some-doc`.

   ---
   ```
