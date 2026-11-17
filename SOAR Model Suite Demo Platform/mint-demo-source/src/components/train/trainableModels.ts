// Per-model training config — label schema, competency groups, phase ladder,
// metric fields. Add an entry when a new per-model training engine lands on the
// backend (see backend/app/training/build_training_engine).

export type LabelKind =
  | "severity1to5"
  | "binaryAdequacy"
  | "cocoJson";   // CVS — per-frame upload, no in-platform clicker

export interface LabelChoice {
  value: number | string;
  short: string;   // "1", "Adequate"
  title?: string;  // tooltip, e.g. "1 — Normal"
}

export interface TrainableModel {
  id: string;
  name: string;              // "Disease Severity"
  shortName: string;         // "PGS" — used in eyebrows
  // The Setup/deploy registry id for this model's TRAINING Modal app
  // (not the inference app). Matches MODEL_FUNCTION_MODULES in the backend.
  trainingAppId: string;     // "pgs_train" | "mc_train" | "cvs_train"
  trainingAppName: string;   // "mint-pgs-train" — shown in deploy banner copy
  labelKind: LabelKind;
  labels: LabelChoice[];
  minPerClass: number;       // must match backend MIN_CLIPS_PER_CLASS
  minClips: number;          // must match backend MIN_CLIPS
  warnUnderClips: number;    // UI warning threshold
  // Labels upload — what the uploader accepts + how to describe the format.
  upload: {
    accept: string;            // input[type=file] accept attr
    exampleHeader: string;     // e.g. "filename,grade" or "COCO JSON"
    docHint: string;           // one-line explanation shown under the dropzone
    // Path to a tiny ready-to-edit example file bundled in /public/examples/.
    // Shown as a "Download example" link next to the dropzone so researchers
    // don't have to guess the exact header + types.
    exampleUrl: string;
    exampleFilename: string;   // suggested save-as filename
  };
  // CVS has no in-platform clicker (per-frame labels don't fit a clip-row).
  // When true, DatasetEditor hides the clip list + clicker entirely.
  uploadOnly?: boolean;
  // MC2-style per-dataset sub-scope. One dataset = one group.
  groupLabel?: string;       // "Competency" — label shown to the user
  groups?: { value: string; label: string; help?: string }[];
  // Pipeline phases in order — drives the TrainingRunView phase ladder.
  phases: string[];
  phaseLabels: Record<string, string>;
  // Which metrics to render in the Results panel.
  metrics: { key: keyof MetricsRef; label: string; format?: (n: number) => string }[];
}

type MetricsRef = {
  accuracy: number;
  mae: number;
  cohen_kappa_quadratic: number;
  auroc: number;
  auprc: number;
  f1: number;
};

const fmt3 = (n: number) => n.toFixed(3);

