// Inline SVG icons — self-contained, no icon-font dependency.
import type { CSSProperties } from "react";

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const UploadIcon = ({ size = 26, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M12 16V5M7 10l5-5 5 5" />
    <path d="M5 19h14" />
  </svg>
);

export const DocIcon = ({ size = 18, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
    <path d="M14 3v4h4" />
  </svg>
);

export const FolderIcon = ({ size = 18, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const TableIcon = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <path d="M3 9h18M3 14h18M9 4v16" />
  </svg>
);

export const ChartIcon = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M4 19V5M4 19h16" />
    <path d="M7 15l3-4 3 2 4-6" />
  </svg>
);

export const CheckCircleIcon = ({ size = 18, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.2 2.2 4.8-5" />
  </svg>
);

export const XCircleIcon = ({ size = 18, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

export const WarningIcon = ({ size = 18, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M12 3l9 16H3z" />
    <path d="M12 10v4M12 17.5v.01" />
  </svg>
);

export const InfoIcon = ({ size = 18, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.01" />
  </svg>
);

export const PlayIcon = ({ size = 16, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const ChevronIcon = ({ size = 14, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const TrashIcon = ({ size = 16, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
);
