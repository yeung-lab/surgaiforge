import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { CheckpointMeta, TrainingMetrics, TrainingRun } from "../../api/types";
import { trainable, type TrainableModel } from "./trainableModels";

// Fallback phases if the model_id is unknown (shouldn't happen in practice).
const DEFAULT_PHASES = ["preparing", "train", "promote", "complete"];
const DEFAULT_PHASE_LABELS: Record<string, string> = {
  queued: "Queued",
  preparing: "Preparing",
  train: "Training",
  promote: "Registering",
  complete: "Complete",
};

export function TrainingRunView({
  runId,
  onBack,
}: {
  runId: string;
  onBack: () => void;
}) {
  const [run, setRun] = useState<TrainingRun | null>(null);
  const [error, setError] = useState<string>();
  const [activating, setActivating] = useState(false);
  const [checkpoint, setCheckpoint] = useState<CheckpointMeta | null>(null);
  const logEnd = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.getTrainingRun(runId);
      setRun(r);
      if (r.produced_checkpoint_id) {
        try {
          const list = await api.listCheckpoints(r.model_id);
          setCheckpoint(
            list.checkpoints.find((c) => c.id === r.produced_checkpoint_id) ?? null,
          );
        } catch { /* keep going */ }
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load run.");
    }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  // Poll while active.
  useEffect(() => {
    if (!run) return;
    if (run.status !== "running" && run.status !== "queued") return;
    const id = setInterval(() => { void load(); }, 1000);
    return () => clearInterval(id);
  }, [run?.status, load]);

  // Autoscroll logs.
  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [run?.logs.length]);

  const activate = async () => {
    if (!run || !run.produced_checkpoint_id) return;
    setActivating(true);
    try {
      const meta = await api.activateCheckpoint(run.model_id, run.produced_checkpoint_id);
      setCheckpoint(meta);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Activation failed.");
    } finally {
      setActivating(false);
    }
  };

  if (!run && !error) return <div className="list-note">Loading training run…</div>;
  if (error && !run) {
    return (
      <>
        <button className="btn" onClick={onBack}>← All datasets</button>
        <div className="callout error" style={{ marginTop: 16, fontSize: 13 }}>{error}</div>
      </>
    );
  }
  if (!run) return null;

  const model = trainable(run.model_id);
  const phases = model?.phases ?? DEFAULT_PHASES;
  const phaseLabels = model?.phaseLabels ?? DEFAULT_PHASE_LABELS;
  const phaseIdx = phases.indexOf(run.phase);

  return (
    <>
      <button className="btn" onClick={onBack}>← All datasets</button>

      <div className="step-eyebrow" style={{ marginTop: 16 }}>
        TRAINING · {model?.shortName ?? run.model_id.toUpperCase()}
      </div>
      <h1 className="step-title">
        {run.status === "complete"
          ? "Training complete"
          : run.status === "failed"
            ? "Training failed"
            : "Training in progress…"}
      </h1>
      <p className="step-sub">
        Run id <code>{run.id}</code>
      </p>

      {/* Phase pill ladder */}
      <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
        {phases.map((p, i) => {
          const done = run.status === "complete" || i < phaseIdx;
          const current = i === phaseIdx && run.status === "running";
          const failed = run.status === "failed" && i === phaseIdx;
          return (
            <div
              key={p}
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 12.5,
                background: failed
                  ? "var(--err-bg)"
                  : done
                    ? "var(--green-bg)"
                    : current
                      ? "var(--amber-bg)"
                      : "var(--drop-bg)",
                color: failed
                  ? "var(--err-fg)"
                  : done
                    ? "var(--green)"
                    : current
                      ? "var(--amber)"
                      : "var(--faint)",
                border: `1px solid ${
                  failed ? "var(--err-bd)"
                  : done ? "var(--green-bd)"
                  : current ? "var(--amber-bd)"
                  : "var(--card-bd)"
                }`,
                fontWeight: current || failed ? 600 : 500,
              }}
            >
              {phaseLabels[p] ?? p}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{
          height: 8, background: "var(--track)",
          borderRadius: 4, overflow: "hidden",
        }}>
          <div style={{
            width: `${run.progress}%`, height: "100%",
            background: run.status === "failed" ? "var(--err-fg)" : "var(--mint)",
            transition: "width 200ms ease",
          }} />
        </div>
        <div className="list-note" style={{ fontSize: 13, marginTop: 6 }}>
          {run.status_line || phaseLabels[run.phase] || "Working…"} · {run.progress}%
        </div>
      </div>

      {run.status === "failed" && run.error && (
        <div className="callout error" style={{ marginTop: 16, fontSize: 13 }}>
          {run.error.message}
        </div>
      )}

      {run.status === "complete" && run.metrics && model && (
        <MetricsPanel
          model={model}
          metrics={run.metrics}
          producedCheckpointId={run.produced_checkpoint_id ?? null}
          checkpoint={checkpoint}
          activating={activating}
          onActivate={activate}
        />
      )}

      <LogsPanel run={run} logEndRef={logEnd} />
    </>
  );
}

