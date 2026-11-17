import { useEffect, useMemo, useState } from "react";
import { absoluteUrl } from "../../api/client";
import type { ChecklistItem, ModelInfo, OutputArtifact, Run } from "../../api/types";
import { parseCsv, type ParsedCsv } from "../../lib/csv";
import { CheckCircleIcon, WarningIcon, XCircleIcon } from "../icons";
import { TechnicalDetails } from "../TechnicalDetails";

type Tab = "video" | "motion" | "files";

// Palette for the three canonical tool-tracking instruments. Keeping it local
// to Results since this is the only place colors need to match CSV rows.
const INST_COLORS: Record<string, string> = {
  grasper: "#3e9466",
  hook: "#4a6cb8",
  "clip applier": "#c88a2a",
  "clip_applier": "#c88a2a",
  default: "#7f8692",
};

export function Results({
  run,
  selectedModel,
  onNewAnalysis,
}: {
  run: Run | null;
  selectedModel: ModelInfo | null;
  onNewAnalysis: () => void;
}) {
  const [tab, setTab] = useState<Tab>("files");

  if (!run) {
    return (
      <>
        <div className="step-eyebrow">STEP 5 OF 5</div>
        <h1 className="step-title">Results</h1>
        <p className="empty" style={{ marginTop: 24 }}>
          Results appear here once a run completes.
        </p>
      </>
    );
  }

  const active = run.status === "running" || run.status === "queued";
  const complete = run.status === "complete" && run.results;
  const failed = run.status === "failed";

  const metaLine = useMemo(() => {
    const parts: string[] = [];
    if (selectedModel) parts.push(selectedModel.name);
    if (run.status === "complete") parts.push("Completed");
    else if (run.status === "failed") parts.push("Failed");
    else parts.push("Running");
    if (run.updated_at) {
      const d = new Date(run.updated_at);
      if (!Number.isNaN(d.getTime())) {
        parts.push(
          d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        );
      }
    }
    parts.push("Modal");
    return parts.join(" · ");
  }, [run, selectedModel]);

  const zipArtifact = run.results?.artifacts.find((a) => a.kind === "zip");

  return (
    <>
      <div className="step-eyebrow">STEP 5 OF 5</div>
      <div className="results-head">
        <div className="results-head-text">
          <h1 className="step-title" style={{ marginBottom: 4 }}>
            Results
          </h1>
          <div className="results-head-meta">{metaLine}</div>
        </div>
        <div className="results-head-actions">
          <button className="btn" onClick={onNewAnalysis}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M9 2l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 7h7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            New analysis
          </button>
          {zipArtifact && (
            <a
              className="btn"
              style={{
                background: "var(--cardinal)",
                borderColor: "var(--cardinal)",
                color: "#fff",
              }}
              href={absoluteUrl(zipArtifact.url)}
              target="_blank"
              rel="noreferrer"
            >
              Download all results (.zip)
            </a>
          )}
        </div>
      </div>

      <StatTiles run={run} />

      {active && <RunningPanel run={run} />}
      {failed && run.error && <FailedPanel run={run} />}

      {complete && run.results && (
        <>
          <div className="demo-note">
            <b>DEMONSTRATION DATA</b>
            Values below come from your actual run. Overlays and chart
            visualizations in the prototype views are placeholders.
          </div>

          <div className="results-tabs">
            <button
              type="button"
              className={`results-tab${tab === "video" ? " active" : ""}`}
              onClick={() => setTab("video")}
            >
              Video analysis
            </button>
            <button
              type="button"
              className={`results-tab${tab === "motion" ? " active" : ""}`}
              onClick={() => setTab("motion")}
            >
              Motion metrics
            </button>
            <button
              type="button"
              className={`results-tab${tab === "files" ? " active" : ""}`}
              onClick={() => setTab("files")}
            >
              Output files
            </button>
          </div>

          {tab === "video" && <VideoAnalysisTab />}
          {tab === "motion" && (
            <MotionMetricsTab run={run} selectedModel={selectedModel} />
          )}
          {tab === "files" && (
            <OutputFilesTab run={run} selectedModel={selectedModel} />
          )}
        </>
      )}
    </>
  );
}

