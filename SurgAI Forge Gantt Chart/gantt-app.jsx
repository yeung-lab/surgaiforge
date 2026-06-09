/* gantt-app.jsx — SurgAI Forge roadmap (Cardinal direction) */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const LS_KEY = 'surgai_gantt_cardinal_v1';

/* ---------- persistence ---------- */
function loadState() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dayW": 19,
  "density": "regular",
  "weekendShade": true,
  "ownerLabels": true,
  "accentBars": true
}/*EDITMODE-END*/;

const ROWH = { compact: 30, regular: 34, roomy: 40 };

function GanttApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const saved = useRef(loadState()).current;

  const [tasks, setTasks] = useState(() => saved.tasks || window.GANTT_TASKS.map(x => ({ ...x })));
  const [collapsed, setCollapsed] = useState(() => new Set(saved.collapsed || []));
  const [selectedId, setSelectedId] = useState(null);
  const [hover, setHover] = useState(null); // {task,x,y}
  const [criticalMode, setCriticalMode] = useState(saved.criticalMode || false);
  const [depsMode, setDepsMode] = useState(saved.depsMode || 'selection'); // off | selection | all
  const [showRisks, setShowRisks] = useState(false);

  const META = window.GANTT_META;
  const SECTIONS = window.GANTT_SECTIONS;
  const RISKS = window.GANTT_RISKS;
  const rangeStart = META.rangeStart, rangeEnd = META.rangeEnd;
  const dayW = t.dayW;
  const rowH = ROWH[t.density] || 34;
  const { secH, axisH, barH, leftW } = window.LAYOUT;

  const tasksById = useMemo(() => Object.fromEntries(tasks.map(x => [x.id, x])), [tasks]);
  const allIds = useMemo(() => new Set(tasks.map(x => x.id)), [tasks]);

  /* group tasks by section, in source order */
  const grouped = useMemo(() => {
    const m = {};
    SECTIONS.forEach(s => (m[s.id] = []));
    tasks.forEach(x => { (m[x.section] || (m[x.section] = [])).push(x); });
    return SECTIONS.map(s => ({ ...s, color: window.SECTION_COLORS[s.id], tasks: m[s.id] || [] }));
  }, [tasks]);

  /* axis */
  const axis = useMemo(() => window.buildAxis(rangeStart, rangeEnd, dayW), [rangeStart, rangeEnd, dayW]);
  const timeW = axis.widthPx;

  /* visual rows w/ y offsets */
  const { rows, rowsH, posById } = useMemo(() => {
    const rows = []; let y = 0; const posById = {};
    grouped.forEach(sec => {
      const open = !collapsed.has(sec.id);
      rows.push({ type: 'sec', sec, y, h: secH, open });
      y += secH;
      if (open) {
        sec.tasks.forEach(task => {
          const x = window.diffDays(rangeStart, task.start) * dayW;
          const w = Math.max(dayW, task.durDays * dayW);
          const yc = y + rowH / 2;
          posById[task.id] = { x, w, xEnd: x + w, yc, color: sec.color };
          rows.push({ type: 'task', task, color: sec.color, y, h: rowH });
          y += rowH;
        });
      }
    });
    return { rows, rowsH: y, posById };
  }, [grouped, collapsed, dayW, rowH, rangeStart]);

  /* persist */
  useEffect(() => {
    saveState({ tasks, collapsed: [...collapsed], criticalMode, depsMode });
  }, [tasks, collapsed, criticalMode, depsMode]);

  /* ----- actions ----- */
  const toggleSection = id => setCollapsed(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => setCollapsed(new Set(SECTIONS.map(s => s.id)));
  const updateTask = up => setTasks(ts => ts.map(x => x.id === up.id ? up : x));
  const deleteTask = id => { setTasks(ts => ts.filter(x => x.id !== id)); setSelectedId(null); };
  const resetAll = () => {
    if (!confirm('Reset all edits back to the imported plan?')) return;
    setTasks(window.GANTT_TASKS.map(x => ({ ...x }))); setCollapsed(new Set()); setSelectedId(null);
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'surgai_forge_gantt.json'; a.click();
  };

  /* ----- drag move / resize ----- */
  const drag = useRef(null);
  const onBarDown = (e, task, mode) => {
    e.stopPropagation();
    drag.current = { id: task.id, mode, startX: e.clientX, s0: task.start, e0: task.end, moved: false };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragUp);
  };
  const onDragMove = useCallback(e => {
    const d = drag.current; if (!d) return;
    const dd = Math.round((e.clientX - d.startX) / dayW);
    if (dd === 0 && !d.moved) return;
    d.moved = true;
    setTasks(ts => ts.map(x => {
      if (x.id !== d.id) return x;
      let s = d.s0, en = d.e0;
      if (d.mode === 'move') { s = window.addDays(d.s0, dd); en = window.addDays(d.e0, dd); }
      else if (d.mode === 'l') { s = window.addDays(d.s0, dd); if (window.diffDays(s, en) < 0) s = en; }
      else if (d.mode === 'r') { en = window.addDays(d.e0, dd); if (window.diffDays(s, en) < 0) en = s; }
      return { ...x, start: s, end: en, durDays: window.diffDays(s, en) + 1 };
    }));
  }, [dayW]);
  const onDragUp = useCallback(() => {
    drag.current = null;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragUp);
  }, [onDragMove]);

  /* ----- dependency lines ----- */
  const depLines = useMemo(() => {
    if (depsMode === 'off') return [];
    let pairs = [];
    const consider = depsMode === 'selection'
      ? (selectedId ? tasks.filter(x => x.id === selectedId || x.deps.includes(selectedId)) : [])
      : tasks;
    consider.forEach(task => {
      task.deps.forEach(dep => {
        const a = posById[dep], b = posById[task.id];
        if (!a || !b) return;
        pairs.push({ from: dep, to: task.id, a, b, crit: tasksById[dep]?.critical && task.critical });
      });
    });
    return pairs;
  }, [depsMode, selectedId, tasks, posById, tasksById]);

  /* ----- markers ----- */
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayInRange = todayISO >= rangeStart && todayISO <= rangeEnd;
  const todayX = window.diffDays(rangeStart, todayISO) * dayW;
  const markers = META.markers.map(m => ({ ...m, x: window.diffDays(rangeStart, m.date) * dayW }));

  const selectedTask = tasksById[selectedId];
  const selSection = selectedTask && SECTIONS.find(s => s.id === selectedTask.section);

  /* hover handlers */
  const showTip = (e, task) => setHover({ task, x: e.clientX, y: e.clientY });
  const moveTip = e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h);
  const hideTip = () => setHover(null);

  const critN = tasks.filter(x => x.critical).length;

  return (
    <div className="app" onMouseDown={() => { setSelectedId(null); setShowRisks(false); }}>
      {/* ===== top bar ===== */}
      <header className="topbar" onMouseDown={e => e.stopPropagation()}>
        <div className="brand">
          <img className="spark" src="logo.png" alt="SurgAI Forge logo" />
          <div className="brand-text">
            <div className="wordmark">SurgAI <span>Forge</span></div>
            <div className="brand-sub">Launch Roadmap · Jun 8 – Aug 15, 2026</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="kpi"><span className="kpi-n">{tasks.length}</span><span className="kpi-l">tasks</span></div>
          <div className="kpi"><span className="kpi-n">{SECTIONS.length}</span><span className="kpi-l">workstreams</span></div>
          <div className="kpi"><span className="kpi-n crit">{critN}</span><span className="kpi-l">critical</span></div>
          <button className={'risk-btn' + (RISKS.length ? ' has' : '')} onMouseDown={e => { e.stopPropagation(); setShowRisks(v => !v); }}>
            <span className="warn-dot"></span>{RISKS.length} schedule risks
          </button>
        </div>
      </header>

      {/* ===== toolbar ===== */}
      <div className="toolbar" onMouseDown={e => e.stopPropagation()}>
        <div className="tgroup">
          <button className="tbtn" onClick={expandAll}>Expand all</button>
          <button className="tbtn" onClick={collapseAll}>Collapse all</button>
        </div>
        <div className="sep"></div>
        <button className={'tbtn toggle' + (criticalMode ? ' on' : '')} onClick={() => setCriticalMode(v => !v)}>
          <span className="crit-dot"></span>Critical path
        </button>
        <div className="seg">
          <span className="seg-label">Dependencies</span>
          {['off', 'selection', 'all'].map(m => (
            <button key={m} className={'seg-btn' + (depsMode === m ? ' on' : '')} onClick={() => setDepsMode(m)}>
              {m === 'selection' ? 'selected' : m}
            </button>
          ))}
        </div>
        <div className="spacer"></div>
        <div className="seg zoom">
          <button className="seg-btn" onClick={() => setTweak('dayW', Math.max(10, t.dayW - 2))}>−</button>
          <span className="seg-label mono">{Math.round(dayW / 19 * 100)}%</span>
          <button className="seg-btn" onClick={() => setTweak('dayW', Math.min(34, t.dayW + 2))}>+</button>
        </div>
        <div className="sep"></div>
        <button className="tbtn" onClick={exportJSON}>Export JSON</button>
        <button className="tbtn ghost" onClick={resetAll}>Reset</button>
      </div>

      {/* ===== grid ===== */}
      <div className="grid-scroll">
        <div className="grid-inner" style={{ width: leftW + timeW }}>
          {/* axis */}
          <div className="axisbar" style={{ height: axisH }}>
            <div className="axis-corner" style={{ width: leftW, height: axisH }}>
              <span>Workstream / Task</span><span className="ac-owner">Owner</span>
            </div>
            <div className="axis-time" style={{ width: timeW, height: axisH }}>
              {axis.months.map((m, i) => (
                <div key={i} className="ax-month" style={{ left: m.x, width: m.w }}>
                  <span>{m.label}<i className="ax-year">{m.year}</i></span>
                </div>
              ))}
              {axis.weeks.map((w, i) => (
                <div key={i} className="ax-week" style={{ left: w.x }}>
                  <span className="mono">{window.fmtShort(w.iso)}</span>
                </div>
              ))}
              {markers.map((m, i) => (
                <div key={i} className={'ax-cap ' + m.kind} style={{ left: m.x }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* body */}
          <div className="body" style={{ height: rowsH }}>
            {/* left frozen column */}
            <div className="leftcol" style={{ width: leftW, height: rowsH }}>
              {rows.map((r, i) => r.type === 'sec' ? (
                <div key={'s' + r.sec.id} className="lc-sec" style={{ height: r.h }}
                  onMouseDown={e => { e.stopPropagation(); toggleSection(r.sec.id); }}>
                  <span className={'chev' + (r.open ? ' open' : '')}>▸</span>
                  <span className="lc-sw" style={{ background: r.sec.color }}></span>
                  <span className="lc-sec-title">{r.sec.title}</span>
                  <span className="lc-count mono">{r.sec.tasks.length}</span>
                </div>
              ) : (
                <div key={r.task.id} className={'lc-task' + (selectedId === r.task.id ? ' sel' : '')}
                  style={{ height: r.h }}
                  onMouseDown={e => { e.stopPropagation(); setSelectedId(r.task.id); }}
                  onMouseEnter={e => showTip(e, r.task)} onMouseMove={moveTip} onMouseLeave={hideTip}>
                  <span className="lc-id mono" style={{ color: r.color }}>{r.task.id}</span>
                  <span className="lc-name">{r.task.milestone && <span className="lc-ms">◆</span>}{r.task.name}</span>
                  {r.task.critical && <span className="lc-crit" title="Critical path"></span>}
                  {t.ownerLabels && <span className="lc-owner"><window.OwnerAvatar owner={r.task.owner} /></span>}
                </div>
              ))}
            </div>

            {/* timeline */}
            <div className="timeline" style={{ width: timeW, height: rowsH }}
              onMouseMove={moveTip}>
              {/* background grid svg */}
              <svg className="bg" width={timeW} height={rowsH}>
                {t.weekendShade && Array.from({ length: axis.total }).map((_, i) => {
                  const wd = window.weekdayUTC(window.addDays(rangeStart, i));
                  if (wd !== 0 && wd !== 6) return null;
                  return <rect key={i} x={i * dayW} y={0} width={dayW} height={rowsH} fill="#000" opacity="0.022" />;
                })}
                {axis.weeks.map((w, i) => (
                  <line key={i} x1={w.x} y1={0} x2={w.x} y2={rowsH} stroke="#000" strokeOpacity="0.05" />
                ))}
                {axis.months.map((m, i) => i > 0 && (
                  <line key={'m' + i} x1={m.x} y1={0} x2={m.x} y2={rowsH} stroke="#000" strokeOpacity="0.10" />
                ))}
                {/* section bands */}
                {rows.map((r, i) => r.type === 'sec' && (
                  <rect key={'sb' + i} x={0} y={r.y} width={timeW} height={r.h} fill={r.sec.color} opacity="0.05" />
                ))}
              </svg>

              {/* bars */}
              {rows.map(r => r.type === 'task' && (() => {
                const p = posById[r.task.id]; if (!p) return null;
                const faded = criticalMode && !r.task.critical;
                const isCrit = r.task.critical;
                const useCrit = criticalMode && isCrit;
                const barColor = useCrit ? window.CARDINAL : r.color;
                const top = r.y + (r.h - barH) / 2;
                return (
                  <div key={r.task.id}
                    className={'bar' + (faded ? ' faded' : '') + (selectedId === r.task.id ? ' sel' : '') + (isCrit ? ' crit' : '')}
                    style={{ left: p.x, top, width: p.w, height: barH, '--bc': barColor }}
                    onMouseDown={e => onBarDown(e, r.task, 'move')}
                    onClick={e => { e.stopPropagation(); if (!drag.current?.moved) setSelectedId(r.task.id); }}
                    onMouseEnter={e => showTip(e, r.task)} onMouseMove={moveTip} onMouseLeave={hideTip}>
                    <span className="bar-h l" onMouseDown={e => onBarDown(e, r.task, 'l')}></span>
                    <span className="bar-fill"></span>
                    {isCrit && <span className="bar-crit-edge"></span>}
                    <span className="bar-h r" onMouseDown={e => onBarDown(e, r.task, 'r')}></span>
                    {t.ownerLabels && p.w > 46 && <span className="bar-owner" style={{ left: p.w + 6 }}>{r.task.owner.split('/')[0].trim()}{r.task.owner.includes('/') ? ' +' : ''}</span>}
                  </div>
                );
              })())}

              {/* milestones + dep lines + markers overlay */}
              <svg className="overlay" width={timeW} height={rowsH}>
                <defs>
                  <marker id="arr" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#9aa0a6" />
                  </marker>
                  <marker id="arrc" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={window.CARDINAL} />
                  </marker>
                </defs>
                {depLines.map((d, i) => {
                  const x1 = d.a.xEnd, y1 = d.a.yc, x2 = d.b.x, y2 = d.b.yc;
                  const midx = Math.max(x1 + 10, x2 - 10);
                  const path = `M${x1},${y1} L${x1 + 8},${y1} L${x1 + 8},${y2} L${x2 - 2},${y2}`;
                  const c = d.crit ? window.CARDINAL : '#9aa0a6';
                  return <path key={i} d={path} fill="none" stroke={c} strokeWidth={d.crit ? 1.6 : 1.1}
                    strokeOpacity={depsMode === 'all' ? 0.45 : 0.85} markerEnd={d.crit ? 'url(#arrc)' : 'url(#arr)'} />;
                })}
                {rows.map(r => {
                  if (r.type !== 'task' || !r.task.milestone) return null;
                  const p = posById[r.task.id]; if (!p) return null;
                  const useCrit = criticalMode && r.task.critical;
                  return <window.Diamond key={'d' + r.task.id} x={p.xEnd} y={r.y + r.h / 2} size={14}
                    fill={useCrit ? window.CARDINAL : '#fff'} stroke={useCrit ? '#5e0d0d' : r.color} title={r.task.name} />;
                })}
              </svg>

              {/* today band */}
              {todayInRange && <div className="today-band" style={{ left: todayX, width: dayW }}></div>}
              {/* today label floating at top of timeline */}
              {todayInRange && <div className="today-label" style={{ left: todayX }}>Today</div>}
              {/* today + markers (vertical lines) */}
              {todayInRange && <div className="today" style={{ left: todayX }}></div>}
              {markers.map((m, i) => (
                <div key={i} className={'marker ' + m.kind} style={{ left: m.x }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* legend footer */}
      <footer className="legend" onMouseDown={e => e.stopPropagation()}>
        <span className="lg-item"><span className="lg-bar"></span>Task</span>
        <span className="lg-item"><span className="lg-dia">◆</span>Milestone</span>
        <span className="lg-item"><span className="lg-crit"></span>Critical path</span>
        <span className="lg-item"><span className="lg-today"></span>Today</span>
        <span className="lg-item"><span className="lg-hand"></span>Handoff (Jul 20)</span>
        <span className="lg-item"><span className="lg-launch"></span>Public launch (Aug 15)</span>
        <span className="lg-spacer"></span>
        <span className="lg-hint mono">drag bars to reschedule · click to edit</span>
      </footer>

      {/* tooltip */}
      {hover && !selectedTask && (
        <window.Tooltip task={hover.task} x={hover.x} y={hover.y}
          color={window.SECTION_COLORS[hover.task.section]}
          depNames={hover.task.deps} />
      )}

      {/* edit drawer */}
      {selectedTask && (
        <window.EditDrawer task={selectedTask} sectionTitle={selSection?.title} color={selSection?.color}
          onChange={updateTask} onDelete={deleteTask} onClose={() => setSelectedId(null)} allIds={allIds} />
      )}

      {/* risks */}
      {showRisks && (
        <window.RisksPanel risks={RISKS} tasksById={tasksById}
          onPick={id => { setShowRisks(false); setSelectedId(id);
            setCollapsed(s => { const n = new Set(s); const tk = tasksById[id]; if (tk) n.delete(tk.section); return n; }); }}
          onClose={() => setShowRisks(false)} />
      )}

      {/* tweaks */}
      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakSlider label="Day width" value={t.dayW} min={10} max={34} unit="px" onChange={v => setTweak('dayW', v)} />
        <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'roomy']} onChange={v => setTweak('density', v)} />
        <TweakSection label="Detail" />
        <TweakToggle label="Owner labels" value={t.ownerLabels} onChange={v => setTweak('ownerLabels', v)} />
        <TweakToggle label="Weekend shading" value={t.weekendShade} onChange={v => setTweak('weekendShade', v)} />
        <TweakToggle label="Section accent bands" value={t.accentBars} onChange={v => setTweak('accentBars', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<GanttApp />);
