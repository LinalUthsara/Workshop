import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../components/Toasts.jsx';
import WorkshopForm from '../components/WorkshopForm.jsx';
import { useAutoRefresh } from '../hooks.js';
import { STATUS_LABEL, displayStatus, fmtLong, fmtStamp, fmtTime, parseLocal, plural } from '../format.js';

function RegisterForm({ workshop, onChanged }) {
  const toast = useToast();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const status = displayStatus(workshop);
  const blocked =
    status === 'FULL'
      ? 'This workshop is full. Cancel a registration to free a seat.'
      : status !== 'OPEN'
        ? `Registration is closed. This workshop is ${STATUS_LABEL[status].toLowerCase()}.`
        : '';

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const reg = await api.register(workshop.id, {
        attendeeName: name.trim(),
        attendeeEmail: email.trim(),
      });
      toast(`Registered ${reg.attendeeName}.`);
      setName('');
      setEmail('');
      nameRef.current?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      onChanged(); 
    }
  };

  return (
    <section className="panel" aria-labelledby="register-h">
      <h2 id="register-h">Register an attendee</h2>
      {blocked ? (
        <p className="alert alert-warn">{blocked}</p>
      ) : (
        <form onSubmit={submit} className="register-form">
          <label className="field">
            <span>Attendee name</span>
            <input ref={nameRef} required maxLength={120} autoComplete="off"
              value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Attendee email</span>
            <input type="email" required maxLength={190} autoComplete="off"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Registering…' : 'Register attendee'}
          </button>
        </form>
      )}
      {!blocked && error && <p className="alert alert-error" role="alert">{error}</p>}
    </section>
  );
}

const VIEWS = [
  ['ACTIVE', 'Active'],
  ['CANCELLED', 'Cancelled'],
  ['ALL', 'Full history'],
];

