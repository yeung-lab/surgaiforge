export type ChipVariant = "idle" | "ready" | "running" | "complete" | "failed";

export function StatusChip({
  label,
  variant,
  pulse,
}: {
  label: string;
  variant: ChipVariant;
  pulse?: boolean;
}) {
  return (
    <span className={`chip ${variant}${pulse ? " pulse" : ""}`}>
      <span className="chip-dot" />
      {label}
    </span>
  );
}
