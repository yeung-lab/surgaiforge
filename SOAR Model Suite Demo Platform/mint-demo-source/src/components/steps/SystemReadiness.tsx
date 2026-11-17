import type { ReadinessResponse } from "../../api/types";
import { Card } from "../Card";
import { InfoIcon } from "../icons";
import { StatusBadge } from "../StatusBadge";

export function SystemReadiness({
  readiness,
  error,
}: {
  readiness: ReadinessResponse | null;
  error?: string;
}) {
  return (
    <Card id="step1" step={1} title="System readiness">
      {error && <div className="callout error">{error}</div>}
      {!readiness && !error && <p className="empty">Checking system…</p>}

      {readiness && (
        <>
          <div>
            {readiness.checks.map((c) => (
              <div className="list-row" key={c.name}>
                <div>
                  <div className="list-label">
                    {c.name}
                    {c.note && <span className="list-note">· {c.note}</span>}
                  </div>
                  {c.detail && <div className="list-detail">{c.detail}</div>}
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
          <div className="callout info">
            <InfoIcon />
            <span>{readiness.message}</span>
          </div>
        </>
      )}
    </Card>
  );
}
