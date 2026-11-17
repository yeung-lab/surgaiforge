import type { ModelInfo } from "../../api/types";

// Flip an id into AVAILABLE as each model becomes genuinely usable. tool is
// validated end-to-end; step, pgs, cvs, mc2, error are wired + UI-deployable
// (first live run pending for cvs/mc2/error).
const AVAILABLE: ReadonlySet<string> = new Set(["tool", "step", "pgs", "cvs", "mc2", "error"]);

// Lightweight glyphs for the top-left of each model card. Keep them abstract
// — the prototype uses geometric marks rather than icon metaphors so the
// cards all read as one family.
function ModelIcon({ id, selected }: { id: string; selected: boolean }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "tool":
      return (
        <svg {...common}>
          <path d="M8 3v10M3 8h10" />
        </svg>
      );
    case "step":
      return (
        <svg {...common}>
          <path d="M3 5h10M3 9h10M3 13h6" />
        </svg>
      );
    case "error":
      return (
        <svg {...common}>
          <path d="M8 3v6M8 12v.5" />
        </svg>
      );
    case "mc2":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="4" />
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
        </svg>
      );
    case "pgs":
      return (
        <svg {...common}>
          <path d="M3 13h10M5 10v3M8 7v6M11 4v9" />
        </svg>
      );
    case "cvs":
      return (
        <svg {...common}>
          <path d="M8 2l5 3v4c0 3-5 5-5 5s-5-2-5-5V5l5-3z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="4" />
        </svg>
      );
  }
  void selected;
}

function CheckDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="currentColor" />
      <path
        d="M3.8 7l2.3 2.3 4.1-4.1"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ModelCatalog({
  models,
  selectedId,
  onSelect,
  loading,
}: {
  models: ModelInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  // The selected model's info panel at the bottom. Falls back to the first
  // AVAILABLE model when nothing is selected so the panel always has
  // meaningful content to show.
  const current =
    models.find((m) => m.id === selectedId) ??
    models.find((m) => AVAILABLE.has(m.id)) ??
    null;

  return (
    <>
      <div className="step-eyebrow">STEP 1 OF 5</div>
      <h1 className="step-title">Select a model</h1>
      <p className="step-sub">
        Choose what you want to learn from your surgical video. You can change
        this later.
      </p>

      {loading && <p className="empty">Loading models…</p>}
      {!loading && models.length === 0 && (
        <p className="empty">No models available. Check your backend connection.</p>
      )}

      {!loading && models.length > 0 && (
        <div className="model-grid-v2">
          {models.map((m) => {
            const available = AVAILABLE.has(m.id);
            const isSelected = selectedId === m.id;
            const className = [
              "model-card-v2",
              isSelected ? "selected" : "",
              !available ? "coming-soon" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={m.id}
                className={className}
                onClick={() => available && onSelect(m.id)}
                disabled={!available}
                aria-pressed={isSelected}
              >
                <div className="model-card-v2-head">
                  <div className="model-card-v2-icon">
                    <ModelIcon id={m.id} selected={isSelected} />
                  </div>
                  {isSelected ? (
                    <span className="model-card-v2-tag selected">
                      <CheckDot /> Selected
                    </span>
                  ) : !available ? (
                    <span className="model-card-v2-tag">Coming soon</span>
                  ) : (
                    <span className="model-card-v2-tag">Available</span>
                  )}
                </div>
                <div className="model-card-v2-name">{m.name}</div>
                <div className="model-card-v2-desc">{m.description}</div>
                <div className="model-card-v2-output">{m.output_type}</div>
              </button>
            );
          })}
        </div>
      )}

      {current && <ModelAbout model={current} />}
    </>
  );
}

function ModelAbout({ model }: { model: ModelInfo }) {
  return (
    <div className="model-about">
      <div>
        <div className="model-about-eyebrow">ABOUT {model.name.toUpperCase()}</div>
        <p className="model-about-body">{aboutBlurb(model)}</p>
        <div className="model-about-section">
          <h4>Intended use</h4>
          <p className="model-about-intended">
            Research use. Not for clinical decision-making.
          </p>
        </div>
      </div>
      <div>
        <div className="model-about-section" style={{ marginTop: 0 }}>
          <h4>Outputs</h4>
          <ul className="model-about-list">
            {model.outputs.map((o) => (
              <li key={o.key}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {o.label}
              </li>
            ))}
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M2 6l2.5 2.5L10 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ZIP of all outputs
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Short extra blurb below the one in the catalog cards. Keep deliberately
// generic so adding a new model doesn't require editing this component.
function aboutBlurb(model: ModelInfo): string {
  switch (model.id) {
    case "tool":
      return "Locates each instrument in every frame and follows it over time, producing motion metrics such as velocity, acceleration and distance traveled.";
    case "step":
      return "Segments the full procedure into surgical phases with start/end timestamps per step.";
    case "pgs":
      return "Samples key frames from the gradable window to assign a Parkland Grading Scale severity score.";
    case "mc2":
      return "Scores six surgical competencies on clips cut from each step's gradable window.";
    case "error":
      return "Detects bleeding, bile spillage and thermal injury events across the full video.";
    case "cvs":
      return "Assesses the three criteria required to achieve the Critical View of Safety.";
    default:
      return model.description;
  }
}
