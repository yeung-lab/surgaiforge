import { useState } from "react";
import { api, ApiError } from "../api/client";

/** Second upload path: register existing files on disk by absolute path with
 * no copy. Works for a local-app deployment where the backend can see the
 * user's filesystem (the bundled .app or dev-mode on the same machine).
 *
 * The user pastes one path per line. Each is validated server-side — bad
 * paths come back as rows with readable=false + a specific error, so the UI
 * surface here just has to fire the request and refresh the shared list.
 */
export function LinkFilesInput({
  onLinked,
}: {
  onLinked: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    | { kind: "ok"; linked: number; errored: number; messages: string[] }
    | { kind: "err"; message: string }
    | null
  >(null);

  const paths = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const submit = async () => {
    if (paths.length === 0) return;
    setSubmitting(true);
    setResult(null);
    try {
      const resp = await api.linkVideos(paths);
      const ok = resp.videos.filter((v) => v.readable).length;
      const bad = resp.videos.filter((v) => !v.readable);
      setResult({
        kind: "ok",
        linked: ok,
        errored: bad.length,
        messages: bad.map((v) => `${v.filename}: ${v.error ?? "Unreadable"}`),
      });
      if (ok > 0) setText("");
      onLinked();
    } catch (e) {
      setResult({
        kind: "err",
        message: e instanceof ApiError ? e.message : "Link failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      marginTop: 12, padding: "12px 16px",
      background: "var(--stone)", border: "1px solid var(--line)",
      borderRadius: 8,
    }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontSize: 14, color: "var(--slate)", fontWeight: 500,
          fontFamily: "var(--sans)",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 10 }}>{open ? "▾" : "▸"}</span>
        I have files already on disk — don't copy them
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div className="list-note" style={{ fontSize: 12.5, marginBottom: 8 }}>
            Paste one absolute path per line. MINT will reference them without
            copying, so big files stay in place. Deleting a linked video from
            MINT does <b>not</b> delete the file on disk.
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"/Users/you/Documents/case001.mp4\n/Volumes/external/case002.mp4"}
            rows={4}
            style={{
              width: "100%", padding: "8px 10px",
              border: "1px solid var(--card-bd)", borderRadius: 4,
              fontFamily: "var(--mono)", fontSize: 12.5,
              resize: "vertical", background: "var(--bg-white)",
            }}
            disabled={submitting}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <button
              className="btn primary"
              onClick={submit}
              disabled={submitting || paths.length === 0}
            >
              {submitting
                ? "Linking…"
                : paths.length > 0
                  ? `Link ${paths.length} file${paths.length !== 1 ? "s" : ""}`
                  : "Link files"}
            </button>
            <span className="list-note" style={{ fontSize: 12 }}>
              {paths.length > 0 && !submitting && `${paths.length} path${paths.length !== 1 ? "s" : ""} queued`}
            </span>
          </div>
          {result?.kind === "ok" && (
            <div style={{ marginTop: 10 }}>
              {result.linked > 0 && (
                <div className="callout" style={{ fontSize: 12.5, background: "var(--green-bg)", border: "1px solid var(--green-bd)", color: "var(--green)" }}>
                  Linked {result.linked} file{result.linked !== 1 ? "s" : ""}.
                </div>
              )}
              {result.errored > 0 && (
                <div className="callout error" style={{ fontSize: 12.5, marginTop: 6, flexDirection: "column", alignItems: "flex-start" }}>
                  <b>{result.errored} path{result.errored !== 1 ? "s" : ""} rejected:</b>
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {result.messages.map((m, i) => (
                      <li key={i} style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {result?.kind === "err" && (
            <div className="callout error" style={{ marginTop: 10, fontSize: 12.5 }}>
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Tiny "linked" badge for use inside video list rows, so copied vs linked
 * is visible at a glance. */
export function LinkedChip() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.08,
      padding: "3px 8px", borderRadius: 999,
      background: "transparent", color: "var(--cardinal)",
      border: "1px solid var(--cardinal)",
    }}>
      LINKED
    </span>
  );
}
