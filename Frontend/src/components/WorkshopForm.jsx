import { useState } from 'react';
import { api } from '../api.js';
import { fromInputDateTime, parseLocal, toInputDateTime } from '../format.js';
import Modal from './Modal.jsx';

const STATUSES = [
  ['OPEN', 'Open'],
  ['FULL', 'Full'],
  ['CANCELLED', 'Cancelled'],
  ['COMPLETED', 'Completed'],
];

function Body({ workshop, onClose, onSaved }) {
  const editing = Boolean(workshop);
  const taken = workshop?.activeRegistrations ?? 0;

  const [form, setForm] = useState({
    code: workshop?.code ?? '',
    title: workshop?.title ?? '',
    instructor: workshop?.instructor ?? '',
    dateTime: toInputDateTime(workshop?.dateTime),
    capacity: workshop?.capacity ?? 12,
    status: workshop?.status ?? 'OPEN',
    location: workshop?.location ?? 'Main Centre',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)
      return 'Capacity must be a whole number between 1 and 10,000.';
    if (editing && capacity < taken)
      return `Capacity can't be lower than the ${taken} seats already taken. Cancel registrations first.`;
    const when = parseLocal(form.dateTime);
    if (!when || Number.isNaN(when.getTime())) return 'Choose a date and time.';
    if (when <= new Date()) return 'The date and time must be in the future.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setError(problem); return; }
    setBusy(true);
    setError('');
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      instructor: form.instructor.trim(),
      dateTime: fromInputDateTime(form.dateTime),
      capacity: Number(form.capacity),
      status: form.status,
      location: form.location.trim(),
    };
    try {
      const saved = editing
        ? await api.updateWorkshop(workshop.id, payload)
        : await api.createWorkshop(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="stack">
      <div className="form-grid">
        <label className="field">
          <span>Workshop code</span>
          <input required maxLength={30} value={form.code} onChange={set('code')} placeholder="WS-POT-002" />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={form.status} onChange={set('status')}>
            {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <small>People can only be registered while the status is Open.</small>
        </label>
        <label className="field span-2">
          <span>Title</span>
          <input required maxLength={150} value={form.title} onChange={set('title')} />
        </label>
        <label className="field">
          <span>Instructor</span>
          <input required maxLength={120} value={form.instructor} onChange={set('instructor')} />
        </label>
        <label className="field">
          <span>Location</span>
          <input required maxLength={100} value={form.location} onChange={set('location')} />
        </label>
        <label className="field">
          <span>Date and time</span>
          <input type="datetime-local" required value={form.dateTime} onChange={set('dateTime')} />
        </label>
        <label className="field">
          <span>Seats</span>
          <input
            type="number" required min={Math.max(1, taken)} max={10000} step={1}
            value={form.capacity} onChange={set('capacity')}
          />
          {editing && taken > 0 && <small>{taken} already taken.</small>}
        </label>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="btn btn-quiet" onClick={onClose} disabled={busy}>Discard</button>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add workshop'}
        </button>
      </div>
    </form>
  );
}

export default function WorkshopForm({ open, workshop, onClose, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title={workshop ? 'Edit workshop' : 'Add a workshop'}>
      <Body workshop={workshop} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}
