// Typed API client.
//
// The backend base URL is configurable at runtime so the same build works
// against a local server (empty base -> Vite proxies /api to :8010) or a Colab
// tunnel (e.g. https://xxxx.trycloudflare.com). It is persisted in localStorage.

import type {
  CheckpointListResponse,
  CheckpointMeta,
  CheckpointsResponse,
  ComputeCapabilitiesResponse,
  ComputeStatusResponse,
  DeployJob,
  DiscoverWorkersResponse,
  HealthResponse,
  ModelRegistryResponse,
  OpenFolderResult,
  ReadinessResponse,
  Run,
  SetupStatusResponse,
  TrainingDataset,
  TrainingDatasetSummary,
  TrainingRun,
  TrainingRunSummary,
  TrainingSample,
  UploadResponse,
  VideoListResponse,
  WorkerPairRequest,
  WorkerPairResponse,
} from "./types";

const STORAGE_KEY = "surgai_backend_url";

export function getBackendUrl(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function setBackendUrl(url: string): void {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
}

/** Turn a backend-relative path (e.g. an artifact url "/api/...") into a full URL. */
export function absoluteUrl(path: string): string {
  return `${getBackendUrl()}${path}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    // For endpoints that return a structured error body (e.g. labels upload
    // 422s come back with {message, format, errors: [{line, message}, …]}),
    // the whole `detail` object is attached so callers can render it.
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(absoluteUrl(path), init);
  } catch {
    throw new ApiError(0, "Cannot reach the backend. Check the Backend connection.");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let detail: unknown;
    try {
      const body = await res.json();
      detail = body?.detail;
      if (typeof detail === "string") {
        message = detail;
      } else if (detail && typeof detail === "object" && "message" in detail
          && typeof (detail as { message: unknown }).message === "string") {
        message = (detail as { message: string }).message;
      }
    } catch {
      /* ignore non-JSON errors */
    }
    throw new ApiError(res.status, message, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const realApi = {
  health: () => request<HealthResponse>("/api/health"),
  readiness: () => request<ReadinessResponse>("/api/system/readiness"),
  checkpoints: () => request<CheckpointsResponse>("/api/models/checkpoints"),

  listVideos: () => request<VideoListResponse>("/api/videos"),
  uploadVideos: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return request<UploadResponse>("/api/videos", { method: "POST", body: form });
  },
  linkVideos: (paths: string[]) =>
    request<UploadResponse>("/api/videos/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    }),
  deleteVideo: (id: string) =>
    request<void>(`/api/videos/${id}`, { method: "DELETE" }),

  createRun: (videoIds: string[], model: string) =>
    request<Run>("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_ids: videoIds, model }),
    }),
  getRun: (id: string) => request<Run>(`/api/runs/${id}`),
  openFolder: (url: string) => request<OpenFolderResult>(url, { method: "POST" }),

  models: () => request<ModelRegistryResponse>("/api/models"),
  computeStatus: () => request<ComputeStatusResponse>("/api/compute/status"),
  computeConnect: (credentials?: { token_id: string; token_secret: string }) =>
    request<ComputeStatusResponse>("/api/compute/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials ?? {}),
    }),
  computeDisconnect: () =>
    request<ComputeStatusResponse>("/api/compute/disconnect", { method: "POST" }),
  computePairWorker: (body: WorkerPairRequest) =>
    request<WorkerPairResponse>("/api/compute/worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  computeUnpairWorker: () =>
    request<ComputeStatusResponse>("/api/compute/worker", { method: "DELETE" }),
  computeDiscoverWorkers: () =>
    request<DiscoverWorkersResponse>("/api/compute/discover/workers"),
  computeCapabilities: () =>
    request<ComputeCapabilitiesResponse>("/api/compute/capabilities"),

  // Setup (no-code admin)
  setupStatus: () => request<SetupStatusResponse>("/api/setup/status"),
  uploadCheckpoint: (modelId: string, remoteName: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("remote_name", remoteName);
    const url = absoluteUrl(`/api/setup/checkpoints/${modelId}/upload`);
    return fetch(url, { method: "POST", body: form }).then(async (r) => {
      if (!r.ok) {
        const detail = await r.text();
        throw new ApiError(r.status, detail || r.statusText);
      }
      return (await r.json()) as { model_id: string; remote_name: string; bytes: number };
    });
  },
  deployStart: (modelId: string) =>
    request<DeployJob>(`/api/setup/deploy/${modelId}`, { method: "POST" }),
  deployStatus: (modelId: string) =>
    request<DeployJob>(`/api/setup/deploy/${modelId}`),

  // Training
  listDatasets: (modelId?: string) => {
    const q = modelId ? `?model_id=${encodeURIComponent(modelId)}` : "";
    return request<TrainingDatasetSummary[]>(`/api/training/datasets${q}`);
  },
  createDataset: (modelId: string, name: string, group?: string) =>
    request<TrainingDataset>("/api/training/datasets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_id: modelId, name, group }),
    }),
  getDataset: (id: string) =>
    request<TrainingDataset>(`/api/training/datasets/${id}`),
  updateDataset: (
    id: string,
    body: { name?: string; samples?: TrainingSample[] },
  ) =>
    request<TrainingDataset>(`/api/training/datasets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  deleteDataset: (id: string) =>
    request<void>(`/api/training/datasets/${id}`, { method: "DELETE" }),
  uploadDatasetLabels: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<TrainingDataset>(
      `/api/training/datasets/${id}/labels/upload`,
      { method: "POST", body: form },
    );
  },
  listTrainingRuns: (modelId?: string) => {
    const q = modelId ? `?model_id=${encodeURIComponent(modelId)}` : "";
    return request<TrainingRunSummary[]>(`/api/training/runs${q}`);
  },
  createTrainingRun: (datasetId: string, opts?: { name?: string; auto_activate?: boolean }) =>
    request<TrainingRun>("/api/training/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset_id: datasetId,
        name: opts?.name,
        auto_activate: opts?.auto_activate ?? true,
      }),
    }),
  getTrainingRun: (id: string) =>
    request<TrainingRun>(`/api/training/runs/${id}`),

  // Checkpoints (versioned, per-model)
  listCheckpoints: (modelId: string) =>
    request<CheckpointListResponse>(`/api/checkpoints/${modelId}`),
  activateCheckpoint: (modelId: string, checkpointId: string) =>
    request<CheckpointMeta>(
      `/api/checkpoints/${modelId}/${checkpointId}/activate`,
      { method: "POST" },
    ),
};

// In the demo build (VITE_DEMO_MODE=true) swap in the scripted api so the
// static bundle never attempts a backend request. The real api above is kept
// untouched so `npm run dev` and `npm run build` still behave normally.
import { demoApi } from "./demoApi";
export const api: typeof realApi =
  import.meta.env.VITE_DEMO_MODE === "true"
    ? (demoApi as typeof realApi)
    : realApi;
