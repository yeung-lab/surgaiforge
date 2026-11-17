// Minimal CSV parser for in-UI previews.
//
// Handles the two things actual model outputs throw at us:
//   - unquoted numeric cells (the common case)
//   - standard RFC-4180 double-quoted strings with embedded commas / newlines
//
// Not trying to be a full CSV library — tool/pgs outputs don't need the extra
// surface area. If we ever surface arbitrary user CSVs we can swap in Papaparse.

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let i = 0;
  let inQuote = false;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote inside a quoted field.
          field += '"';
          i += 2;
          continue;
        }
        inQuote = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuote = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      // Collapse CRLF to one row break.
      if (ch === "\r" && text[i + 1] === "\n") i += 2;
      else i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  // Flush the final field/row (file may not end with a newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop any trailing all-empty row that comes from a final newline.
  while (rows.length > 0 && rows[rows.length - 1].every((c) => c === "")) {
    rows.pop();
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  const [headers, ...body] = rows;
  return { headers, rows: body };
}

/** Zip-magic detection — we fall back to "no preview" when the backend
 *  returned a zip (which happens for multi-video artifacts). */
export function looksLikeZip(text: string): boolean {
  return text.startsWith("PK") || text.startsWith("PK");
}
