import type { ReadyStatus } from "../api/types";

const LABEL: Record<ReadyStatus, string> = {
  ready: "Ready",
  needs_attention: "Needs attention",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: ReadyStatus }) {
  return <span className={`badge ${status}`}>{LABEL[status]}</span>;
}
