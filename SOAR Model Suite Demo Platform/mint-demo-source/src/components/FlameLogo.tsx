// Stylized cardinal-red flame — a self-contained recreation of the SurgAI Forge
// mark (a red flame with white negative-space swooshes forming an "S").
export function FlameLogo({ size = 34 }: { size?: number }) {
  return (
    <svg
      className="brand-flame"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="SurgAI Forge flame"
    >
      <rect width="100" height="100" rx="24" fill="#8C1515" />
      <path
        d="M52 16c9 15-7 20-2 33 4 10 13 9 13 20a22 22 0 1 1-35-4c6 9 13 3 10-9-4-13 5-22 14-40z"
        fill="#fff"
      />
      <path
        d="M50 40c4 7-3 9-1 15 2 5 6 5 6 10a10 10 0 1 1-16-2c3 4 6 1 5-4-2-6 2-11 1-19z"
        fill="#8C1515"
      />
    </svg>
  );
}