export const TRAINABLE_MODELS: TrainableModel[] = [
  {
    id: "pgs",
    name: "Disease Severity",
    shortName: "PGS",
    trainingAppId: "pgs_train",
    trainingAppName: "mint-pgs-train",
    upload: {
      accept: ".csv,text/csv",
      exampleHeader: "filename,grade",
      docHint:
        "CSV with one row per clip. Columns: filename, grade (1–5). " +
        "The uploader replaces any existing labels in this dataset.",
      exampleUrl: "/examples/pgs_example.csv",
      exampleFilename: "pgs_example.csv",
    },
    labelKind: "severity1to5",
    labels: [
      { value: 1, short: "1", title: "1 — Normal" },
      { value: 2, short: "2", title: "2 — Mild" },
      { value: 3, short: "3", title: "3 — Moderate" },
      { value: 4, short: "4", title: "4 — Severe" },
      { value: 5, short: "5", title: "5 — Extreme" },
    ],
    minPerClass: 3,
    minClips: 25,
    warnUnderClips: 50,
    phases: ["preparing", "step", "keyframes", "train", "promote", "complete"],
    phaseLabels: {
      queued: "Queued",
      preparing: "Preparing",
      step: "Step inference",
      keyframes: "Keyframes",
      train: "DINOv3 + classifier",
      promote: "Registering",
      complete: "Complete",
    },
    metrics: [
      { key: "accuracy", label: "Accuracy", format: fmt3 },
      { key: "mae", label: "MAE", format: fmt3 },
      { key: "cohen_kappa_quadratic", label: "Cohen's κ (quad.)", format: fmt3 },
    ],
  },
  {
    id: "mc2",
    name: "Meta-Competencies",
    shortName: "MC2",
    trainingAppId: "mc_train",
    trainingAppName: "mint-mc-train",
    upload: {
      accept: ".csv,text/csv",
      exampleHeader: "filename,label",
      docHint:
        "CSV with one row per clip. Columns: filename, label (adeq or inad). " +
        "Competency is set on the dataset, not in the CSV.",
      exampleUrl: "/examples/mc2_example.csv",
      exampleFilename: "mc2_example.csv",
    },
    labelKind: "binaryAdequacy",
    labels: [
      { value: "adeq", short: "Adequate" },
      { value: "inad", short: "Inadequate" },
    ],
    minPerClass: 3,
    minClips: 20,
    warnUnderClips: 40,
    groupLabel: "Competency",
    // Valid competency values match modal_functions/mc.py::COMPETENCIES and
    // SOAR-mc-model/conf/run.yaml. One dataset trains one competency.
    groups: [
      { value: "TH",    label: "Tissue Handling" },
      { value: "PS",    label: "Psychomotor Skills" },
      { value: "Prog",  label: "Progression" },
      { value: "EQ-S3", label: "Exposure Quality (Stage 3)" },
      { value: "DQ-S5", label: "Dissection Quality (Stage 5)" },
      { value: "EQ-S5", label: "Exposure Quality (Stage 5)" },
    ],
    phases: ["preparing", "train", "promote", "complete"],
    phaseLabels: {
      queued: "Queued",
      preparing: "Preparing",
      train: "DINOv2 + TCN",
      promote: "Registering",
      complete: "Complete",
    },
    metrics: [
      { key: "accuracy", label: "Accuracy", format: fmt3 },
      { key: "auroc", label: "AUROC", format: fmt3 },
      { key: "auprc", label: "AUPRC", format: fmt3 },
      { key: "f1", label: "F1", format: fmt3 },
    ],
  },
  {
    id: "cvs",
    name: "Critical View of Safety",
    shortName: "CVS",
    trainingAppId: "cvs_train",
    trainingAppName: "mint-cvs-train",
    // CVS supervision is per-frame (COCO JSON with ds-vectors). Labeling a
    // whole clip doesn't match the training objective, so the clicker path
    // is disabled — upload-only.
    upload: {
      accept: ".json,application/json",
      exampleHeader: "COCO JSON",
      docHint:
        "COCO-format JSON matching SOAR-cvs-model/train.py: images[] with " +
        "{id, file_name, video_id, ds} where ds is a 3-vector in [0,1].",
      exampleUrl: "/examples/cvs_example.json",
      exampleFilename: "cvs_example.json",
    },
    uploadOnly: true,
    labelKind: "cocoJson",
    labels: [],
    minPerClass: 0,
    minClips: 0,
    warnUnderClips: 0,
    phases: ["preparing", "train", "promote", "complete"],
    phaseLabels: {
      queued: "Queued",
      preparing: "Preparing",
      train: "DINO + TCN",
      promote: "Registering",
      complete: "Complete",
    },
    metrics: [
      { key: "accuracy", label: "Accuracy", format: fmt3 },
      { key: "auroc", label: "AUROC", format: fmt3 },
    ],
  },
];

export function trainable(id: string): TrainableModel | undefined {
  return TRAINABLE_MODELS.find((m) => m.id === id);
}
