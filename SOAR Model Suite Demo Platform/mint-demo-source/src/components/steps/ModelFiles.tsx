import type { CheckpointsResponse } from "../../api/types";
import { formatBytes } from "../../lib/format";
import { Card } from "../Card";
import { CheckCircleIcon, WarningIcon, XCircleIcon } from "../icons";

export function ModelFiles({
  checkpoints,
  onRecheck,
}: {
  checkpoints: CheckpointsResponse | null;
  onRecheck: () => void;
}) {
  return (
    <Card id="step2" step={2} title="Model files">
      {!checkpoints && <p className="empty">Checking model files…</p>}

      {checkpoints && (
        <>
          <div>
            {checkpoints.checkpoints.map((c) => (
              <div className="list-row" key={c.key}>
                <div className="list-label">{c.label}</div>
                {c.present ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--green)" }}>
                    <CheckCircleIcon size={18} />
                    <span className="file-name">{c.filename}</span>
                    {c.size_bytes != null && (
                      <span className="list-note">({formatBytes(c.size_bytes)})</span>
                    )}
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--err-fg)" }}>
                    <XCircleIcon size={18} />
                    <span>Missing:</span>
                    <span className="file-name">{c.filename}</span>
                    <button className="btn" style={{ marginLeft: 6 }} onClick={onRecheck}>
                      Re-check
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>

          {!checkpoints.all_required_present && (
            <div className="callout error">
              <WarningIcon />
              <span>{checkpoints.message}</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
