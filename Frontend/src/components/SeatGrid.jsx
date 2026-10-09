export default function SeatGrid({ capacity, taken, size = 'sm' }) {
  const filled = Math.max(0, Math.min(taken, capacity));
  const label = `${taken} of ${capacity} seats taken`;

  if (capacity > 60) {
    return (
      <span role="img" aria-label={label} className={`seatbar seatbar-${size}`}>
        <span style={{ width: `${(filled / capacity) * 100}%` }} />
      </span>
    );
  }

  const rows = Math.max(1, Math.ceil(capacity / 10));
  const cols = Math.ceil(capacity / rows);

  return (
    <span
      role="img"
      aria-label={label}
      className={`seats seats-${size}`}
      style={{ gridTemplateColumns: `repeat(${cols}, var(--seat))` }}
    >
      {Array.from({ length: capacity }, (_, i) => (
        <i key={i} className={i < filled ? 'seat taken' : 'seat'} />
      ))}
    </span>
  );
}
