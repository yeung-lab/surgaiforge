import { useRef, useState } from "react";
import { api, ApiError } from "../../api/client";
import type {
  LabelsFileMeta,
  LabelsParseError,
  TrainingDataset,
} from "../../api/types";
import { UploadIcon } from "../icons";
import type { TrainableModel } from "./trainableModels";

export function LabelsUpload({
  model,
  datasetId,
  currentMeta,
  onUploaded,
}: {
  model: TrainableModel;
  datasetId: string;
  currentMeta: LabelsFileMeta | null | undefined;
  onUploaded: (ds: TrainingDataset) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<LabelsParseError[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  const submit = async (file: File) => {
    setUploading(true);
    setErrors(null);
    setErrorMessage(undefined);
    try {
      const ds = await api.uploadDatasetLabels(datasetId, file);
      onUploaded(ds);
    } catch (e) {
      if (e instanceof ApiError && e.detail
          && typeof e.detail === "object"
          && Array.isArray((e.detail as { errors?: unknown }).errors)) {
        setErrors((e.detail as { errors: LabelsParseError[] }).errors);
        setErrorMessage(e.message);
      } else {
        setErrorMessage(e instanceof ApiError ? e.message : "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  const onPick = (list: FileList | null) => {
    if (list && list.length) void submit(list[0]!);
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 12,
        marginTop: 22, marginBottom: 8,
      }}>
        <div className="subhead" style={{ margin: 0 }}>
          {model.uploadOnly ? "Labels" : "Upload labels (optional)"}
        </div>
        <a
          className="labels-example-link"
          href={model.upload.exampleUrl}
          download={model.upload.exampleFilename}
        >
          Download example ({model.upload.exampleFilename})
        </a>
      </div>

      <div
        className={`dropzone${drag ? " drag" : ""}`}
        style={{ padding: "18px 16px" }}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onPick(e.dataTransfer.files);
        }}
      >
        <UploadIcon />
        <div className="dropzone-text" style={{ fontSize: 14 }}>
          {uploading
            ? "Uploading…"
            : currentMeta
              ? `Replace labels (${currentMeta.filename})`
              : `Drop ${model.upload.exampleHeader} file here, or click to browse`}
        </div>
        <div className="dropzone-hint">{model.upload.docHint}</div>
        <input
          ref={fileInput}
          type="file"
          accept={model.upload.accept}
          hidden
          onChange={(e) => { onPick(e.target.files); e.target.value = ""; }}
        />
      </div>

      {currentMeta && !errors && (
        <div className="callout info" style={{ marginTop: 10, fontSize: 13 }}>
          <span>
            <b>{currentMeta.summary}</b>
            {" "}from <span className="mono">{currentMeta.filename}</span>
            {" "}· uploaded {new Date(currentMeta.uploaded_at).toLocaleString()}
          </span>
        </div>
      )}

      {errorMessage && !errors && (
        <div className="callout error" style={{ marginTop: 10, fontSize: 13 }}>
          {errorMessage}
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="callout error" style={{
          marginTop: 10, fontSize: 13,
          flexDirection: "column", alignItems: "stretch", gap: 8,
        }}>
          <div style={{ fontWeight: 700 }}>
            {errorMessage ?? "Labels file could not be ingested."}
          </div>
          <ul style={{
            margin: 0, paddingLeft: 18,
            fontFamily: "var(--mono)", fontSize: 12.5,
          }}>
            {errors.map((e, i) => (
              <li key={i}>
                {e.line ? `line ${e.line}: ` : ""}{e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
