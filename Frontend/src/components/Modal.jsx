import { useEffect, useId, useRef } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal-${size}`}
      aria-labelledby={titleId}
      onClose={() => onClose()}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      {open && (
        <div className="modal-inner">
          <h2 id={titleId} className="modal-title">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
