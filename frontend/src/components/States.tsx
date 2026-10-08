import type { ReactNode } from 'react';
import { AlertOctagon, Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing to show', message, action }: { title?: string; message?: string; action?: ReactNode }) {
  return (
    <div className="state">
      <span className="ico tone-gray"><Inbox size={22} aria-hidden /></span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <span className="ico tone-red"><AlertOctagon size={22} aria-hidden /></span>
      <h3>Something went wrong</h3>
      <p>{message ?? 'The data could not be loaded.'}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Skeleton({ h = 16, w = '100%' }: { h?: number; w?: number | string }) {
  return <div className="skeleton" style={{ height: h, width: w }} aria-hidden />;
}

export function LoadingState({ rows = 4, label = 'Loading…' }: { rows?: number; label?: string }) {
  return (
    <div className="stack" role="status" aria-busy="true" aria-label={label} style={{ padding: 18 }}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={i === 0 ? 24 : 16} w={i === 0 ? '40%' : `${95 - i * 8}%`} />)}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="stack" role="status" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <Skeleton h={30} w="260px" />
      <div className="grid g-4">{[0, 1, 2, 3].map((i) => <div key={i} className="card"><LoadingState rows={3} /></div>)}</div>
      <div className="card"><LoadingState rows={6} /></div>
    </div>
  );
}