function Registrations({ regs, canCancel, onCancel }) {
  const [view, setView] = useState('ACTIVE');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => ({
    ACTIVE: regs.filter((r) => r.status === 'ACTIVE').length,
    CANCELLED: regs.filter((r) => r.status === 'CANCELLED').length,
    ALL: regs.length,
  }), [regs]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regs.filter((r) =>
      (view === 'ALL' || r.status === view) &&
      (!q || r.attendeeName.toLowerCase().includes(q) || r.attendeeEmail.toLowerCase().includes(q)));
  }, [regs, view, query]);

  return (
    <section className="panel" aria-labelledby="regs-h">
      <div className="panel-head">
        <h2 id="regs-h">Registrations</h2>
        <div className="seg" role="group" aria-label="Show registrations">
          {VIEWS.map(([key, label]) => (
            <button key={key} type="button" aria-pressed={view === key}
              className={`seg-btn${view === key ? ' on' : ''}`} onClick={() => setView(key)}>
              {label} <span className="seg-count">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="field field-search">
        <span className="sr-only">Search attendees</span>
        <input type="search" placeholder="Search by name or email" value={query}
          onChange={(e) => setQuery(e.target.value)} />
      </label>

      {shown.length === 0 ? (
        <p className="muted state">
          {regs.length === 0
            ? 'Nobody is registered yet.'
            : query
              ? 'No one matches that search.'
              : view === 'CANCELLED' ? 'No cancelled registrations.' : 'No active registrations.'}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table table-stack">
            <thead>
              <tr>
                <th scope="col">Attendee</th>
                <th scope="col">Status</th>
                <th scope="col">Registered</th>
                <th scope="col">Cancelled</th>
                {canCancel && <th scope="col"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={r.status === 'CANCELLED' ? 'row-cancelled' : ''}>
                  <td>
                    <span className="cell-main">{r.attendeeName}</span>
                    <span className="cell-sub">{r.attendeeEmail}</span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge badge-${r.status === 'ACTIVE' ? 'open' : 'cancelled'}`}>
                      {r.status === 'ACTIVE' ? 'Active' : 'Cancelled'}
                    </span>
                  </td>
                  <td data-label="Registered">
                    <span className="cell-main">{fmtStamp(r.registeredAt)}</span>
                    <span className="cell-sub">by {r.registeredByName}</span>
                  </td>
                  <td data-label="Cancelled" className={r.status === 'CANCELLED' ? '' : 'cell-none'}>
                    {r.status === 'CANCELLED' ? (
                      <>
                        <span className="cell-main">{fmtStamp(r.cancelledAt)}</span>
                        <span className="cell-sub">by {r.cancelledByName}</span>
                      </>
                    ) : (
                      <span className="muted" aria-label="Not cancelled">None</span>
                    )}
                  </td>
                  {canCancel && (
                    <td className="cell-actions">
                      {r.status === 'ACTIVE' && (
                        <button className="btn btn-danger-quiet btn-sm" onClick={() => onCancel(r)}>
                          Cancel registration
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function WorkshopDetail() {
  const { id } = useParams();
  const { can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [workshop, setWorkshop] = useState(null);
  const [regs, setRegs] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const loaded = useRef(false);

  const load = useCallback(async (silent = false) => {
    try {
      const [w, r] = await Promise.all([api.getWorkshop(id), api.listRegistrations(id)]);
      setWorkshop(w);
      setRegs(r);
      setError('');
      loaded.current = true;
    } catch (err) {
      if (!silent || !loaded.current) setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    loaded.current = false;
    setWorkshop(null);
    setRegs(null);
    setError('');
    load();
  }, [load]);
  useAutoRefresh(() => load(true), 15000);

  const back = (
    <Link to="/workshops" className="backlink">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M9 2 4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      All workshops
    </Link>
  );

  if (error && !workshop) {
    return (
      <>
        {back}
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button className="btn btn-quiet btn-sm" onClick={() => load()}>Try again</button>
        </div>
      </>
    );
  }
  if (!workshop || !regs) return <>{back}<p className="muted state">Loading workshop…</p></>;

  const when = parseLocal(workshop.dateTime);
  const status = displayStatus(workshop);
  const live = status === 'OPEN' || status === 'FULL';

  return (
    <>
      {back}

      <header className="detail-head">
        <div className="detail-title">
          <h1>{workshop.title}</h1>
          <StatusBadge status={status} />
        </div>
        {can.editWorkshops && (
          <div className="detail-actions">
            <button className="btn" onClick={() => setEditing(true)}>Edit workshop</button>
            <button className="btn btn-danger-quiet" onClick={() => setDeleting(true)}>Delete workshop</button>
          </div>
        )}
      </header>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="summary">
        <dl className="facts">
          <div><dt>When</dt><dd>{fmtLong(when)}, {fmtTime(when)}</dd></div>
          <div><dt>Instructor</dt><dd>{workshop.instructor}</dd></div>
          <div><dt>Where</dt><dd>{workshop.location}</dd></div>
          <div><dt>Code</dt><dd>{workshop.code}</dd></div>
        </dl>

        <div className="seatpanel">
          <SeatGrid capacity={workshop.capacity} taken={workshop.activeRegistrations} size="lg" />
          <p className="seatpanel-text">
            {live ? (
              <>
                <strong>{plural(workshop.availableSeats, 'seat')} free</strong>
                <span>{workshop.activeRegistrations} of {workshop.capacity} taken</span>
              </>
            ) : (
              <>
                <strong>{plural(workshop.activeRegistrations, 'registration')}</strong>
                <span>{workshop.capacity} seats in total</span>
              </>
            )}
          </p>
        </div>
      </div>

      {can.register && <RegisterForm workshop={workshop} onChanged={() => load(true)} />}

      <Registrations regs={regs} canCancel={can.register} onCancel={setCancelTarget} />

      <WorkshopForm
        open={editing}
        workshop={workshop}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setEditing(false);
          toast(`Saved changes to ${saved.title}.`);
          load(true);
        }}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this registration?"
        body={cancelTarget && `${cancelTarget.attendeeName} will lose their seat and it goes back to the pool. The record stays in the history with your name on it.`}
        confirmLabel="Cancel registration"
        keepLabel="Keep registration"
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          try {
            await api.cancelRegistration(cancelTarget.id);
            toast(`Cancelled ${cancelTarget.attendeeName}'s registration.`);
          } catch (err) {
            load(true); 
            throw err;
          }
          await load(true);
        }}
      />

      <ConfirmDialog
        open={deleting}
        title="Delete this workshop?"
        body={`${workshop.title} will be removed for good. This only works when nobody holds an active registration. To close a workshop that has attendees, edit it and set the status to Cancelled instead.`}
        confirmLabel="Delete workshop"
        keepLabel="Keep workshop"
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await api.deleteWorkshop(workshop.id);
          toast(`Deleted ${workshop.title}.`);
          navigate('/workshops', { replace: true });
        }}
      />
    </>
  );
}
