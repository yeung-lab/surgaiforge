import { useState } from "react";
import { getBackendUrl, setBackendUrl } from "../api/client";

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

// Lets an operator point the app at a deployed backend / control-plane URL (or
// leave blank to use the local dev server). The surgeon then just uses the app.
export function BackendControl({
  online,
  engine,
  onChange,
}: {
  online: boolean;
  engine?: string;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(getBackendUrl());

  const current = getBackendUrl();
  const label = current ? safeHost(current) : "local";

  const save = () => {
    setBackendUrl(value);
    setOpen(false);
    onChange();
  };
  const useLocal = () => {
    setBackendUrl("");
    setValue("");
    setOpen(false);
    onChange();
  };

  return (
    <div className="backend">
      <button className="backend-btn" onClick={() => setOpen((o) => !o)} title="Backend connection">
        <span className={`dot ${online ? "ok" : "off"}`} />
        {online ? `${label}${engine ? ` · ${engine}` : ""}` : "offline"}
      </button>
      {open && (
        <div className="backend-pop">
          <h4>Backend connection</h4>
          <p>
            Point the app at your deployed backend URL, or leave blank to use the local
            server (dev proxy on :8010).
          </p>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://your-backend-host"
            spellCheck={false}
          />
          <div className="row">
            <button
              className="btn"
              style={{ flex: 1, background: "var(--red)", color: "#fff", borderColor: "var(--red)" }}
              onClick={save}
            >
              Save
            </button>
            <button className="btn" onClick={useLocal}>
              Use local
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
