// Scripted stand-in for the real HTTP api client, used by the demo build.
// Every method returns canned data; nothing talks to a backend.

import type {
  CheckpointListResponse,
  CheckpointMeta,
  CheckpointsResponse,
  ComputeCapabilitiesResponse,
  ComputeStatusResponse,
  DeployJob,
  DiscoverWorkersResponse,
  HealthResponse,
  ModelInfo,
  ModelRegistryResponse,
  OpenFolderResult,
  ReadinessResponse,
  Run,
  RunResults,
  SetupStatusResponse,
  TrainingDataset,
  TrainingDatasetSummary,
  TrainingRun,
  TrainingRunSummary,
  UploadResponse,
  Video,
  VideoListResponse,
  WorkerPairResponse,
} from "./types";

import { openDemoGate } from "../components/DemoGate";

const DEMO_ERROR_PREFIX = "DEMO_REQUIRES_DESKTOP:";
export function isDemoGateError(e: unknown): boolean {
  return e instanceof Error && e.message.startsWith(DEMO_ERROR_PREFIX);
}
function gate(action: string): never {
  openDemoGate(action);
  throw new Error(`${DEMO_ERROR_PREFIX}${action}`);
}

const nowIso = () => new Date().toISOString();
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

// -------------------- Models --------------------
const MODELS: ModelInfo[] = [
  {
    id: "tool",
    name: "Tool Tracking",
    description: "Detect and track surgical instruments across every frame.",
    output_type: "tracking",
    outputs: [
      { key: "frame_csv", label: "Frame-level outputs", description: "Per-frame instrument positions" },
      { key: "video_csv", label: "Video-level summary", description: "Averaged kinematic metrics" },
    ],
    status: "available",
  },
  {
    id: "step",
    name: "Surgical Step Recognition",
    description: "Segment the procedure into standard phases.",
    output_type: "temporal",
    outputs: [{ key: "step_csv", label: "Predicted step segments", description: "Phase label per frame" }],
    status: "available",
  },
  {
    id: "error",
    name: "Adverse Event Detection",
    description: "Flag intraoperative events like bleeding, spillage, and thermal injury.",
    output_type: "events",
    outputs: [{ key: "event_csv", label: "Detected events", description: "Timestamped events" }],
    status: "available",
  },
  {
    id: "mc2",
    name: "Meta-Competencies",
    description: "Score tissue handling, psychomotor skill, progress, dissection and exposure quality.",
    output_type: "scores",
    outputs: [{ key: "video_csv", label: "Per-competency scores", description: "Six competency scores per clip" }],
    status: "available",
  },
  {
    id: "pgs",
    name: "Disease Severity (PGS)",
    description: "Parkland grade from gallbladder appearance.",
    output_type: "grade",
    outputs: [{ key: "pgs_csv", label: "Grade + distribution", description: "Predicted grade with probability distribution" }],
    status: "available",
  },
  {
    id: "cvs",
    name: "Critical View of Safety",
    description: "Assess the CVS criteria: cystic isolation, hepatocystic clearance, cystic plate exposure.",
    output_type: "criteria",
    outputs: [{ key: "criteria_json", label: "Criteria status", description: "Per-criterion achievement + detection window" }],
    status: "available",
  },
];

const modelById = (id: string) => MODELS.find((m) => m.id === id) ?? MODELS[0];

// -------------------- Videos --------------------
const DEMO_VIDEO: Video = {
  id: "demo-video-1",
  filename: "example_laparoscopic_cholecystectomy.mp4",
  size_bytes: 45_320_000,
  readable: true,
  linked: false,
  source_path: null,
  error: null,
};
const videos: Video[] = [DEMO_VIDEO];
const videoById = (id: string): Video => videos.find((v) => v.id === id) ?? DEMO_VIDEO;

// -------------------- Compute --------------------
const compute: ComputeStatusResponse = {
  status: "connected",
  provider: "demo",
  provider_label: "Cloud (demo)",
  message: "Example compute connection. No real inference is performed in the demo.",
};

// -------------------- Runs --------------------
// A scripted run moves through queued → running → complete over ~5 seconds.
// `currentRun` holds the mutable state; `getRun` returns a clone so React
// sees each poll as a new object and re-renders.
let currentRun: Run | null = null;

function artifactUrl(name: string): string {
  // Relative to the Vite base path so the browser resolves against the
  // deployed bundle root, not the hosting-site root.
  const base = import.meta.env.BASE_URL || "/";
  return `${base}demo-data/${name}`;
}

