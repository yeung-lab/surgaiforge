// Mirrors backend/app/schemas.py one-to-one. Keep in sync.

export type ReadyStatus = "ready" | "needs_attention" | "failed";
export type RunStatus = "queued" | "running" | "complete" | "failed";
export type StepState = "done" | "current" | "pending" | "failed";
export type VideoStatus = "pending" | "processing" | "complete" | "failed";

export interface ReadinessCheck {
  name: string;
  note?: string | null;
  status: ReadyStatus;
  detail?: string | null;
}
export interface ReadinessResponse {
  engine: string;
  overall: ReadyStatus;
  checks: ReadinessCheck[];
  message: string;
}

export interface Checkpoint {
  key: string;
  label: string;
  filename: string;
  required: boolean;
  present: boolean;
  size_bytes?: number | null;
  simulated: boolean;
}
export interface CheckpointsResponse {
  checkpoints: Checkpoint[];
  all_required_present: boolean;
  message: string;
}

export interface Video {
  id: string;
  filename: string;
  size_bytes: number;
  readable: boolean;
  error?: string | null;
  linked?: boolean;
  source_path?: string | null;
}
export interface UploadResponse {
  videos: Video[];
}
export interface VideoListResponse {
  videos: Video[];
}

export interface ChecklistItem {
  key: string;
  label: string;
  state: StepState;
}
export interface VideoProgress {
  filename: string;
  status: VideoStatus;
}
export interface RunSummary {
  processed: number;
  successful: number;
  failed: number;
}
export interface LogLine {
  tag: string;
  message: string;
  level: string;
}
export interface RunError {
  message: string;
}
export interface OutputArtifact {
  key: string;
  label: string;
  kind: string;
  url: string;
  per_video: boolean;
}
export interface RunResults {
  output_dir: string;
  artifacts: OutputArtifact[];
  drive_folder_url?: string | null;
}
export interface Run {
  run_id: string;
  model: string;
  status: RunStatus;
  progress: number;
  status_line: string;
  checklist: ChecklistItem[];
  videos: VideoProgress[];
  summary: RunSummary;
  logs: LogLine[];
  error?: RunError | null;
  results?: RunResults | null;
  created_at: string;
  updated_at: string;
}

export interface HealthResponse {
  status: string;
  engine: string;
  version: string;
  service?: string;
}

export interface OpenFolderResult {
  opened: boolean;
  path: string;
  zip_url: string;
  message: string;
}

// Model registry
export interface ModelOutput {
  key: string;
  label: string;
  description: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  output_type: string;
  outputs: ModelOutput[];
  status: string;
}

export interface ModelRegistryResponse {
  models: ModelInfo[];
}

// Compute
export interface ComputeStatusResponse {
  status: "not_connected" | "connecting" | "connected" | "failed";
  provider: string;
  provider_label: string;
  message: string;
}

export interface WorkerPairRequest {
  url: string;
  // Preferred: 6-digit code the worker prints on first boot. MINT
  // exchanges it for the long-lived token via /pair on the worker.
  code?: string | null;
  // Legacy / CI path — raw long-lived token (operator set
  // MINT_WORKER_TOKEN out of band).
  token?: string | null;
}

export interface WorkerPairResponse {
  status: "not_connected" | "connecting" | "connected" | "failed";
  provider: string;
  provider_label: string;
  message: string;
  worker_url?: string | null;
}

export interface DiscoveredWorker {
  url: string;
  name: string;
  hostname: string;
  auth_required: boolean;
  models: string[];
}

export interface DiscoverWorkersResponse {
  workers: DiscoveredWorker[];
  scanned_ms: number;
  message: string;
}

// Per-model capability of whatever backend is active. "real" = will run
// real inference, "mock" = canned bytes, "not_configured" = operator
// hasn't wired an endpoint/template for this model yet, "unknown" =
// backend doesn't advertise.
export type ComputeCapabilityKind = "real" | "mock" | "not_configured" | "unknown";

export interface ComputeCapability {
  model_id: string;
  app_name: string;
  kind: ComputeCapabilityKind;
}

export interface ComputeCapabilitiesResponse {
  provider: string;
  provider_label: string;
  capabilities: ComputeCapability[];
  message: string;
}


// Setup (no-code admin flow)
export interface CheckpointStatus {
  name: string;
  present: boolean;
  size_mb?: number | null;
}
export interface ModelSetupStatus {
  model_id: string;
  checkpoints: CheckpointStatus[];
  deployed: boolean;
  ready: boolean;
  deploy_error?: string | null;
}
export interface SetupStatusResponse {
  modal_connected: boolean;
  modal_sdk_installed: boolean;
  models: ModelSetupStatus[];
}
export type DeployPhase = "idle" | "running" | "complete" | "failed";
export interface DeployJob {
  model_id: string;
  phase: DeployPhase;
  started_at?: string | null;
  ended_at?: string | null;
  message: string;
  log_tail: string[];
}

// Training
export interface TrainingSample {
  video_id: string;
  // PGS = int 1-5. MC2 = "adeq" | "inad". Engine validates per-model.
  label: number | string;
}

export interface LabelsFileMeta {
  filename: string;
  format: string;      // "csv.pgs" | "csv.mc2" | "coco.cvs"
  size_bytes: number;
  summary: string;
  uploaded_at: string;
}

export interface TrainingDatasetSummary {
  id: string;
  model_id: string;
  name: string;
  sample_count: number;
  class_counts: Record<string, number>;
  // Optional sub-scope (e.g. MC2 competency "TH"). None for PGS.
  group?: string | null;
  labels_file?: LabelsFileMeta | null;
  created_at: string;
  updated_at: string;
}

export interface LabelsParseError {
  line: number | null;
  message: string;
}

export interface TrainingDataset extends TrainingDatasetSummary {
  samples: TrainingSample[];
}

export interface TrainingMetrics {
  model: string;
  n_train: number;
  n_test: number;
  n_clips?: number | null;
  n_frames?: number | null;
  // PGS metrics
  accuracy?: number | null;
  mae?: number | null;
  cohen_kappa_quadratic?: number | null;
  // MC2 metrics
  auroc?: number | null;
  auprc?: number | null;
  f1?: number | null;
}

export type CheckpointSource = "shipped" | "user_trained";
export interface CheckpointMeta {
  id: string;
  model_id: string;
  name: string;
  source: CheckpointSource;
  dataset_id?: string | null;
  training_run_id?: string | null;
  filename: string;
  size_bytes?: number | null;
  metrics?: TrainingMetrics | null;
  is_active: boolean;
  created_at: string;
}

export interface CheckpointListResponse {
  model_id: string;
  checkpoints: CheckpointMeta[];
  active_id?: string | null;
}

export type TrainingPhase =
  | "queued"
  | "preparing"
  | "step"
  | "keyframes"
  | "train"
  | "promote"
  | "complete";

export interface TrainingRun {
  id: string;
  model_id: string;
  dataset_id: string;
  name?: string | null;
  status: RunStatus;
  phase: string;
  progress: number;
  status_line: string;
  logs: LogLine[];
  metrics?: TrainingMetrics | null;
  produced_checkpoint_id?: string | null;
  auto_activate: boolean;
  error?: RunError | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingRunSummary {
  id: string;
  model_id: string;
  dataset_id: string;
  status: RunStatus;
  progress: number;
  produced_checkpoint_id?: string | null;
  created_at: string;
  updated_at: string;
}
