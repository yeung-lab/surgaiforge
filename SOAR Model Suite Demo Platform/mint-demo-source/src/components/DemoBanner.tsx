// Persistent "you are viewing a demo" strip, always rendered when
// VITE_DEMO_MODE=true. Sits above the step header; sticky so it stays
// visible through long scrolling pages.

export function DemoBanner() {
  return (
    <div
      role="note"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "#8C1515",
        color: "#fff",
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.3,
        display: "flex",
        justifyContent: "center",
        gap: 10,
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <span>
        <span style={{ fontWeight: 700, letterSpacing: 0.8 }}>DEMO</span>
        <span style={{ marginLeft: 8, opacity: 0.9, fontWeight: 500 }}>
          You are previewing the MINT desktop app in your browser — no
          inference actually runs, nothing you click is uploaded, and the
          example data is scripted.
        </span>
      </span>
    </div>
  );
}