function resultsFor(model: string): RunResults {
  switch (model) {
    case "tool":
      return {
        output_dir: "~/MINT Outputs/demo-run",
        artifacts: [
          { key: "frame_csv", label: "Frame-level outputs", kind: "csv", url: artifactUrl("frame_level_outputs.csv"), per_video: true },
          { key: "video_csv", label: "Video-level summary", kind: "csv", url: artifactUrl("video_level_outputs.csv"), per_video: false },
        ],
      };
    case "step":
      return {
        output_dir: "~/MINT Outputs/demo-run",
        artifacts: [
          { key: "step_csv", label: "Predicted step segments", kind: "csv", url: artifactUrl("pred_postprocessed.csv"), per_video: true },
        ],
      };
    case "error":
      return {
        output_dir: "~/MINT Outputs/demo-run",
        artifacts: [
          { key: "event_csv", label: "Detected events", kind: "csv", url: artifactUrl("events.csv"), per_video: true },
        ],
      };
    case "mc2":
      return {
        output_dir: "~/MINT Outputs/demo-run",
        artifacts: [
          { key: "video_csv", label: "Per-competency scores", kind: "csv", url: artifactUrl("video_level_outputs.csv"), per_video: false },
        ],
      };
    case "pgs":
      return {
        output_dir: "~/MINT Outputs/demo-run",
        artifacts: [
          { key: "pgs_csv", label: "Grade + distribution", kind: "csv", url: artifactUrl("pgs_grade.csv"), per_video: true },
        ],
      };
    case "cvs":
      return {
        output_dir: "~/MINT Outputs/demo-run",
        artifacts: [
          { key: "criteria_json", label: "Criteria status", kind: "json", url: artifactUrl("criteria.json"), per_video: true },
        ],
      };
    default:
      return { output_dir: "~/MINT Outputs/demo-run", artifacts: [] };
  }
}

