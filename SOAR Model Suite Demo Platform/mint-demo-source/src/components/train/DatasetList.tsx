import { useState } from "react";
import type { TrainingDatasetSummary } from "../../api/types";
import { TrashIcon } from "../icons";
import type { TrainableModel } from "./trainableModels";

export function DatasetList({
  model,
  datasets,
  loading,
  error,
  onCreate,
  onOpen,
  onDelete,
}: {
  model: TrainableModel;
  datasets: TrainingDatasetSummary[];
  loading: boolean;
  error: string | undefined;
  onCreate: (name: string, group?: string) => Promise<void>;
  onOpen: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<string>(
    model.groups?.[0]?.value ?? "",
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string>();

  const needsGroup = !!model.groups;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (needsGroup && !group) return;
    setCreating(true);
    setCreateError(undefined);
    try {
      await onCreate(n, needsGroup ? group : undefined);
      setName("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Could not create dataset.");
    } finally {
      setCreating(false);
    }
  };

  const labelHint =
    model.labelKind === "severity1to5"
      ? "Each clip gets a Parkland severity rating from 1 to 5."
      : model.labelKind === "binaryAdequacy"
        ? "Each clip is labeled Adequate or Inadequate for the selected competency."
        : "Upload the researcher's COCO JSON — per-frame supervision for the 3 CVS criteria.";

  return (
    <>
      <div className="step-eyebrow">TRAIN · {model.name.toUpperCase()}</div>
      <h1 className="step-title">Datasets</h1>
      <p className="step-sub">
        A dataset is a group of labeled clips you'll train on. {labelHint} Create
        one, add clips with labels, then run training to produce a new checkpoint.
      </p>

      <form onSubmit={submit} className="dataset-create">
        <input
          type="text"
          placeholder={`Name this dataset (e.g. 'My first ${model.shortName} run')`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={creating}
          className="input"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid var(--card-bd)",
            borderRadius: 6,
            fontFamily: "var(--sans)",
            fontSize: 14,
          }}
        />
        {needsGroup && (
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            disabled={creating}
            className="input"
            style={{
              padding: "10px 12px",
              border: "1px solid var(--card-bd)",
              borderRadius: 6,
              fontFamily: "var(--sans)",
              fontSize: 14,
              background: "var(--bg-white)",
            }}
            aria-label={model.groupLabel}
          >
            {model.groups!.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label} ({g.value})
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className="btn primary"
          disabled={creating || !name.trim() || (needsGroup && !group)}
        >
          {creating ? "Creating…" : "New dataset"}
        </button>
      </form>

      {createError && (
        <div className="callout error" style={{ marginTop: 12, fontSize: 13 }}>
          {createError}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {loading && <div className="list-note">Loading datasets…</div>}
        {!loading && error && (
          <div className="callout error" style={{ fontSize: 13 }}>{error}</div>
        )}
        {!loading && !error && datasets.length === 0 && (
          <div className="callout info" style={{ fontSize: 13.5 }}>
            <span>
              No {model.shortName} datasets yet. Create one above to start labeling clips.
            </span>
          </div>
        )}
        {!loading && datasets.length > 0 && (
          <>
            <div className="subhead">{datasets.length} dataset{datasets.length !== 1 ? "s" : ""}</div>
            {datasets.map((ds) => (
              <DatasetRow
                key={ds.id}
                ds={ds}
                model={model}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}

function DatasetRow({
  ds,
  model,
  onOpen,
  onDelete,
}: {
  ds: TrainingDatasetSummary;
  model: TrainableModel;
  onOpen: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  // For severity1to5, sort numerically. For string labels, sort by the model's
  // declared label order so "adeq" comes before "inad" consistently.
  const sortedKeys = Object.keys(ds.class_counts).sort((a, b) => {
    if (model.labelKind === "severity1to5") return Number(a) - Number(b);
    const order = model.labels.map((l) => String(l.value));
    return order.indexOf(a) - order.indexOf(b);
  });
  const classLine = sortedKeys
    .map((k) => {
      const choice = model.labels.find((l) => String(l.value) === k);
      return `${choice?.short ?? k}: ${ds.class_counts[k]}`;
    })
    .join("  ·  ");

  return (
    <div className="list-row" style={{ alignItems: "center" }}>
      <div
        className="list-label"
        style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}
      >
        <button
          onClick={() => onOpen(ds.id)}
          className="link-btn"
          style={{
            background: "none",
            border: "none",
            color: "var(--mint)",
            fontFamily: "var(--serif)",
            fontSize: 17,
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {ds.name}
          {ds.group && (
            <span className="train-group-chip">{ds.group}</span>
          )}
        </button>
        <div className="list-note" style={{ fontSize: 12.5 }}>
          {model.uploadOnly
            ? ds.labels_file?.summary ?? "no labels uploaded"
            : <>{ds.sample_count} clip{ds.sample_count !== 1 ? "s" : ""}{classLine && `  ·  ${classLine}`}</>}
        </div>
      </div>
      {confirming ? (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="btn"
            onClick={async () => {
              await onDelete(ds.id);
              setConfirming(false);
            }}
            style={{ color: "var(--err-fg)" }}
          >
            Confirm delete
          </button>
          <button className="btn" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="btn" onClick={() => setConfirming(true)} title="Delete">
          <TrashIcon size={15} />
        </button>
      )}
    </div>
  );
}
