import { useState } from "react";
import type { LogLine } from "../api/types";
import { ChevronIcon } from "./icons";

// The collapsible dark log panel — hides notebook-style logs by default, exactly
// as the scope doc requires ("Hide technical logs by default, with expandable
// 'Technical details'").
export function TechnicalDetails({ logs }: { logs: LogLine[] }) {
  const [open, setOpen] = useState(false);
  if (logs.length === 0) return null;

  return (
    <div className="tech">
      <button
        className={`tech-toggle${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <ChevronIcon className="chev" />
        Technical details
      </button>
      {open && (
        <div className="tech-panel">
          {logs.map((line, i) => (
            <div key={i} className={`log-line${line.level === "error" ? " error" : ""}`}>
              <span className={`log-tag ${line.tag}`}>[{line.tag}]</span> {line.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
