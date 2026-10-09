export const parseLocal = (s) => (s ? new Date(String(s).slice(0, 19)) : null);

const pad = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const fmtWeekday = (d) => d.toLocaleDateString(undefined, { weekday: 'short' });
export const fmtMonth = (d) => d.toLocaleDateString(undefined, { month: 'short' });
export const fmtTime = (d) =>
  d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
export const fmtLong = (d) =>
  d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fmtStamp = (s) => {
  const d = parseLocal(s);
  return d
    ? d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '';
};

export const toInputDateTime = (s) => (s ? String(s).slice(0, 16) : '');
export const fromInputDateTime = (v) => (v && v.length === 16 ? `${v}:00` : v);

export const DATE_PRESETS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'week', label: 'Rest of this week' },
  { key: 'next7', label: 'Next 7 days' },
  { key: 'any', label: 'Any date' },
];

export function presetRange(key, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (key) {
    case 'upcoming':
      return { from: isoDate(today), to: '' };
    case 'week': {
      const daysSinceMonday = (today.getDay() + 6) % 7;
      return { from: isoDate(today), to: isoDate(addDays(today, 6 - daysSinceMonday)) };
    }
    case 'next7':
      return { from: isoDate(today), to: isoDate(addDays(today, 6)) };
    default:
      return { from: '', to: '' };
  }
}

export const displayStatus = (w) =>
  w.status === 'OPEN' && w.availableSeats <= 0 ? 'FULL' : w.status;

export const STATUS_LABEL = {
  OPEN: 'Open',
  FULL: 'Full',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
