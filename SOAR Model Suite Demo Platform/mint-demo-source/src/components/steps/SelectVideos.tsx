import { useRef, useState } from "react";
import type { Video } from "../../api/types";
import { formatBytes } from "../../lib/format";
import { isDemoMode } from "../../demoMode";
import { DocIcon, TrashIcon, UploadIcon } from "../icons";
import { LinkedChip, LinkFilesInput } from "../LinkFilesInput";

export function SelectVideos({
  videos,
  uploading,
  onUpload,
  onDelete,
  onLinked,
  deIdConfirmed,
  onDeIdChange,
}: {
  videos: Video[];
  uploading: boolean;
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  onLinked: () => void;
  deIdConfirmed: boolean;
  onDeIdChange: (confirmed: boolean) => void;
}) {
  const [drag, setDrag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const pick = (list: FileList | null) => {
    if (list && list.length) onUpload(Array.from(list));
  };

  const invalid = videos.filter((v) => !v.readable);

  return (
    <>
      <div className="step-eyebrow">STEP 2 OF 5</div>
      <h1 className="step-title">Select data</h1>
      <p className="step-sub">
        {isDemoMode()
          ? "Normally you'd drag in your own videos here. In this demo an example video is already loaded for you."
          : "Add one video, several videos, or a whole folder. Nothing leaves this computer until you run the analysis."}
      </p>
      {!isDemoMode() && (
        <>
          <div
            className={`dropzone${drag ? " drag" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              pick(e.dataTransfer.files);
            }}
          >
            <UploadIcon />
            <div className="dropzone-text">
              {uploading ? "Uploading…" : "Drag one video, several videos, or a folder here"}
            </div>
            <div className="dropzone-hint">.mp4 or .mov</div>
            <div className="dropzone-buttons" onClick={(e) => e.stopPropagation()}>
              <button className="btn" style={{ fontSize: 13 }} onClick={() => fileInputRef.current?.click()}>
                Browse files
              </button>
              <button className="btn" style={{ fontSize: 13 }} onClick={() => folderInputRef.current?.click()}>
                Browse folder
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,video/mp4,video/quicktime"
              multiple
              hidden
              onChange={(e) => {
                pick(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              accept=".mp4,.mov,video/mp4,video/quicktime"
              multiple
              hidden
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ webkitdirectory: "" } as any)}
              onChange={(e) => {
                pick(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <LinkFilesInput onLinked={onLinked} />
        </>
      )}

      {videos.length > 0 && (
        <>
          <div className="subhead">
            {videos.length} file{videos.length !== 1 ? "s" : ""} selected
            {invalid.length > 0 && (
              <span style={{ color: "var(--amber)", fontWeight: 400, marginLeft: 8 }}>
                · {invalid.length} invalid
              </span>
            )}
          </div>
          <div>
            {videos.map((v) => (
              <div className="list-row" key={v.id}>
                <div className="list-label" style={{ alignItems: "center" }}>
                  <DocIcon
                    size={18}
                    style={{ color: v.readable ? "var(--faint)" : "var(--err-fg)" }}
                  />
                  <span
                    className="file-name"
                    style={!v.readable ? { color: "var(--err-fg)" } : undefined}
                  >
                    {v.filename}
                  </span>
                  <span className="list-note">{formatBytes(v.size_bytes)}</span>
                  {v.linked && <LinkedChip />}
                  {!v.readable && v.error && (
                    <span className="list-note" style={{ color: "var(--err-fg)" }}>
                      · {v.error}
                    </span>
                  )}
                </div>
                {!isDemoMode() && (
                  <button className="btn" onClick={() => onDelete(v.id)} title="Remove">
                    <TrashIcon size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {invalid.length > 0 && (
        <div className="callout info" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 13 }}>
            {invalid.length === 1 ? "1 file isn't" : `${invalid.length} files aren't`} supported. Remove {invalid.length === 1 ? "it" : "them"} or swap in an .mp4 or .mov file to continue.
          </span>
        </div>
      )}

      <div className="deid-confirm" style={{ marginTop: videos.length > 0 ? 20 : 16 }}>
        <label className="deid-label">
          <span
            className={`deid-checkbox${deIdConfirmed ? " checked" : ""}`}
            onClick={() => onDeIdChange(!deIdConfirmed)}
            role="checkbox"
            aria-checked={deIdConfirmed}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") onDeIdChange(!deIdConfirmed);
            }}
          >
            {deIdConfirmed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="deid-text">
            I confirm these videos are appropriately de-identified and contain no protected
            health information.
          </span>
        </label>
        <p className="deid-hint">
          Need to de-identify videos first?{" "}
          <a
            href="https://github.com/surgaiforge/mosaic"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--red)", fontWeight: 600 }}
          >
            Use Mosaic
          </a>
          , SurgAI Forge's video de-identification tool.
        </p>
      </div>

      <div className="callout info" style={{ marginTop: 16, fontSize: 13.5 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M4.5 11a2.5 2.5 0 010-5 3.5 3.5 0 016.8-.9A2.5 2.5 0 1111.5 11z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span>
          {isDemoMode()
            ? "In the real app, videos stay on your machine until you press Run inference. In this demo, no video is ever transmitted."
            : "With cloud compute, these videos are uploaded to your compute workspace for processing. They stay on this computer until you press Run inference."}
        </span>
      </div>
    </>
  );
}
