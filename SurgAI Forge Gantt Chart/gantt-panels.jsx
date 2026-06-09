/* gantt-panels.jsx — Tooltip, EditDrawer, RisksPanel */

function Tooltip({ task, x, y, depNames, color }) {
  if (!task) return null;
  // flip if near right edge
  const flip = x > window.innerWidth - 320;
  const style = { left: flip ? x - 300 : x + 16, top: Math.min(y, window.innerHeight - 240) };
  return (
    <div className="tooltip" style={style}>
      <div className="tt-head">
        <span className="tt-chip" style={{ background: color }}>{task.id}</span>
        <span className="tt-name">{task.name}</span>
      </div>
      {task.critical && <div className="tt-crit">● Critical path</div>}
      <dl className="tt-grid">
        <dt>Owner</dt><dd>{task.owner}</dd>
        <dt>Start</dt><dd className="mono">{window.fmtLong(task.start)}</dd>
        <dt>Finish</dt><dd className="mono">{window.fmtLong(task.end)}</dd>
        <dt>Duration</dt><dd className="mono">{task.durDays} days{task.hrs ? ` · ${task.hrs}h effort` : ''}</dd>
        <dt>Depends&nbsp;on</dt><dd>{depNames.length ? depNames.join(', ') : '—'}</dd>
        {task.milestone && <><dt>Type</dt><dd>Milestone ◆</dd></>}
      </dl>
      {task.notes && <div className="tt-notes">{task.notes}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function EditDrawer({ task, sectionTitle, color, onChange, onDelete, onClose, allIds }) {
  if (!task) return null;
  const set = (k, v) => onChange({ ...task, [k]: v });
  const setDates = (k, v) => {
    const next = { ...task, [k]: v };
    next.durDays = Math.max(1, window.diffDays(next.start, next.end) + 1);
    onChange(next);
  };
  return (
    <div className="drawer" onMouseDown={e => e.stopPropagation()}>
      <div className="drawer-head">
        <div className="drawer-eyebrow">
          <span className="sw" style={{ background: color }}></span>{sectionTitle}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="drawer-body">
        <div className="drawer-id mono">{task.id}</div>
        <Field label="Task name">
          <input className="inp" value={task.name} onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="Owner(s)">
          <input className="inp" value={task.owner} onChange={e => set('owner', e.target.value)} />
        </Field>
        <div className="field-row">
          <Field label="Start">
            <input className="inp mono" type="date" value={task.start} onChange={e => setDates('start', e.target.value)} />
          </Field>
          <Field label="Finish">
            <input className="inp mono" type="date" value={task.end} onChange={e => setDates('end', e.target.value)} />
          </Field>
        </div>
        <div className="field-row">
          <Field label="Duration">
            <div className="inp readonly mono">{task.durDays} days</div>
          </Field>
          <Field label="Effort (h)">
            <input className="inp mono" type="number" value={task.hrs ?? ''} onChange={e => set('hrs', e.target.value === '' ? null : Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Dependencies (comma-separated IDs)">
          <input className="inp mono" value={task.depRaw}
            onChange={e => {
              const raw = e.target.value;
              const list = raw.split(',').map(s => s.trim()).filter(Boolean);
              onChange({ ...task, depRaw: raw, deps: list });
            }} />
          <div className="dep-hint">
            {task.deps.map(d => (
              <span key={d} className={'dep-pill mono' + (allIds.has(d) ? '' : ' bad')}>{d}</span>
            ))}
          </div>
        </Field>
        <Field label="Notes">
          <textarea className="inp ta" rows="3" value={task.notes} onChange={e => set('notes', e.target.value)} placeholder="Add context, blockers, links…" />
        </Field>
        <div className="toggles">
          <button className={'pill-toggle' + (task.critical ? ' on crit' : '')} onClick={() => set('critical', !task.critical)}>
            {task.critical ? '● ' : '○ '}Critical path
          </button>
          <button className={'pill-toggle' + (task.milestone ? ' on' : '')} onClick={() => set('milestone', !task.milestone)}>
            {task.milestone ? '◆ ' : '◇ '}Milestone
          </button>
        </div>
      </div>
      <div className="drawer-foot">
        <button className="btn ghost danger" onClick={() => onDelete(task.id)}>Delete task</button>
        <button className="btn solid" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function RisksPanel({ risks, tasksById, onPick, onClose }) {
  const order = { high: 0, med: 1, low: 2 };
  const sorted = [...risks].sort((a, b) => order[a.severity] - order[b.severity]);
  const counts = risks.reduce((a, r) => (a[r.severity] = (a[r.severity] || 0) + 1, a), {});
  const sevLabel = { high: 'High', med: 'Medium', low: 'Note' };
  return (
    <div className="drawer risks" onMouseDown={e => e.stopPropagation()}>
      <div className="drawer-head">
        <div className="drawer-eyebrow"><span className="warn-dot"></span>Schedule Risks</div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="risks-summary">
        <span className="rc high">{counts.high || 0} high</span>
        <span className="rc med">{counts.med || 0} medium</span>
        <span className="rc low">{counts.low || 0} notes</span>
      </div>
      <p className="risks-intro">
        Auto-detected from the source plan. Dates and dependencies are preserved exactly as imported —
        nothing was silently changed. Click a row to open the task.
      </p>
      <div className="risks-list">
        {sorted.map((r, i) => (
          <button key={i} className={'risk-item sev-' + r.severity} onClick={() => onPick(r.task)}>
            <div className="risk-top">
              <span className={'risk-sev ' + r.severity}>{sevLabel[r.severity]}</span>
              <span className="risk-type">{r.type}</span>
              <span className="risk-task mono">{r.task}</span>
            </div>
            <div className="risk-msg">{r.msg}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Tooltip, EditDrawer, RisksPanel });
