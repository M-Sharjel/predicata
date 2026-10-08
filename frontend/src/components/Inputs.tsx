import { useId, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, X, Calendar } from 'lucide-react';
import { Dropdown } from './Overlays';

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; label?: string;
}) {
  return (
    <div className="input-wrap">
      <Search size={16} aria-hidden />
      <input className="input" type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {value && (
        <button className="btn btn-ghost btn-icon btn-sm clear" aria-label="Clear search" onClick={() => onChange('')}><X size={14} /></button>
      )}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; className?: string;
}) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}

export function Field({ label, children, help }: { label: string; children: (id: string) => ReactNode; help?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {help && <span className="help">{help}</span>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, label = 'Sections' }: {
  tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label?: string;
}) {
  const move = (dir: number, i: number) => {
    const n = (i + dir + tabs.length) % tabs.length;
    onChange(tabs[n].id);
    requestAnimationFrame(() => document.getElementById(`tab-${tabs[n].id}`)?.focus());
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id} id={`tab-${t.id}`} role="tab" className="tab" aria-selected={value === t.id}
          tabIndex={value === t.id ? 0 : -1} onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); move(1, i); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1, i); }
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden />
    </span>
  );
}

export function SettingRow({ title, desc, children, inline = false }: { title: string; desc?: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className={`setting-row ${inline ? 'inline' : ''}`}>
      <div style={{ minWidth: 0 }}>
        <div className="s-title">{title}</div>
        {desc && <div className="s-desc">{desc}</div>}
      </div>
      <div className={`s-ctl ${inline ? 'auto' : ''}`}>{children}</div>
    </div>
  );
}

export function Pagination({ page, pages, total, pageSize, onPage }: {
  page: number; pages: number; total: number; pageSize: number; onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nums: number[] = [];
  for (let p = Math.max(1, page - 1); p <= Math.min(pages, page + 1); p++) nums.push(p);
  return (
    <nav className="pager" aria-label="Pagination">
      <span className="muted">Showing {from}–{to} of {total}</span>
      <div className="pages">
        <button className="btn btn-sm pg" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={15} /></button>
        {nums.map((n) => (
          <button key={n} className="btn btn-sm pg" aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)}>{n}</button>
        ))}
        <button className="btn btn-sm pg" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight size={15} /></button>
      </div>
    </nav>
  );
}

/** Lightweight date picker (single date) built on a month grid – no dependency. */
export function DatePicker({ value, onChange, label = 'Date' }: { value: string; onChange: (v: string) => void; label?: string }) {
  const base = value ? new Date(value) : new Date('2026-10-08');
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const offset = (view.getDay() + 6) % 7;
  const iso = (d: number) => `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return (
    <div className="field">
      <span className="label">{label}</span>
      <Dropdown
        align="left"
        trigger={({ toggle, open }) => (
          <button className="select" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }} onClick={toggle} aria-haspopup="dialog" aria-expanded={open}>
            <Calendar size={15} aria-hidden /> <span className="truncate">{value || 'Any date'}</span>
          </button>
        )}
      >
        {(close) => (
          <div className="date-pop" role="dialog" aria-label="Choose date">
            <div className="row between" style={{ marginBottom: 8 }}>
              <button className="btn btn-sm btn-ghost btn-icon" aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}><ChevronLeft size={15} /></button>
              <strong>{view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
              <button className="btn btn-sm btn-ghost btn-icon" aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}><ChevronRight size={15} /></button>
            </div>
            <div className="cal">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="dow">{d}</span>)}
              {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <button key={d} aria-pressed={value === iso(d)} onClick={() => { onChange(iso(d)); close(); }}>{d}</button>
              ))}
            </div>
            <button className="btn btn-sm btn-block" style={{ marginTop: 8 }} onClick={() => { onChange(''); close(); }}>Clear date</button>
          </div>
        )}
      </Dropdown>
    </div>
  );
}
