import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type {
  DeployJob,
  ModelInfo,
  ModelSetupStatus,
  SetupStatusResponse,
} from "../api/types";
import { CheckCircleIcon, UploadIcon, WarningIcon } from "./icons";

type Props = {
  modalConnected: boolean;
  models: ModelInfo[];
  selectedModelId: string | null;
  onReadyChange: (ready: boolean) => void;
};

export function Setup({ modalConnected, models, selectedModelId, onReadyChange }: Props) {
  const [status, setStatus] = useState<SetupStatusResponse | null>(null);
  const [uploading, setUploading] = useState<{ model: string; name: string } | null>(null);
  const [uploadError, setUploadError] = useState<{ model: string; message: string } | undefined>();
  // Deploy job keyed by model_id so each per-model section polls its own progress.
  const [deployJobs, setDeployJobs] = useState<Record<string, DeployJob | null>>({});

  // One file-picker ref per (model_id, checkpoint_name) pair.
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = async () => {
    try {
      const s = await api.setupStatus();
      setStatus(s);

      // Report ready-ness for the currently-selected model only. If the user
      // hasn't selected yet, nothing's blocked. If they picked a model that
      // isn't in the setup registry (e.g. step/error — not yet deployable from
      // MINT), report not-ready so the run gate stays closed.
      if (!selectedModelId) {
        onReadyChange(true);
      } else {
        const sel = s.models.find((m) => m.model_id === selectedModelId);
        onReadyChange(sel ? sel.ready : false);
      }
    } catch {
      /* leave stale */
    }
  };

  useEffect(() => {
    void refresh();

  }, [modalConnected, selectedModelId]);

  // Poll any deploy jobs that are currently running.
  useEffect(() => {
    const running = Object.entries(deployJobs).filter(([, j]) => j?.phase === "running");
    if (running.length === 0) return;
    const id = setInterval(async () => {
      for (const [modelId] of running) {
        try {
          const j = await api.deployStatus(modelId);
          setDeployJobs((prev) => ({ ...prev, [modelId]: j }));
          if (j.phase === "complete" || j.phase === "failed") {
            void refresh();
          }
        } catch {
          /* ignore */
        }
      }
    }, 1500);
    return () => clearInterval(id);

  }, [deployJobs]);

  if (!status) return null;

  const sdkOk = status.modal_sdk_installed;
  const modalOk = modalConnected;
  const registeredModels = status.models;
  const allRegisteredReady =
    registeredModels.length > 0 && registeredModels.every((m) => m.ready);
  const selectedModelInfo = selectedModelId
    ? models.find((m) => m.id === selectedModelId)
    : null;
  const selectedIsRegistered = !!(
    selectedModelId &&
    registeredModels.find((m) => m.model_id === selectedModelId)
  );
  const selectedUnavailable = !!(selectedModelId && !selectedIsRegistered);

  // Hide the whole section when:
  // - SDK + Modal are good AND every registered model is ready AND
  // - the selected model (if any) is one of the registered ones.
  // That last clause means: if the user picks `step` (not yet deployable),
  // we keep the section visible to explain why.
  if (sdkOk && modalOk && allRegisteredReady && !selectedUnavailable) return null;

  return (
    <section id="setup" className="setup-section">
      <div className="where-section-head" style={{ marginTop: 0 }}>
        Model setup
      </div>
      <p style={{ marginTop: 0, marginBottom: 16, color: "var(--muted)", fontSize: 13.5, letterSpacing: "-0.01em" }}>
        One-time per-model setup. MINT uploads the checkpoints and deploys
        the inference function. You don't need to run any code.
      </p>

      <div className="setup-steps">
        {/* Baseline rows: SDK + Modal connection apply to every model. */}
        <StepRow
          label="Modal SDK installed"
          hint="Shipped with MINT. If this is red, your install is incomplete."
          state={sdkOk ? "ready" : "blocked"}
        />
        <StepRow
          label="Connected to Modal"
          hint="Paste your Modal token pair in Step 3 to connect."
          state={modalOk ? "ready" : "pending"}
        />

        {/* Selected model isn't managed by Setup yet — flag it. */}
        {selectedUnavailable && (
          <div className="callout error" style={{ marginTop: 4 }}>
            <WarningIcon />
            <span>
              {selectedModelInfo?.name ?? selectedModelId} isn't yet deployable
              from MINT. Pick a different model above, or wait for a future
              update.
            </span>
          </div>
        )}

        {/* Per-model setup sections. */}
        {registeredModels.map((m) => {
          const info = models.find((mi) => mi.id === m.model_id);
          const displayName = info?.name ?? m.model_id;
          const isSelected = m.model_id === selectedModelId;
          const deploy = deployJobs[m.model_id] ?? null;
          const checkpointsOk = m.checkpoints.length > 0 && m.checkpoints.every((c) => c.present);
          return (
            <div
              key={m.model_id}
              className={`setup-model-section${isSelected ? " selected" : ""}`}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 16,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <strong style={{ fontSize: 15 }}>{displayName}</strong>
                {m.ready ? (
                  <span className="list-note" style={{ color: "var(--green-2)" }}>
                    Ready
                  </span>
                ) : (
                  <span className="list-note">Setup needed</span>
                )}
                {isSelected && (
                  <span
                    className="list-note"
                    style={{ color: "var(--mint)", fontWeight: 500 }}
                  >
                    · Selected
                  </span>
                )}
              </div>

              <StepRow
                label="Checkpoints uploaded"
                hint={`${m.checkpoints.length} file(s) stored securely in your Modal volume.`}
                state={checkpointsOk ? "ready" : "action"}
              >
                <div className="setup-checkpoints">
                  {m.checkpoints.map((c) => (
                    <CheckpointRow
                      key={`${m.model_id}:${c.name}`}
                      name={c.name}
                      present={c.present}
                      sizeMb={c.size_mb ?? undefined}
                      uploading={uploading?.model === m.model_id && uploading.name === c.name}
                      disabled={!modalOk || uploading !== null}
                      onPick={() => {
                        fileInputs.current[`${m.model_id}:${c.name}`]?.click();
                      }}
                      fileRef={(el) => (fileInputs.current[`${m.model_id}:${c.name}`] = el)}
                      onFile={async (file) => {
                        setUploading({ model: m.model_id, name: c.name });
                        setUploadError(undefined);
                        try {
                          await api.uploadCheckpoint(m.model_id, c.name, file);
                          await refresh();
                        } catch (e) {
                          setUploadError({
                            model: m.model_id,
                            message: e instanceof Error ? e.message : "Upload failed.",
                          });
                        } finally {
                          setUploading(null);
                        }
                      }}
                    />
                  ))}
                  {uploadError?.model === m.model_id && (
                    <div className="callout error" style={{ marginTop: 10 }}>
                      <WarningIcon />
                      <span>{uploadError.message}</span>
                    </div>
                  )}
                </div>
              </StepRow>

              <StepRow
                label="Modal function deployed"
                hint="Builds the GPU image on your workspace (first deploy takes 5 to 15 minutes). MINT verifies the container boots before marking it ready."
                state={
                  m.deployed
                    ? "ready"
                    : deploy?.phase === "running"
                      ? "running"
                      : deploy?.phase === "failed"
                        ? "failed"
                        : "action"
                }
              >
                {!m.deployed && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="btn"
                      style={{
                        background: canDeploy(modalOk, m, deploy) ? "var(--red)" : undefined,
                        borderColor: canDeploy(modalOk, m, deploy) ? "var(--red)" : undefined,
                        color: canDeploy(modalOk, m, deploy) ? "#fff" : undefined,
                      }}
                      disabled={!canDeploy(modalOk, m, deploy)}
                      onClick={async () => {
                        try {
                          const j = await api.deployStart(m.model_id);
                          setDeployJobs((prev) => ({ ...prev, [m.model_id]: j }));
                        } catch (e) {
                          setDeployJobs((prev) => ({
                            ...prev,
                            [m.model_id]: {
                              model_id: m.model_id,
                              phase: "failed",
                              message: e instanceof Error ? e.message : "Failed to start deploy.",
                              log_tail: [],
                            },
                          }));
                        }
                      }}
                    >
                      {deploy?.phase === "running" ? "Deploying…" : "Deploy function"}
                    </button>
                    {deploy && (deploy.phase === "running" || deploy.phase === "failed") && (
                      <div className="deploy-log">
                        <div className="deploy-log-head">{deploy.message}</div>
                        {deploy.log_tail.length > 0 && (
                          <pre className="deploy-log-body">
                            {deploy.log_tail.slice(-12).join("\n")}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </StepRow>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function canDeploy(
  modalConnected: boolean,
  model: ModelSetupStatus,
  deploy: DeployJob | null,
): boolean {
  const checkpointsOk = model.checkpoints.length > 0 && model.checkpoints.every((c) => c.present);
  return modalConnected && checkpointsOk && deploy?.phase !== "running";
}

// --- helpers ---------------------------------------------------------------- //

type RowState = "ready" | "pending" | "action" | "running" | "failed" | "blocked";

function StepRow({
  label,
  hint,
  state,
  children,
}: {
  label: string;
  hint: string;
  state: RowState;
  children?: React.ReactNode;
}) {
  return (
    <div className={`setup-row setup-row-${state}`}>
      <div className="setup-row-head">
        <StateDot state={state} />
        <div className="setup-row-text">
          <div className="setup-row-label">{label}</div>
          <div className="setup-row-hint">{hint}</div>
        </div>
      </div>
      {children && <div className="setup-row-body">{children}</div>}
    </div>
  );
}

function StateDot({ state }: { state: RowState }) {
  if (state === "ready") return <CheckCircleIcon size={18} style={{ color: "var(--green-2)" }} />;
  if (state === "failed" || state === "blocked")
    return <WarningIcon size={18} style={{ color: "var(--err-fg)" }} />;
  if (state === "running") return <span className="spinner" />;
  return <span className="pending-circle" />;
}

function CheckpointRow({
  name,
  present,
  sizeMb,
  uploading,
  disabled,
  onPick,
  onFile,
  fileRef,
}: {
  name: string;
  present: boolean;
  sizeMb?: number;
  uploading: boolean;
  disabled: boolean;
  onPick: () => void;
  onFile: (f: File) => void;
  fileRef: (el: HTMLInputElement | null) => void;
}) {
  return (
    <div className="checkpoint-row">
      <div className="checkpoint-row-left">
        {present ? (
          <CheckCircleIcon size={16} style={{ color: "var(--green-2)" }} />
        ) : (
          <span className="pending-circle" />
        )}
        <span className="mono" style={{ fontSize: 13 }}>
          {name}
        </span>
        {present && sizeMb != null && (
          <span className="list-note">
            {sizeMb >= 0.1 ? `${sizeMb.toFixed(1)} MB` : "< 0.1 MB"}
          </span>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      {!present && (
        <button className="btn" onClick={onPick} disabled={disabled} style={{ fontSize: 12.5 }}>
          <UploadIcon size={14} />
          {uploading ? "Uploading…" : "Upload"}
        </button>
      )}
    </div>
  );
}
