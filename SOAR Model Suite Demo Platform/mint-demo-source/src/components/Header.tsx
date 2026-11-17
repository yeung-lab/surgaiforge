import { isDemoMode } from "../demoMode";
import { BackendControl } from "./BackendControl";
import { StatusChip, type ChipVariant } from "./StatusChip";

export type AppMode = "inference" | "train";

const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

export function Header({
  runId,
  chip,
  online,
  engine,
  onBackendChange,
  mode,
  onModeChange,
}: {
  runId?: string;
  chip: { label: string; variant: ChipVariant; pulse?: boolean };
  online: boolean;
  engine?: string;
  onBackendChange: () => void;
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
}) {
  return (
    <header className="header">
      <div className="header-inner">
        <BrandLockup />
        <div className="header-right">
          <ModeToggle mode={mode} onChange={onModeChange} />
          {runId && <span className="run-id">{runId}</span>}
          <StatusChip label={chip.label} variant={chip.variant} pulse={chip.pulse} />
          {!isDemoMode() && <BackendControl online={online} engine={engine} onChange={onBackendChange} />}
        </div>
      </div>
    </header>
  );
}

function BrandLockup() {
  // Two-group lockup: [flame + SurgAI Forge] · [leaf + Mint + tagline].
  // Each glyph has similar weight so neither reads as an orphan, and the
  // tagline hangs off "Mint" (the product), keeping the parent/child
  // hierarchy readable. Per Serena's 2026-11-05 brand-alignment review.
  //
  // In the demo build, the SurgAI Forge group links back to the site
  // homepage so a visitor can escape the demo surface.
  const forgeGroup = (
    <>
      <img src={asset("flame-cardinal.png")} alt="" className="brand-glyph" aria-hidden />
      <span className="brand-wordmark">
        SurgAI <em>Forge</em>
      </span>
    </>
  );
  return (
    <div className="brand">
      {isDemoMode() ? (
        <a
          href="../SurgAI%20Forge%20Homepage.dc.html"
          className="brand-group"
          aria-label="Back to the SurgAI Forge homepage"
          title="Back to the SurgAI Forge homepage"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {forgeGroup}
        </a>
      ) : (
        <div className="brand-group">{forgeGroup}</div>
      )}
      <span className="brand-sep" aria-hidden>·</span>
      <div className="brand-group brand-group--mint">
        <img src={asset("mint-leaf.png")} alt="" className="brand-glyph brand-glyph--leaf" aria-hidden />
        <div className="brand-text">
          <span className="brand-product">Mint</span>
          <span className="brand-eyebrow">Model Inference &amp; No-code Training</span>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: AppMode;
  onChange: (m: AppMode) => void;
}) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "inference"}
        className={mode === "inference" ? "active" : ""}
        onClick={() => onChange("inference")}
      >
        Inference
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "train"}
        className={mode === "train" ? "active" : ""}
        onClick={() => onChange("train")}
      >
        Train
      </button>
    </div>
  );
}
