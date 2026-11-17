import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type {
  TrainingDatasetSummary,
  TrainingRun,
  Video,
} from "../../api/types";
import { DatasetList } from "./DatasetList";
import { DatasetEditor } from "./DatasetEditor";
import { TrainingRunView } from "./TrainingRunView";
import { TrainingSetupBanner } from "./TrainingSetupBanner";
import { TRAINABLE_MODELS, trainable } from "./trainableModels";

type Screen =
  | { kind: "list" }
  | { kind: "edit"; datasetId: string }
  | { kind: "run"; runId: string };

const LS_KEY = "mint.train.modelId";

export function TrainMode({
  videos,
  uploading,
  onUpload,
  onLinked,
}: {
  videos: Video[];
  uploading: boolean;
  onUpload: (files: File[]) => void;
  onLinked: () => void;
}) {
  const [modelId, setModelId] = useState<string>(
    () => localStorage.getItem(LS_KEY) ?? TRAINABLE_MODELS[0]!.id,
  );
  const [datasets, setDatasets] = useState<TrainingDatasetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [screen, setScreen] = useState<Screen>({ kind: "list" });

  const model = trainable(modelId) ?? TRAINABLE_MODELS[0]!;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const list = await api.listDatasets(modelId);
      setDatasets(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load datasets.");
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleModelChange = (id: string) => {
    setModelId(id);
    localStorage.setItem(LS_KEY, id);
    setScreen({ kind: "list" });
  };

  const handleCreate = async (name: string, group?: string) => {
    const ds = await api.createDataset(modelId, name, group);
    await refresh();
    setScreen({ kind: "edit", datasetId: ds.id });
  };

  const handleDelete = async (id: string) => {
    await api.deleteDataset(id);
    await refresh();
  };

  const handleStartTraining = (run: TrainingRun) => {
    setScreen({ kind: "run", runId: run.id });
  };

  const picker = (
    <ModelPicker modelId={modelId} onChange={handleModelChange} />
  );

  if (screen.kind === "list") {
    return (
      <div className="step-card">
        {picker}
        <TrainingSetupBanner
          model={model}
          onReady={() => { /* readiness is passive */ }}
        />
        <DatasetList
          model={model}
          datasets={datasets}
          loading={loading}
          error={error}
          onCreate={handleCreate}
          onOpen={(id) => setScreen({ kind: "edit", datasetId: id })}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  if (screen.kind === "edit") {
    return (
      <div className="step-card">
        <DatasetEditor
          model={model}
          datasetId={screen.datasetId}
          allVideos={videos}
          uploading={uploading}
          onUpload={onUpload}
          onLinked={onLinked}
          onBack={() => {
            void refresh();
            setScreen({ kind: "list" });
          }}
          onStartTraining={handleStartTraining}
        />
      </div>
    );
  }

  // screen.kind === "run"
  return (
    <div className="step-card">
      <TrainingRunView
        runId={screen.runId}
        onBack={() => {
          void refresh();
          setScreen({ kind: "list" });
        }}
      />
    </div>
  );
}

function ModelPicker({
  modelId,
  onChange,
}: {
  modelId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="train-model-picker">
      <div className="train-model-picker-label">Training</div>
      <div className="train-model-picker-tabs">
        {TRAINABLE_MODELS.map((m) => (
          <button
            key={m.id}
            className={`train-model-pill${m.id === modelId ? " active" : ""}`}
            onClick={() => onChange(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}