// --------------------------------------------------------------------- stats //

function StatTiles({ run }: { run: Run }) {
  const processed = run.summary?.processed ?? 0;
  const successful = run.summary?.successful ?? 0;
  const failed = run.summary?.failed ?? 0;
  return (
    <div className="stat-tiles" style={{ marginBottom: 20 }}>
      <div className="stat-tile">
        <div className="stat-cap" style={{ marginBottom: 6, marginTop: 0 }}>
          Videos processed
        </div>
        <div className="stat-num">{processed}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-cap" style={{ marginBottom: 6, marginTop: 0 }}>
          Successful
        </div>
        <div className="stat-num green">{successful}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-cap" style={{ marginBottom: 6, marginTop: 0 }}>
          Failed
        </div>
        <div className="stat-num red">{failed}</div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------- running panel //

function CheckIcon({ state }: { state: ChecklistItem["state"] }) {
  if (state === "done") return <CheckCircleIcon size={18} style={{ color: "var(--green-2)" }} />;
  if (state === "current") return <span className="spinner" />;
  if (state === "failed") return <XCircleIcon size={18} style={{ color: "var(--err-fg)" }} />;
  return <span className="pending-circle" />;
}

function RunningPanel({ run }: { run: Run }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div className="progress-head">
          <span>Progress</span>
          <span className="progress-pct">{run.progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${run.progress}%` }} />
        </div>
        {run.status_line && <div className="status-line">{run.status_line}</div>}
      </div>
      <div className="checklist">
        {run.checklist.map((item) => (
          <div className={`check-item ${item.state}`} key={item.key}>
            <span className="check-icon">
              <CheckIcon state={item.state} />
            </span>
            {item.label}
          </div>
        ))}
      </div>
      <TechnicalDetails logs={run.logs} />
    </>
  );
}

function FailedPanel({ run }: { run: Run }) {
  return (
    <div className="callout error" style={{ marginBottom: 20 }}>
      <WarningIcon />
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Inference could not complete
        </div>
        <div>{run.error?.message}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- video analysis //

function VideoAnalysisTab() {
  // Deliberately scoped: the full video-player-with-canvas-overlays view is
  // in the design mocks but not implemented yet (needs raw-video hosting +
  // frame-synced canvas layer). Placeholder keeps the tab from looking
  // broken.
  return (
    <div className="motion-card" style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
        In-app video viewer coming soon
      </div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 8, maxWidth: 480, margin: "8px auto 0" }}>
        We'll overlay bounding boxes on your source video, synchronized with
        the frame-level CSV. For now, open the <b>Output files</b> tab to
        download the raw data or scrub the CSV preview.
      </div>
    </div>
  );
}

// ------------------------------------------------------------ motion metrics //

interface InstrumentSummary {
  name: string;
  color: string;
  timeInView: string;
  avgVelocity: string;
  avgAccel: string;
  distance: number;
  meanDistCenter: string;
}

function MotionMetricsTab({
  run,
  selectedModel,
}: {
  run: Run;
  selectedModel: ModelInfo | null;
}) {
  const videoCsv = run.results?.artifacts.find((a) => a.key === "video_csv");
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!videoCsv) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(absoluteUrl(videoCsv.url));
        if (!res.ok) throw new Error(`${res.status}`);
        const text = await res.text();
        const parsed = parseCsv(text);
        if (!cancelled) setCsv(parsed);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Could not load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoCsv?.url]);

  // Only tool tracking produces per-instrument video-level rows. For other
  // models, show a graceful fallback until we add per-model summary logic.
  const isToolTracking = selectedModel?.id === "tool";

  const instruments = useMemo<InstrumentSummary[]>(() => {
    if (!csv || csv.rows.length === 0) return [];
    const headerIdx = headerMap(csv.headers);
    const nameIdx =
      headerIdx["instrument"] ?? headerIdx["tool"] ?? headerIdx["name"] ?? 0;
    return csv.rows.map((r) => {
      const name = r[nameIdx] ?? "";
      const color = INST_COLORS[name.toLowerCase()] ?? INST_COLORS.default;
      const num = (k: string): number => {
        const i = headerIdx[k];
        if (i === undefined) return NaN;
        return parseFloat(r[i]);
      };
      const dist =
        num("distance") || num("total_distance") || num("distance_px") || 0;
      return {
        name,
        color,
        timeInView: fmtVal(num("time_in_view") || num("duration") || num("time_in_view_s"), "s"),
        avgVelocity: fmtVal(num("avg_velocity") || num("mean_velocity"), "px/s"),
        avgAccel: fmtVal(num("avg_acceleration") || num("mean_acceleration"), "px/s²"),
        distance: dist,
        meanDistCenter: fmtVal(
          num("mean_distance_from_center") || num("mean_dist_from_center"),
          "px",
        ),
      };
    });
  }, [csv]);

  const maxDist = Math.max(1, ...instruments.map((i) => i.distance));

  if (!videoCsv) {
    return <EmptyMotion message="No video-level CSV available for this run." />;
  }
  if (err) return <EmptyMotion message={`Could not load the video-level CSV (${err}).`} />;
  if (!csv) return <EmptyMotion message="Loading…" />;
  if (!isToolTracking) {
    return <EmptyMotion message="Motion metrics are specific to Tool Tracking." />;
  }
  if (instruments.length === 0) {
    return <EmptyMotion message="The video-level CSV didn't contain any rows." />;
  }

  return (
    <>
      <div className="motion-card" style={{ marginBottom: 14 }}>
        <h4 style={{ marginBottom: 10 }}>Distance traveled</h4>
        <div className="motion-bars">
          {instruments.map((inst) => (
            <div className="motion-bar-row" key={inst.name}>
              <div className="motion-bar-head">
                <span>
                  <span className="inst-dot" style={{ background: inst.color }} />
                  {inst.name}
                </span>
                <span className="motion-bar-val">
                  {Math.round(inst.distance).toLocaleString()} px
                </span>
              </div>
              <div className="motion-bar-track">
                <div
                  className="motion-bar-fill"
                  style={{
                    width: `${(inst.distance / maxDist) * 100}%`,
                    background: inst.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-table-wrap">
        <div className="summary-table-head">
          <span className="summary-table-title">Video-level summary</span>
          <span className="summary-table-source">
            {videoCsv.label.toLowerCase()}
          </span>
        </div>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Time in view</th>
              <th>Avg velocity</th>
              <th>Avg acceleration</th>
              <th>Distance</th>
              <th>Mean dist. from center</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((inst) => (
              <tr key={inst.name}>
                <td>
                  <span className="inst-dot" style={{ background: inst.color }} />
                  {inst.name}
                </td>
                <td className="mono">{inst.timeInView}</td>
                <td className="mono">{inst.avgVelocity}</td>
                <td className="mono">{inst.avgAccel}</td>
                <td className="mono">{Math.round(inst.distance).toLocaleString()} px</td>
                <td className="mono">{inst.meanDistCenter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EmptyMotion({ message }: { message: string }) {
  return (
    <div className="motion-card" style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 14, color: "var(--muted)" }}>{message}</div>
    </div>
  );
}

function fmtVal(n: number, unit: string): string {
  if (!Number.isFinite(n)) return "-";
  const rounded = Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(1);
  return `${rounded} ${unit}`;
}

function headerMap(headers: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  headers.forEach((h, i) => {
    out[h.trim().toLowerCase()] = i;
  });
  return out;
}

// --------------------------------------------------------------- output files //

function OutputFilesTab({
  run,
  selectedModel,
}: {
  run: Run;
  selectedModel: ModelInfo | null;
}) {
  const artifacts = run.results?.artifacts ?? [];
  const csvs = artifacts.filter((a) => a.kind === "csv");
  const zip = artifacts.find((a) => a.kind === "zip");
  const frameCsv = csvs.find((a) => a.key === "frame_csv");
  const videoCsv = csvs.find((a) => a.key === "video_csv");

  return (
    <>
      {csvs.map((a) => (
        <OutputFileRow key={a.key} artifact={a} model={selectedModel} />
      ))}
      {zip && (
        <OutputFileRow
          artifact={zip}
          model={selectedModel}
          overrideDesc={`Frame- and video-level CSVs for every successful video, in one archive.`}
        />
      )}

      {frameCsv && (
        <CsvPreview frameCsv={frameCsv} videoCsv={videoCsv} />
      )}
    </>
  );
}

function OutputFileRow({
  artifact,
  model,
  overrideDesc,
}: {
  artifact: OutputArtifact;
  model: ModelInfo | null;
  overrideDesc?: string;
}) {
  const modelOutput = model?.outputs.find((o) => o.key === artifact.key);
  const desc = overrideDesc ?? modelOutput?.description ?? "";
  return (
    <div className="output-file-row">
      <div className="output-file-left">
        <div className="output-file-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect
              x="2.5"
              y="2.5"
              width="11"
              height="11"
              rx="1.4"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M2.5 6h11M6 2.5v11"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="output-file-title">
            {artifact.label}
          </div>
          {desc && <div className="output-file-desc">{desc}</div>}
        </div>
      </div>
      <a
        className="btn"
        href={absoluteUrl(artifact.url)}
        target="_blank"
        rel="noreferrer"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 2v7M4 7l3 3 3-3M2 12h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Download
      </a>
    </div>
  );
}

// -------------------------------------------------------------- CSV preview //

const PREVIEW_ROW_LIMIT = 500;

function CsvPreview({
  frameCsv,
  videoCsv,
}: {
  frameCsv: OutputArtifact;
  videoCsv?: OutputArtifact;
}) {
  const [which, setWhich] = useState<"frame" | "video">("frame");
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const artifact = which === "frame" ? frameCsv : videoCsv;

  useEffect(() => {
    if (!artifact) return;
    let cancelled = false;
    setCsv(null);
    setErr(null);
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(absoluteUrl(artifact.url));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (text.startsWith("PK")) {
          // Multi-video artifact returns a zip; we can't preview it.
          throw new Error("Preview not available for multi-video runs. Use Download.");
        }
        const parsed = parseCsv(text);
        if (!cancelled) setCsv(parsed);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Could not load CSV");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [artifact?.url]);

  const previewRows = csv ? csv.rows.slice(0, PREVIEW_ROW_LIMIT) : [];
  const truncated = csv ? csv.rows.length - previewRows.length : 0;

  return (
    <div className="csv-preview">
      <div className="csv-preview-head">
        <div className="csv-preview-title-wrap">
          <div className="csv-preview-title">CSV preview</div>
          <div className="csv-preview-source">
            {artifact?.label ?? ""}
            {csv && ` · ${csv.rows.length.toLocaleString()} rows`}
            {truncated > 0 && ` · showing first ${PREVIEW_ROW_LIMIT.toLocaleString()}`}
          </div>
        </div>
        {videoCsv && (
          <div className="csv-tab-group">
            <button
              className={`csv-tab${which === "frame" ? " active" : ""}`}
              onClick={() => setWhich("frame")}
            >
              Frame-level
            </button>
            <button
              className={`csv-tab${which === "video" ? " active" : ""}`}
              onClick={() => setWhich("video")}
            >
              Video-level
            </button>
          </div>
        )}
      </div>

      {loading && <div className="csv-empty">Loading…</div>}
      {!loading && err && <div className="csv-empty">{err}</div>}
      {!loading && !err && csv && (
        <div className="csv-table-wrap">
          <table className="csv-table">
            <thead>
              <tr>
                {csv.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i}>
                  {csv.headers.map((_h, j) => (
                    <td key={j}>{row[j] ?? ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
