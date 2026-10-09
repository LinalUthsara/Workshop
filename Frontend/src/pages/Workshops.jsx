import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import WorkshopForm from '../components/WorkshopForm.jsx';
import { useToast } from '../components/Toasts.jsx';
import { useAutoRefresh } from '../hooks.js';
import {
  DATE_PRESETS, displayStatus, fmtMonth, fmtTime, fmtWeekday, parseLocal, plural, presetRange,
} from '../format.js';

const STATUS_OPTIONS = [
  ['', 'Any status'],
  ['OPEN', 'Open'],
  ['FULL', 'Full'],
  ['CANCELLED', 'Cancelled'],
  ['COMPLETED', 'Completed'],
];

const initialFilters = () => ({ ...presetRange('upcoming'), status: '', seats: false });

function WorkshopRow({ w }) {
  const when = parseLocal(w.dateTime);
  const status = displayStatus(w);
  const live = status === 'OPEN' || status === 'FULL';

  return (
    <li>
      <Link to={`/workshops/${w.id}`} className={`ws-row${live ? '' : ' ws-row-muted'}`}>
        <span className="ws-date" aria-hidden="true">
          <span className="ws-wd">{fmtWeekday(when)}</span>
          <span className="ws-day">{when.getDate()}</span>
          <span className="ws-mon">{fmtMonth(when)}</span>
        </span>
        <span className="ws-main">
          <span className="ws-title">{w.title}</span>
          <span className="ws-sub">
            {fmtTime(when)} with {w.instructor} at {w.location}
          </span>
          <span className="ws-code">{w.code}</span>
        </span>
        <span className="ws-seats">
          <SeatGrid capacity={w.capacity} taken={w.activeRegistrations} />
          <span className="ws-seatcount">
            {live ? (
              <><strong>{w.availableSeats}</strong> free of {w.capacity}</>
            ) : (
              <>{w.activeRegistrations} registered</>
            )}
          </span>
        </span>
        <span className="ws-status"><StatusBadge status={status} /></span>
      </Link>
    </li>
  );
}

export default function Workshops() {
  const { can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const latest = useRef(0);

  const load = useCallback(async (silent = false) => {
    const ticket = ++latest.current;
    if (!silent) setBusy(true);
    try {
      const data = await api.listWorkshops({
        startDate: filters.from ? `${filters.from}T00:00:00` : undefined,
        endDate: filters.to ? `${filters.to}T23:59:59` : undefined,
        status: filters.status && filters.status !== 'FULL' ? filters.status : undefined,
        availableSeats: filters.seats && filters.status !== 'FULL' ? 'true' : undefined,
      });
      if (ticket !== latest.current) return; 
      setRows(data);
      setError('');
      setBusy(false);
    } catch (err) {
      if (ticket !== latest.current) return;
      setBusy(false);
      if (!silent) setError(err.message);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(() => load(true), 20000);

  const visible = useMemo(() => {
    if (!rows) return [];
    const list = filters.status === 'FULL' ? rows.filter((w) => displayStatus(w) === 'FULL') : rows;
    return [...list].sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)));
  }, [rows, filters.status]);

  const freeSeats = visible.reduce((sum, w) => (w.status === 'OPEN' ? sum + w.availableSeats : sum), 0);

  const activePreset = DATE_PRESETS.find((p) => {
    const r = presetRange(p.key);
    return r.from === filters.from && r.to === filters.to;
  })?.key;

  const filtersChanged =
    JSON.stringify(filters) !== JSON.stringify(initialFilters());

  const patch = (changes) => setFilters((f) => ({ ...f, ...changes }));

  return (
    <>
      <div className="page-head">
        <h1>Workshops</h1>
        {can.editWorkshops && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>Add workshop</button>
        )}
      </div>

      <section className="filters" aria-label="Find workshops">
        <div className="seg" role="group" aria-label="Date range">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key} type="button"
              className={`seg-btn${activePreset === p.key ? ' on' : ''}`}
              aria-pressed={activePreset === p.key}
              onClick={() => patch(presetRange(p.key))}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="filters-row">
          <label className="field field-sm">
            <span>From</span>
            <input type="date" value={filters.from} max={filters.to || undefined}
              onChange={(e) => patch({ from: e.target.value })} />
          </label>
          <label className="field field-sm">
            <span>To</span>
            <input type="date" value={filters.to} min={filters.from || undefined}
              onChange={(e) => patch({ to: e.target.value })} />
          </label>
          <label className="field field-sm">
            <span>Status</span>
            <select value={filters.status}
              onChange={(e) => patch({ status: e.target.value, seats: e.target.value === 'FULL' ? false : filters.seats })}>
              {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className={`check${filters.status === 'FULL' ? ' check-off' : ''}`}>
            <input type="checkbox" checked={filters.seats} disabled={filters.status === 'FULL'}
              onChange={(e) => patch({ seats: e.target.checked })} />
            <span>Has free seats</span>
          </label>
          {filtersChanged && (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setFilters(initialFilters())}>
              Reset filters
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button className="btn btn-quiet btn-sm" onClick={() => { setError(''); load(); }}>Try again</button>
        </div>
      )}

      {rows === null && !error && <p className="muted state">Loading workshops…</p>}

      {rows !== null && (
        <>
          <p className="result-count" aria-live="polite">
            {visible.length === 0
              ? 'No workshops found'
              : `${plural(visible.length, 'workshop')}, ${plural(freeSeats, 'seat')} free`}
          </p>

          {visible.length === 0 ? (
            <div className="empty">
              <p>Nothing matches these filters.</p>
              <p className="muted">Widen the dates, or clear the seats and status filters.</p>
              <button className="btn" onClick={() => setFilters({ ...initialFilters(), ...presetRange('any') })}>
                Show every workshop
              </button>
            </div>
          ) : (
            <ul className={`ws-list${busy ? ' is-busy' : ''}`} aria-busy={busy}>
              {visible.map((w) => <WorkshopRow key={w.id} w={w} />)}
            </ul>
          )}
        </>
      )}

      <WorkshopForm
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(saved) => {
          setAdding(false);
          toast(`Added ${saved.title}.`);
          navigate(`/workshops/${saved.id}`);
        }}
      />
    </>
  );
}
