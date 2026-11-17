// Modal overlay shown when the demo user clicks an action that would
// normally touch the file system or backend (upload, create dataset,
// start training, etc.). The overlay says "this action needs the
// desktop app" and offers a close button.
//
// Usage from anywhere in the tree:
//   import { openDemoGate } from "./DemoGate";
//   openDemoGate("upload labels");
//
// The host (`<DemoGateHost />`) must be mounted once (in App.tsx) for
// the modal to render.

import { useEffect, useState } from "react";

type Listener = (action: string | null) => void;
const listeners = new Set<Listener>();
let current: string | null = null;

function emit() {
  for (const l of listeners) l(current);
}

export function openDemoGate(action: string) {
  current = action;
  emit();
}
export function closeDemoGate() {
  current = null;
  emit();
}

export function DemoGateHost() {
  const [action, setAction] = useState<string | null>(current);
  useEffect(() => {
    const listener: Listener = (a) => setAction(a);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  if (!action) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-gate-title"
      onClick={closeDemoGate}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 15, 22, 0.56)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          maxWidth: 480,
          width: "100%",
          padding: "32px 32px 28px",
          boxShadow: "0 24px 60px rgba(13,15,22,0.28)",
          fontFamily: "inherit",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.18 + "em",
            textTransform: "uppercase",
            color: "#8C1515",
          }}
        >
          Demo preview
        </p>
        <h2
          id="demo-gate-title"
          style={{
            margin: "10px 0 14px",
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 600,
            fontSize: 24,
            lineHeight: 1.2,
            color: "#1A2744",
          }}
        >
          To {action}, download MINT.
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 15,
            lineHeight: 1.55,
            color: "#3D4A63",
          }}
        >
          This is a scripted tour of the MINT desktop app. Actions that
          would touch your files or models — uploads, dataset edits,
          training runs — are disabled here. The real app runs locally on
          your machine.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <a
            href="/SurgAI%20Forge%20Website%20Prototype/Open%20Resources.dc.html#mint"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 18px",
              borderRadius: 7,
              background: "#8C1515",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Request access →
          </a>
          <button
            type="button"
            onClick={closeDemoGate}
            style={{
              fontFamily: "inherit",
              padding: "10px 16px",
              borderRadius: 7,
              background: "#fff",
              border: "1px solid #DCE0E6",
              color: "#1A2744",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Keep exploring the demo
          </button>
        </div>
      </div>
    </div>
  );
}
