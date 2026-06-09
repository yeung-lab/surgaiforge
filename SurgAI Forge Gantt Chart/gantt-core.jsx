/* gantt-core.jsx — constants, date math, palette, small atoms (Cardinal direction) */

/* ---- Layout constants ---- */
const LAYOUT = {
  leftW: 384,
  rowH: 34,
  secH: 42,
  axisH: 58,
  dayW: 18,        // default px per day (overridden by tweak)
  barH: 18,
};

/* ---- Cardinal workstream palette: warm, institutional, muted; cardinal reserved ---- */
const SECTION_COLORS = {
  governance:    '#5B6B7A',
  messaging:     '#9A6A4E',
  website:       '#4F7A6B',
  repos:         '#6E6088',
  models:        '#3F6E9A',
  annotations:   '#8A7A3F',
  documentation: '#807A72',
  video:         '#8A5E72',
  leaderboard:   '#3E807E',
  webapp:        '#5E6FA0',
  inference:     '#6F8A4E',
  publications:  '#9A7A55',
  launch:        '#6B5E55',
};
const CARDINAL = '#8C1515';

/* ---- Date helpers (UTC, ISO YYYY-MM-DD) ---- */
const DAY = 86400000;
function D(iso) { return new Date(iso + 'T00:00:00Z'); }
function isoOf(d) { return d.toISOString().slice(0, 10); }
function addDays(iso, n) { return isoOf(new Date(D(iso).getTime() + n * DAY)); }
function diffDays(a, b) { return Math.round((D(b) - D(a)) / DAY); }
function fmtShort(iso) {
  const d = D(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function fmtLong(iso) {
  const d = D(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function weekdayUTC(iso) { return D(iso).getUTCDay(); } // 0 Sun .. 6 Sat

/* Build axis ticks: month bands + weekly (Monday) gridlines */
function buildAxis(rangeStart, rangeEnd, dayW) {
  const total = diffDays(rangeStart, rangeEnd) + 1;
  const weeks = [];
  const months = [];
  for (let i = 0; i < total; i++) {
    const iso = addDays(rangeStart, i);
    const d = D(iso);
    // weekly tick on Mondays (and the very first day)
    if (d.getUTCDay() === 1 || i === 0) {
      weeks.push({ iso, x: i * dayW });
    }
    // month band start
    if (d.getUTCDate() === 1 || i === 0) {
      months.push({ iso, x: i * dayW, label: d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }), year: d.getUTCFullYear() });
    }
  }
  // compute month widths
  months.forEach((m, idx) => {
    const nextX = idx + 1 < months.length ? months[idx + 1].x : total * dayW;
    m.w = nextX - m.x;
  });
  return { total, weeks, months, widthPx: total * dayW };
}

/* ---- Atoms ---- */

function OwnerAvatar({ owner, size = 20 }) {
  // multiple owners -> stacked initials chips
  const names = String(owner).split('/').map(s => s.trim()).filter(Boolean);
  const initials = names.map(n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
  const show = initials.slice(0, 3);
  return (
    <span className="avatars" style={{ height: size }}>
      {show.map((ini, i) => (
        <span key={i} className="avatar" style={{ width: size, height: size, marginLeft: i ? -6 : 0, zIndex: 10 - i }}
          title={names[i]}>{ini}</span>
      ))}
      {names.length > 3 && <span className="avatar more" style={{ width: size, height: size, marginLeft: -6 }}>+{names.length - 3}</span>}
    </span>
  );
}

function Diamond({ x, y, size = 13, fill, stroke, title }) {
  const h = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-h} y={-h} width={size} height={size} transform="rotate(45)" rx="2"
        fill={fill} stroke={stroke} strokeWidth="1.5" />
      {title && <title>{title}</title>}
    </g>
  );
}

/* expose */
Object.assign(window, {
  LAYOUT, SECTION_COLORS, CARDINAL,
  D, isoOf, addDays, diffDays, fmtShort, fmtLong, weekdayUTC, buildAxis,
  OwnerAvatar, Diamond,
});
