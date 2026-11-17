import type { ModelInfo, Run } from "../../api/types";
import { CheckpointPicker } from "../CheckpointPicker";

export function RunAnalysis({
  run,
  selectedModel,
  videoCount,
  computeLabel,
  onChangeStep,
}: {
  run: Run | null;
  selectedModel: ModelInfo | null;
  videoCount: number;
  computeLabel: string;
  canRun: boolean;
  starting: boolean;
  blockedReason?: string;
  onRun: () => void;
  onChangeStep: (n: number) => void;
}) {
  // Note: the Run inference button lives in the StepFooter (controlled by
  // App.tsx), so this body is purely a review summary. Active-run state is
  // handled on Step 5 (Results) which is auto-opened when run starts.

  return (
    <>
      <div className="step-eyebrow">STEP 4 OF 5</div>
      <h1 className="step-title">Review &amp; run</h1>
      <p className="step-sub">
        Check everything below. Nothing is uploaded until you press Run
        inference.
      </p>

      <div className="run-summary-table">
        <ReviewRow
          label="Model"
          value={
            selectedModel ? (
              <>
                <strong>{selectedModel.name}</strong>
                <div className="run-summary-sub">{selectedModel.description}</div>
              </>
            ) : (
              <span style={{ color: "var(--faint)" }}>Not selected</span>
            )
          }
          onChange={() => onChangeStep(1)}
        />
        <ReviewRow
          label="Videos"
          value={
            videoCount > 0 ? (
              <>
                <strong>
                  {videoCount} video{videoCount !== 1 ? "s" : ""}
                </strong>
              </>
            ) : (
              <span style={{ color: "var(--faint)" }}>No videos selected</span>
            )
          }
          onChange={() => onChangeStep(2)}
        />
        <ReviewRow
          label="Compute"
          value={
            <>
              <strong>{computeLabel}</strong>
            </>
          }
          onChange={() => onChangeStep(3)}
        />
        {selectedModel && (
          <ReviewRow
            label="Checkpoint"
            value={<CheckpointPicker modelId={selectedModel.id} />}
          />
        )}
        <ReviewRow
          label="Outputs"
          value={
            selectedModel && selectedModel.outputs.length > 0 ? (
              <>
                <strong>
                  {selectedModel.outputs.map((o) => o.label).join(", ")}
                </strong>
                <div className="run-summary-sub">
                  Plus a CSV preview inside MINT once the run completes.
                </div>
              </>
            ) : (
              <span style={{ color: "var(--faint)" }}>-</span>
            )
          }
          last
        />
      </div>

      {videoCount > 0 && (
        <div className="callout info" style={{ marginTop: 20, fontSize: 13.5 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M8 1l6 3v4c0 4-6 7-6 7s-6-3-6-7V4l6-3z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            {videoCount} video{videoCount !== 1 ? "s" : ""} will be uploaded to
            your Modal workspace for processing. You confirmed they are
            de-identified and contain no PHI.
          </span>
        </div>
      )}

      {run?.status === "failed" && run.error && (
        <div className="callout error" style={{ marginTop: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Last run failed
            </div>
            <div>{run.error.message}</div>
          </div>
        </div>
      )}
    </>
  );
}

function ReviewRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: React.ReactNode;
  onChange?: () => void;
  last?: boolean;
}) {
  return (
    <div
      className="run-summary-row"
      style={last ? { borderBottom: "none" } : undefined}
    >
      <span className="run-summary-label">{label}</span>
      <span className="run-summary-value">{value}</span>
      {onChange ? (
        <button
          type="button"
          className="run-summary-change"
          onClick={onChange}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Change
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
