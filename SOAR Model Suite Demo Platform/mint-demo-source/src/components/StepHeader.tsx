export interface StepHeaderItem {
  n: number;
  label: string;
  // "upcoming" — can't navigate here yet (greyed, not clickable)
  // "current" — the active step (filled badge)
  // "done" — completed step (check mark badge, clickable to return)
  state: "upcoming" | "current" | "done";
}

export function StepHeader({
  steps,
  onNavigate,
}: {
  steps: StepHeaderItem[];
  onNavigate: (n: number) => void;
}) {
  return (
    <nav className="step-header" aria-label="Progress">
      {steps.map((s, i) => {
        const clickable = s.state !== "upcoming";
        return (
          <div key={s.n} className="step-header-item-wrap">
            <button
              type="button"
              className={`step-header-item ${s.state}`}
              disabled={!clickable}
              onClick={() => clickable && onNavigate(s.n)}
            >
              <span className="step-header-badge">
                {s.state === "done" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M2.5 6l2.5 2.5 4.5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  s.n
                )}
              </span>
              <span className="step-header-label">{s.label}</span>
            </button>
            {i < steps.length - 1 && <span className="step-header-sep" aria-hidden />}
          </div>
        );
      })}
    </nav>
  );
}
