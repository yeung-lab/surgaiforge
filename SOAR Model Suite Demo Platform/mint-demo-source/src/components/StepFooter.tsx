import type { ReactNode } from "react";

export function StepFooter({
  onBack,
  onContinue,
  continueLabel,
  canContinue,
  blockedReason,
  leftNote,
  continueVariant = "primary",
}: {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel: string;
  canContinue: boolean;
  blockedReason?: ReactNode;
  leftNote?: ReactNode;
  continueVariant?: "primary" | "success";
}) {
  return (
    <div className="step-footer">
      <div className="step-footer-left">
        {onBack ? (
          <button className="btn" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        ) : (
          <span />
        )}
        {leftNote && <span className="step-footer-note">{leftNote}</span>}
      </div>
      <div className="step-footer-right">
        {!canContinue && blockedReason && (
          <span className="step-footer-blocked">{blockedReason}</span>
        )}
        {onContinue && (
          <button
            className={`btn step-footer-cta step-footer-cta-${continueVariant}`}
            disabled={!canContinue}
            onClick={onContinue}
          >
            {continueLabel}
          </button>
        )}
      </div>
    </div>
  );
}
