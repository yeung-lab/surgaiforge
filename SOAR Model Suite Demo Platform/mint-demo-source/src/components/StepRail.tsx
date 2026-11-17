export interface RailStep {
  n: number;
  label: string;
  href: string;
  dot: string; // css modifier: ready | needs_attention | failed | running | complete | ""
  active: boolean;
}

export function StepRail({ steps }: { steps: RailStep[] }) {
  return (
    <aside className="rail">
      <div className="rail-label">INFERENCE · 5 STEPS</div>
      <nav>
        {steps.map((s) => (
          <a key={s.n} href={s.href} className={`rail-item${s.active ? " active" : ""}`}>
            <span className="rail-badge">{s.n}</span>
            <span className="rail-text">{s.label}</span>
            <span className={`rail-dot ${s.dot}`} />
          </a>
        ))}
      </nav>
    </aside>
  );
}
