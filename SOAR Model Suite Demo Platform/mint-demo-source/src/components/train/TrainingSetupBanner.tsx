import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { DeployJob } from "../../api/types";
import type { TrainableModel } from "./trainableModels";

/** Sits above the Train UI when the per-model training Modal function isn't
 * deployed yet. Exposes a one-click "Deploy training function" affordance so
 * the no-code promise holds for training too. Auto-polls deploy status and
 * hides itself once ready. Re-shows if a deploy fails. */
export function TrainingSetupBanner({
  model,
  onReady,
}: {
  model: TrainableModel;
  onReady: () => void;
}) {
  const [job, setJob] = useState<DeployJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string>();

  const appId = model.trainingAppId;

  const poll = useCallback(async () => {
    try {
      const j = await api.deployStatus(appId);
      setJob(j);
      if (j.phase === "complete") onReady();
    } catch (e) {
      // 404 or similar = we've never tried to deploy; the banner stays.
      if (!(e instanceof ApiError && e.status === 400)) {
        // Suppress noise; the user can still click Deploy.
      }
    }
  }, [appId, onReady]);

  // Reset state when the model (and therefore appId) changes so we don't show
  // a stale "complete" for PGS while on MC2.
  useEffect(() => {
    setJob(null);
    setError(undefined);
    void poll();
  }, [poll]);

  useEffect(() => {
    if (job?.phase !== "running") return;
    const id = setInterval(() => { void poll(); }, 1500);
    return () => clearInterval(id);
  }, [job?.phase, poll]);

  const deploy = async () => {
    setStarting(true);
    setError(undefined);
    try {
      const j = await api.deployStart(appId);
      setJob(j);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start deploy.");
    } finally {
      setStarting(false);
    }
  };

  if (job?.phase === "complete") return null;

  const running = job?.phase === "running";
  const failed = job?.phase === "failed";
  const tone = failed ? "error" : "info";

  return (
    <div className={`callout ${tone}`} style={{
      marginBottom: 16, fontSize: 13.5,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          {failed
            ? "Deploy failed"
            : running
              ? "Deploying training function…"
              : "One-time setup: deploy the training function"}
        </div>
        <div>
          {failed && job?.message}
          {!failed && !running && (
            <>
              Before training can run, MINT needs to deploy the
              {" "}<code>{model.trainingAppName}</code>{" "}
              Modal app in your workspace. First build is ~10–15 min; after that
              training runs reuse the cached image.
            </>
          )}
          {running && (job?.message || "Building image on Modal…")}
        </div>
        {job?.log_tail && job.log_tail.length > 0 && running && (
          <div style={{
            marginTop: 8, padding: 8,
            background: "var(--tech-bg)", color: "var(--tech-body)",
            fontFamily: "var(--mono)", fontSize: 11.5,
            borderRadius: 4, maxHeight: 120, overflow: "auto",
          }}>
            {job.log_tail.slice(-8).map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
        {error && (
          <div style={{ marginTop: 6, color: "var(--err-fg)" }}>{error}</div>
        )}
      </div>
      {!running && (
        <button
          className="btn primary"
          onClick={deploy}
          disabled={starting}
          style={{ whiteSpace: "nowrap" }}
        >
          {starting ? "Starting…" : failed ? "Try again" : "Deploy now"}
        </button>
      )}
    </div>
  );
}
