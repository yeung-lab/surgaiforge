import { useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError } from "../../api/client";
import type {
  TrainingDataset,
  TrainingRun,
  TrainingSample,
  Video,
} from "../../api/types";
import { UploadIcon } from "../icons";
import { LinkedChip, LinkFilesInput } from "../LinkFilesInput";
import { LabelsUpload } from "./LabelsUpload";
import type { TrainableModel } from "./trainableModels";

type Label = number | string;

export function DatasetEditor({
  model,
  datasetId,
  allVideos,
  uploading,
  onUpload,
  onLinked,
  onBack,
  onStartTraining,
}: {
  model: TrainableModel;
  datasetId: string;
  allVideos: Video[];
  uploading: boolean;
  onUpload: (files: File[]) => void;
  onLinked: () => void;
  onBack: () => void;
  onStartTraining: (run: TrainingRun) => void;
}) {
  const [dataset, setDataset] = useState<TrainingDataset | null>(null);
  const [labels, setLabels] = useState<Record<string, Label | null>>({});
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [autoActivate, setAutoActivate] = useState(true);
  const [error, setError] = useState<string>();
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ds = await api.getDataset(datasetId);
        if (cancelled) return;
        setDataset(ds);
        setName(ds.name);
        const l: Record<string, Label | null> = {};
        for (const s of ds.samples) l[s.video_id] = s.label;
        setLabels(l);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Could not load dataset.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  const readableVideos = useMemo(
    () => allVideos.filter((v) => v.readable),
    [allVideos],
  );

  const samples: TrainingSample[] = useMemo(
    () =>
      Object.entries(labels)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([video_id, label]) => ({ video_id, label: label as Label })),
    [labels],
  );

  const classCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const choice of model.labels) c[String(choice.value)] = 0;
    for (const s of samples) {
      const k = String(s.label);
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [samples, model.labels]);

  const undersizedClasses = useMemo(
    () => Object.entries(classCounts)
      .filter(([, v]) => v > 0 && v < model.minPerClass)
      .map(([k]) => k),
    [classCounts, model.minPerClass],
  );

  const canSave = !!dataset && !saving && name.trim().length > 0;

  // Upload-only models (CVS) gate on labels_file, not the per-clip samples
  // list, because their supervision lives entirely in the blob.
  const canTrain = model.uploadOnly
    ? !!dataset && !starting && !!dataset.labels_file
    : !!dataset
      && !starting
      && samples.length >= model.minClips
      && undersizedClasses.length === 0;

  const blockedReason = model.uploadOnly
    ? dataset?.labels_file
      ? undefined
      : "Upload a labels file to enable training."
    : samples.length < model.minClips
      ? `Label at least ${model.minClips} clips (currently ${samples.length}).`
      : undersizedClasses.length > 0
        ? `Each label used needs at least ${model.minPerClass} clips. Short: ${undersizedClasses.join(", ")}.`
        : samples.length < model.warnUnderClips
          ? `Training will work but with ${samples.length} clips the model will be noisy. ${model.warnUnderClips}+ recommended.`
          : undefined;

  const save = async () => {
    if (!dataset) return;
    setSaving(true);
    setError(undefined);
    try {
      const updated = await api.updateDataset(dataset.id, {
        name: name.trim(),
        samples,
      });
      setDataset(updated);
      setSavedOnce(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const startTraining = async () => {
    if (!dataset) return;
    setStarting(true);
    setError(undefined);
    try {
      // Save latest edits before kicking off.
      const updated = await api.updateDataset(dataset.id, {
        name: name.trim(),
        samples,
      });
      setDataset(updated);
      const run = await api.createTrainingRun(dataset.id, { auto_activate: autoActivate });
      onStartTraining(run);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start training.");
    } finally {
      setStarting(false);
    }
  };

  if (!dataset && !error) {
    return <div className="list-note">Loading dataset…</div>;
  }
  if (error && !dataset) {
    return (
      <>
        <button className="btn" onClick={onBack}>← Back</button>
        <div className="callout error" style={{ marginTop: 16, fontSize: 13 }}>{error}</div>
      </>
    );
  }

  const groupName = dataset?.group
    ? model.groups?.find((g) => g.value === dataset.group)?.label ?? dataset.group
    : undefined;

  const subCopy =
    model.labelKind === "severity1to5"
      ? "Assign a 1–5 Parkland severity rating to each clip. Only rated clips are used for training. Unrated clips are ignored."
      : model.labelKind === "binaryAdequacy"
        ? `Label each clip Adequate or Inadequate for ${groupName ?? "the selected competency"}. Only labeled clips are used for training. Unlabeled clips are ignored.`
        : "Upload the researcher's COCO JSON. Per-frame supervision is what CVS training expects, so there's no in-platform clicker here.";

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn" onClick={onBack}>← All datasets</button>
      </div>
      <div className="step-eyebrow" style={{ marginTop: 16 }}>
        DATASET · {model.shortName}
        {dataset?.group && ` · ${dataset.group}`}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="step-title"
        style={{
          width: "100%",
          padding: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: "var(--serif)",
        }}
      />
      <p className="step-sub">{subCopy}</p>

      {!model.uploadOnly && (
        <ClassCountBar
          model={model}
          counts={classCounts}
          total={samples.length}
        />
      )}

      <LabelsUpload
        model={model}
        datasetId={dataset!.id}
        currentMeta={dataset?.labels_file ?? null}
        onUploaded={(ds) => {
          setDataset(ds);
          // Rehydrate the in-memory label map so the clicker reflects the
          // uploaded labels (users can still tweak individual rows after).
          const l: Record<string, Label | null> = {};
          for (const s of ds.samples) l[s.video_id] = s.label;
          setLabels(l);
          setSavedOnce(true);
        }}
      />

      {!model.uploadOnly && (
        <>
          <UploadDropzone uploading={uploading} onUpload={onUpload} />
          <LinkFilesInput onLinked={onLinked} />

          {readableVideos.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="subhead">
                {readableVideos.length} video{readableVideos.length !== 1 ? "s" : ""} available
              </div>
              <div>
                {readableVideos.map((v) => (
                  <ClipRow
                    key={v.id}
                    model={model}
                    video={v}
                    label={labels[v.id] ?? null}
                    onChange={(label) =>
                      setLabels((cur) => ({ ...cur, [v.id]: label }))
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="callout error" style={{ marginTop: 16, fontSize: 13 }}>{error}</div>
      )}

      <div style={{
        display: "flex", flexDirection: "column", gap: 12,
        marginTop: 24, padding: 16, background: "var(--beige)",
        border: "1px solid var(--beige-bd)", borderRadius: 8,
      }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)" }}>
            Ready to train?
          </div>
          <div className="list-note" style={{ fontSize: 13, marginTop: 4 }}>
            {model.uploadOnly
              ? dataset?.labels_file?.summary ?? "No labels uploaded yet"
              : `${samples.length} labeled clip${samples.length !== 1 ? "s" : ""} · saved ${savedOnce ? "just now" : "unsaved"}`}
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
          <input
            type="checkbox"
            checked={autoActivate}
            onChange={(e) => setAutoActivate(e.target.checked)}
          />
          Make this checkpoint active for inference when training completes
        </label>

        {blockedReason && (
          <div
            className={canTrain ? "callout info" : "callout error"}
            style={{ fontSize: 13 }}
          >
            {blockedReason}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={save}
            disabled={!canSave}
          >
            {saving ? "Saving…" : "Save dataset"}
          </button>
          <button
            className="btn primary"
            onClick={startTraining}
            disabled={!canTrain}
          >
            {starting ? "Starting…" : "Start training"}
          </button>
        </div>
      </div>
    </>
  );
}

function ClipRow({
  model,
  video,
  label,
  onChange,
}: {
  model: TrainableModel;
  video: Video;
  label: Label | null;
  onChange: (label: Label | null) => void;
}) {
  return (
    <div className="list-row" style={{ alignItems: "center" }}>
      <div className="list-label" style={{ alignItems: "center", gap: 8 }}>
        <span className="file-name">{video.filename}</span>
        {video.linked && <LinkedChip />}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {model.labels.map((choice) => {
          const active = label === choice.value;
          const isWide = model.labelKind === "binaryAdequacy";
          return (
            <button
              key={String(choice.value)}
              onClick={() => onChange(active ? null : choice.value)}
              className="btn"
              title={choice.title ?? choice.short}
              style={{
                minWidth: isWide ? 110 : 36,
                padding: "6px 10px",
                background: active ? "var(--cardinal)" : "var(--bg-white)",
                color: active ? "white" : "var(--slate)",
                borderColor: active ? "var(--cardinal)" : "var(--line-strong)",
              }}
            >
              {choice.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UploadDropzone({
  uploading,
  onUpload,
}: {
  uploading: boolean;
  onUpload: (files: File[]) => void;
}) {
  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const pick = (list: FileList | null) => {
    if (list && list.length) onUpload(Array.from(list));
  };

  return (
    <div
      className={`dropzone${drag ? " drag" : ""}`}
      style={{ marginTop: 16, padding: "18px 16px" }}
      onClick={() => fileInput.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        pick(e.dataTransfer.files);
      }}
    >
      <UploadIcon />
      <div className="dropzone-text" style={{ fontSize: 14 }}>
        {uploading
          ? "Uploading…"
          : "Drop clips here, or click to browse"}
      </div>
      <div className="dropzone-hint">.mp4 or .mov — uploaded clips appear below for labeling</div>
      <div className="dropzone-buttons" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn"
          style={{ fontSize: 13 }}
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          Browse files
        </button>
        <button
          className="btn"
          style={{ fontSize: 13 }}
          onClick={() => folderInput.current?.click()}
          disabled={uploading}
        >
          Browse folder
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept=".mp4,.mov,video/mp4,video/quicktime"
        multiple
        hidden
        onChange={(e) => { pick(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={folderInput}
        type="file"
        accept=".mp4,.mov,video/mp4,video/quicktime"
        multiple
        hidden
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ webkitdirectory: "" } as any)}
        onChange={(e) => { pick(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}

function ClassCountBar({
  model,
  counts,
  total,
}: {
  model: TrainableModel;
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
      {model.labels.map((choice) => {
        const key = String(choice.value);
        const v = counts[key] ?? 0;
        const low = v > 0 && v < model.minPerClass;
        return (
          <div
            key={key}
            style={{
              flex: 1, padding: "8px 10px", textAlign: "center",
              background: v > 0 ? "var(--red-bg)" : "var(--drop-bg)",
              border: `1px solid ${low ? "var(--amber-bd)" : "var(--card-bd)"}`,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
              {choice.short.toUpperCase()}
            </div>
            <div style={{
              fontSize: 20, fontFamily: "var(--serif)",
              color: low ? "var(--amber)" : "var(--ink)",
            }}>
              {v}
            </div>
          </div>
        );
      })}
      <div style={{
        flex: 1, padding: "8px 10px", textAlign: "center",
        background: "var(--beige)", border: "1px solid var(--beige-bd)",
        borderRadius: 6,
      }}>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>TOTAL</div>
        <div style={{ fontSize: 20, fontFamily: "var(--serif)" }}>{total}</div>
      </div>
    </div>
  );
}