function startScriptedRun(model: string, videoIds: string[]): Run {
  const modelLabel = modelById(model).name;
  const run: Run = {
    run_id: "demo-run-" + Date.now(),
    model,
    status: "queued",
    progress: 2,
    status_line: "Queued — reserving compute…",
    checklist: [
      { key: "preparing", label: "Preparing inputs", state: "current" },
      { key: "running", label: `Running ${modelLabel}`, state: "pending" },
      { key: "finishing", label: "Packaging outputs", state: "pending" },
    ],
    videos: videoIds.map((id) => ({ filename: videoById(id).filename, status: "pending" })),
    summary: { processed: 0, successful: 0, failed: 0 },
    logs: [
      { tag: "demo", message: "Scripted demo run started. No actual inference will happen.", level: "info" },
    ],
    error: null,
    results: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  currentRun = run;

  const steps: Array<{ delay: number; apply: (r: Run) => void }> = [
    {
      delay: 400,
      apply: (r) => {
        r.status = "running";
        r.progress = 12;
        r.status_line = "Preparing inputs…";
        r.updated_at = nowIso();
      },
    },
    {
      delay: 1400,
      apply: (r) => {
        r.progress = 32;
        r.status_line = `Running ${modelLabel}…`;
        r.checklist[0].state = "done";
        r.checklist[1].state = "current";
        r.videos.forEach((v) => (v.status = "processing"));
        r.logs.push({ tag: "demo", message: `${modelLabel} container warm, starting inference.`, level: "info" });
        r.updated_at = nowIso();
      },
    },
    {
      delay: 2900,
      apply: (r) => {
        r.progress = 68;
        r.status_line = `Running ${modelLabel}…`;
        r.updated_at = nowIso();
      },
    },
    {
      delay: 4100,
      apply: (r) => {
        r.progress = 93;
        r.status_line = "Packaging outputs…";
        r.checklist[1].state = "done";
        r.checklist[2].state = "current";
        r.updated_at = nowIso();
      },
    },
    {
      delay: 5100,
      apply: (r) => {
        r.status = "complete";
        r.progress = 100;
        r.status_line = "Complete.";
        r.checklist.forEach((c) => (c.state = "done"));
        r.videos.forEach((v) => (v.status = "complete"));
        r.summary = { processed: videoIds.length, successful: videoIds.length, failed: 0 };
        r.results = resultsFor(model);
        r.logs.push({ tag: "demo", message: "Outputs packaged.", level: "info" });
        r.updated_at = nowIso();
      },
    },
  ];
  for (const step of steps) {
    setTimeout(() => step.apply(run), step.delay);
  }
  return clone(run);
}

// -------------------- Training datasets --------------------
const datasets: Record<string, TrainingDataset> = {
  "demo-ds-pgs-1": {
    id: "demo-ds-pgs-1",
    model_id: "pgs",
    name: "Example PGS dataset",
    sample_count: 5,
    class_counts: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 },
    group: null,
    labels_file: null,
    samples: [
      { video_id: "demo-video-1", label: 1 },
      { video_id: "demo-video-1", label: 2 },
      { video_id: "demo-video-1", label: 3 },
      { video_id: "demo-video-1", label: 4 },
      { video_id: "demo-video-1", label: 5 },
    ],
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  "demo-ds-mc2-1": {
    id: "demo-ds-mc2-1",
    model_id: "mc2",
    name: "Example MC2 dataset — Tissue Handling",
    sample_count: 8,
    class_counts: { adeq: 4, inad: 4 },
    group: "TH",
    labels_file: null,
    samples: [
      { video_id: "demo-video-1", label: "adeq" },
      { video_id: "demo-video-1", label: "adeq" },
      { video_id: "demo-video-1", label: "adeq" },
      { video_id: "demo-video-1", label: "adeq" },
      { video_id: "demo-video-1", label: "inad" },
      { video_id: "demo-video-1", label: "inad" },
      { video_id: "demo-video-1", label: "inad" },
      { video_id: "demo-video-1", label: "inad" },
    ],
    created_at: nowIso(),
    updated_at: nowIso(),
  },
};
const datasetSummary = (d: TrainingDataset): TrainingDatasetSummary => ({
  id: d.id,
  model_id: d.model_id,
  name: d.name,
  sample_count: d.sample_count,
  class_counts: d.class_counts,
  group: d.group,
  labels_file: d.labels_file,
  created_at: d.created_at,
  updated_at: d.updated_at,
});

// -------------------- Training runs --------------------
const trainingRuns: Record<string, TrainingRun> = {
  "demo-tr-1": {
    id: "demo-tr-1",
    model_id: "pgs",
    dataset_id: "demo-ds-pgs-1",
    name: "Example PGS fine-tune",
    status: "complete",
    phase: "complete",
    progress: 100,
    status_line: "Complete.",
    logs: [
      { tag: "demo", message: "Example training run — not a real train.", level: "info" },
    ],
    metrics: {
      model: "pgs",
      n_train: 4,
      n_test: 1,
      accuracy: 0.8,
      mae: 0.42,
      cohen_kappa_quadratic: 0.76,
    },
    produced_checkpoint_id: "demo-ckpt-1",
    auto_activate: true,
    error: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
};

// -------------------- Checkpoints --------------------
const checkpoints: Record<string, CheckpointMeta[]> = {
  pgs: [
    {
      id: "demo-ckpt-shipped-pgs",
      model_id: "pgs",
      name: "Shipped PGS checkpoint",
      source: "shipped",
      filename: "dinov3_vith16plus_logreg_pipeline.pkl",
      size_bytes: 1_240_000_000,
      metrics: null,
      is_active: true,
      created_at: nowIso(),
    },
    {
      id: "demo-ckpt-1",
      model_id: "pgs",
      name: "Example PGS fine-tune",
      source: "user_trained",
      training_run_id: "demo-tr-1",
      dataset_id: "demo-ds-pgs-1",
      filename: "dinov3_vith16plus_logreg_pipeline.pkl",
      size_bytes: 1_240_000_000,
      metrics: trainingRuns["demo-tr-1"].metrics,
      is_active: false,
      created_at: nowIso(),
    },
  ],
};

// -------------------- Exported api --------------------
export const demoApi = {
  health: async (): Promise<HealthResponse> => ({
    status: "ok",
    engine: "mock",
    version: "demo",
    service: "mint",
  }),
  readiness: async (): Promise<ReadinessResponse> => ({
    engine: "mock",
    overall: "ready",
    checks: [
      { name: "Compute", status: "ready", note: "Example compute connected." },
      { name: "Checkpoints", status: "ready", note: "All example checkpoints ready." },
    ],
    message: "Ready (demo).",
  }),
  checkpoints: async (): Promise<CheckpointsResponse> => ({
    checkpoints: [],
    all_required_present: true,
    message: "All example checkpoints ready.",
  }),

  listVideos: async (): Promise<VideoListResponse> => ({ videos: clone(videos) }),
  uploadVideos: async (_files: File[]): Promise<UploadResponse> => {
    gate("upload a video");
  },
  linkVideos: async (_paths: string[]): Promise<UploadResponse> => {
    gate("link local files");
  },
  deleteVideo: async (_id: string): Promise<void> => {
    gate("delete the example video");
  },

  createRun: async (videoIds: string[], model: string): Promise<Run> =>
    startScriptedRun(model, videoIds.length > 0 ? videoIds : ["demo-video-1"]),
  getRun: async (id: string): Promise<Run> => {
    if (currentRun && currentRun.run_id === id) return clone(currentRun);
    throw new Error("Run not found.");
  },
  openFolder: async (_url: string): Promise<OpenFolderResult> => {
    gate("open the output folder");
  },

  models: async (): Promise<ModelRegistryResponse> => ({ models: clone(MODELS) }),
  computeStatus: async (): Promise<ComputeStatusResponse> => clone(compute),
  computeConnect: async (): Promise<ComputeStatusResponse> => clone(compute),
  computeDisconnect: async (): Promise<ComputeStatusResponse> => clone(compute),
  computePairWorker: async (): Promise<WorkerPairResponse> => ({
    ...clone(compute),
    worker_url: null,
  }),
  computeUnpairWorker: async (): Promise<ComputeStatusResponse> => clone(compute),
  computeDiscoverWorkers: async (): Promise<DiscoverWorkersResponse> => ({
    workers: [],
    scanned_ms: 0,
    message: "Worker discovery is disabled in the demo.",
  }),
  computeCapabilities: async (): Promise<ComputeCapabilitiesResponse> => ({
    provider: "demo",
    provider_label: "Cloud (demo)",
    capabilities: MODELS.map((m) => ({ model_id: m.id, app_name: m.id, kind: "real" as const })),
    message: "All models shown as available in the demo.",
  }),

  setupStatus: async (): Promise<SetupStatusResponse> => ({
    modal_connected: true,
    modal_sdk_installed: true,
    models: MODELS.map((m) => ({
      model_id: m.id,
      checkpoints: [],
      deployed: true,
      ready: true,
      deploy_error: null,
    })),
  }),
  uploadCheckpoint: async (): Promise<{ model_id: string; remote_name: string; bytes: number }> => {
    gate("upload a checkpoint");
  },
  deployStart: async (modelId: string): Promise<DeployJob> => ({
    model_id: modelId,
    phase: "complete",
    message: "Already deployed (demo).",
    log_tail: [],
  }),
  deployStatus: async (modelId: string): Promise<DeployJob> => ({
    model_id: modelId,
    phase: "complete",
    message: "Already deployed (demo).",
    log_tail: [],
  }),

  // Training
  listDatasets: async (modelId?: string): Promise<TrainingDatasetSummary[]> => {
    const all = Object.values(datasets).map(datasetSummary);
    return modelId ? all.filter((d) => d.model_id === modelId) : all;
  },
  createDataset: async (): Promise<TrainingDataset> => {
    gate("create a dataset");
  },
  getDataset: async (id: string): Promise<TrainingDataset> => {
    const d = datasets[id];
    if (!d) throw new Error("Dataset not found.");
    return clone(d);
  },
  updateDataset: async (): Promise<TrainingDataset> => {
    gate("edit a dataset");
  },
  deleteDataset: async (): Promise<void> => {
    gate("delete a dataset");
  },
  uploadDatasetLabels: async (): Promise<TrainingDataset> => {
    gate("upload labels");
  },
  listTrainingRuns: async (modelId?: string): Promise<TrainingRunSummary[]> => {
    const all: TrainingRunSummary[] = Object.values(trainingRuns).map((r) => ({
      id: r.id,
      model_id: r.model_id,
      dataset_id: r.dataset_id,
      status: r.status,
      progress: r.progress,
      produced_checkpoint_id: r.produced_checkpoint_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    return modelId ? all.filter((r) => r.model_id === modelId) : all;
  },
  createTrainingRun: async (): Promise<TrainingRun> => {
    gate("start a training run");
  },
  getTrainingRun: async (id: string): Promise<TrainingRun> => {
    const r = trainingRuns[id];
    if (!r) throw new Error("Training run not found.");
    return clone(r);
  },

  listCheckpoints: async (modelId: string): Promise<CheckpointListResponse> => {
    const list = checkpoints[modelId] ?? [];
    const active = list.find((c) => c.is_active);
    return { model_id: modelId, checkpoints: clone(list), active_id: active?.id ?? null };
  },
  activateCheckpoint: async (): Promise<CheckpointMeta> => {
    gate("switch the active checkpoint");
  },
};
