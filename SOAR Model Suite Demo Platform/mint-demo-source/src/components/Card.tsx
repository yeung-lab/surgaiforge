import type { ReactNode } from "react";

export function Card({
  id,
  step,
  eyebrow,
  title,
  disabled,
  children,
}: {
  id: string;
  step?: number;
  eyebrow?: string;
  title: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const kicker = eyebrow ?? (step !== undefined ? `STEP ${step}` : null);
  return (
    <section id={id} className={`card${disabled ? " disabled" : ""}`}>
      {kicker && <div className="card-eyebrow">{kicker}</div>}
      <h2 className="card-title">{title}</h2>
      {children}
    </section>
  );
}
