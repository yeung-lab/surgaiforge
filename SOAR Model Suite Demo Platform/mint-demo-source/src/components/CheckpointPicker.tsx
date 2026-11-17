import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { CheckpointMeta } from "../api/types";

/** Tiny dropdown that shows the active checkpoint for a model and lets the
 * user activate a different one. Rendered inline where the run review needs
 * to confirm "which checkpoint will my inference actually use?".
 *
 * Returns null for models that have no registry entries (every model except
 * PGS today), so it quietly no-ops for the rest of the catalog.
 */
export function CheckpointPicker({ modelId }: { modelId: string }) {
  const [checkpoints, setCheckpoints] = useState<CheckpointMeta[] | null>(null);
  const [open, setOpen] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    try {
      const resp = await api.listCheckpoints(modelId);
      setCheckpoints(resp.checkpoints);
    } catch (e) {
      // 404 = model_id has no registry (not an error for the user); any other
      // failure is quietly suppressed here — a missing picker is strictly
      // better than a broken-looking banner.
      if (e instanceof ApiError && e.status === 404) {
        setCheckpoints([]);
      } else {
        setCheckpoints([]);
      }
    }
  }, [modelId]);

  useEffect(() => { void load(); }, [load]);

  if (!checkpoints || checkpoints.length === 0) return null;

  const active = checkpoints.find((c) => c.is_active) ?? checkpoints[0];
  const others = checkpoints.filter((c) => c.id !== active.id);

  const activate = async (id: string) => {
    setActivating(id);
    setError(undefined);
    try {
      await api.activateCheckpoint(modelId, id);
      await load();
      setOpen(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Activation failed.");
    } finally {
      setActivating(null);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn"
        style={{
          padding: "6px 10px",
          fontSize: 12.5,
          background: "var(--bg-white)",
          borderColor: "var(--card-bd)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>
          <span style={{ color: "var(--muted)", fontWeight: 500 }}>
            Checkpoint:{" "}
          </span>
          <span style={{ fontWeight: 600 }}>{active.name}</span>
          {active.source === "user_trained" && typeof active.metrics?.accuracy === "number" && (
            <span style={{ color: "var(--muted)", marginLeft: 6 }}>
              acc {active.metrics.accuracy.toFixed(2)}
            </span>
          )}
        </span>
        {others.length > 0 && (
          <span style={{ color: "var(--faint)", fontSize: 10 }}>▼</span>
        )}
      </button>
      {open && others.length > 0 && (
        <div style={{
          marginTop: 6, padding: 6,
          background: "var(--bg-white)", border: "1px solid var(--card-bd)",
          borderRadius: 6, minWidth: 320, maxWidth: 480,
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{
            fontSize: 11, color: "var(--muted)", fontWeight: 600,
            padding: "4px 8px",
          }}>
            SWITCH TO
          </div>
          {others.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "8px 10px", borderRadius: 4, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--drop-bg)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "transparent")
              }
              onClick={() => activate(c.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  {c.source === "shipped" ? "Shipped baseline" : "User-trained"}
                  {typeof c.metrics?.accuracy === "number" &&
                    ` · acc ${c.metrics.accuracy.toFixed(2)}`}
                  {typeof c.metrics?.cohen_kappa_quadratic === "number" &&
                    ` · κ ${c.metrics.cohen_kappa_quadratic.toFixed(2)}`}
                </div>
              </div>
              <span style={{ fontSize: 12, color: "var(--mint)" }}>
                {activating === c.id ? "Activating…" : "Use"}
              </span>
            </div>
          ))}
          {error && (
            <div className="callout error" style={{ marginTop: 6, fontSize: 12 }}>{error}</div>
          )}
        </div>
      )}
    </div>
  );
}
