import { useState } from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open, title, body, confirmLabel, keepLabel = 'Keep it', danger = true, onConfirm, onClose,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setError(''); onClose(); };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      setError('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      <p className="modal-copy">{body}</p>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="btn btn-quiet" onClick={handleClose} disabled={busy}>
          {keepLabel}
        </button>
        <button
          type="button"
          className={danger ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={confirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