function MetricsPanel({
  model,
  metrics,
  producedCheckpointId,
  checkpoint,
  activating,
  onActivate,
}: {
  model: TrainableModel;
  metrics: TrainingMetrics;
  producedCheckpointId: string | null;
  checkpoint: CheckpointMeta | null;
  activating: boolean;
  onActivate: () => void;
}) {
  // Only show metrics the engine actually populated — avoids rendering "0.000"
  // when the backend left the field null because it doesn't apply.
  const shown = model.metrics.filter((m) => {
    const v = metrics[m.key as keyof TrainingMetrics];
    return typeof v === "number";
  });
  return (
    <div style={{
      marginTop: 20, padding: 16,
      background: "var(--beige)", border: "1px solid var(--beige-bd)",
      borderRadius: 8,
    }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)" }}>
        Results
      </div>
      <div className="list-note" style={{ fontSize: 13, marginTop: 4 }}>
        Trained on {metrics.n_clips ?? "?"} clips ({metrics.n_train} train · {metrics.n_test} test)
      </div>

      {shown.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          {shown.map((m) => {
            const v = metrics[m.key as keyof TrainingMetrics] as number;
            return (
              <Metric
                key={m.key}
                label={m.label}
                value={(m.format ?? ((n: number) => n.toFixed(3)))(v)}
              />
            );
          })}
        </div>
      )}

      <div style={{
        marginTop: 16, paddingTop: 14,
        borderTop: "1px solid var(--beige-bd)",
      }}>
        {checkpoint?.is_active ? (
          <div style={{ fontSize: 13.5, color: "var(--green)" }}>
            ✓ This checkpoint is <b>active</b>. New inference runs will use it.
          </div>
        ) : producedCheckpointId ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn primary"
              onClick={onActivate}
              disabled={activating}
            >
              {activating ? "Activating…" : "Make active for inference"}
            </button>
            <span className="list-note" style={{ fontSize: 12.5 }}>
              You can switch back to the shipped baseline anytime from the inference flow.
            </span>
          </div>
        ) : (
          <div className="list-note" style={{ fontSize: 13 }}>
            Checkpoint was registered but not yet stored. Refresh in a moment.
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 110, padding: "10px 12px",
      background: "var(--bg-white)", border: "1px solid var(--card-bd)",
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}

function LogsPanel({
  run,
  logEndRef,
}: {
  run: TrainingRun;
  logEndRef: React.RefObject<HTMLDivElement>;
}) {
  if (run.logs.length === 0) return null;
  return (
    <details style={{ marginTop: 20 }} open={run.status === "failed"}>
      <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--muted)" }}>
        Technical logs ({run.logs.length} line{run.logs.length !== 1 ? "s" : ""})
      </summary>
      <div style={{
        marginTop: 10, padding: 12,
        background: "var(--tech-bg)", color: "var(--tech-body)",
        borderRadius: 6, fontFamily: "var(--mono)", fontSize: 12,
        maxHeight: 280, overflow: "auto",
      }}>
        {run.logs.map((l, i) => (
          <div key={i} style={{
            color: l.level === "error" ? "#f59a9a"
              : l.level === "success" ? "var(--tag-green)"
              : "var(--tech-body)",
          }}>
            <span style={{ color: "var(--tag)" }}>[{l.tag}]</span> {l.message}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </details>
  );
}
