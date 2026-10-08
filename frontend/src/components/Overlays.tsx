import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react';

/** Traps Tab inside a container, closes on Escape, restores focus on unmount. */
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((n) => !n.hasAttribute('disabled'));
    (focusables()[0] ?? el)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

export function Modal({ title, onClose, children, footer, wide = false }: {
  title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  const ref = useDialog(onClose);
  return createPortal(
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon btn-sm" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useDialog(onClose);
  return createPortal(
    <>
      <div className="drawer-scrim" style={{ zIndex: 85 }} onClick={onClose} />
      <aside className="side-drawer" role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        <div className="modal-head" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon btn-sm" aria-label="Close panel" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ flex: 1 }}>{children}</div>
      </aside>
    </>,
    document.body,
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: {
  title: string; message: ReactNode; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal
      title={title} onClose={onCancel}
      footer={<>
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </>}
    >
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <AlertTriangle size={20} style={{ color: 'var(--amber)', flex: 'none', marginTop: 2 }} aria-hidden />
        <div>{message}</div>
      </div>
    </Modal>
  );
}

/** Generic dropdown: closes on outside click and Escape. */
export function Dropdown({ trigger, children, align = 'right' }: {
  trigger: (s: { toggle: () => void; open: boolean }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div className="menu" ref={ref} style={{ display: 'block' }}>
      {trigger({ toggle: () => setOpen((o) => !o), open })}
      {open && <div className={`menu-list ${align === 'left' ? 'left' : ''}`}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

// ---- Toasts ----
interface ToastItem { id: number; kind: 'success' | 'error' | 'info'; text: string }
const ToastCtx = createContext<(text: string, kind?: ToastItem['kind']) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, kind: ToastItem['kind'] = 'success') => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.kind === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
