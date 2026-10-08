import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, BrainCircuit, CheckCheck, CheckCircle2, FlaskConical, Info, Server, Wrench } from 'lucide-react';
import { notificationService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader } from '../components/Cards';
import { DemoBanner } from '../components/Badges';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { Segmented } from '../components/Inputs';
import { useToast } from '../components/Overlays';
import { fmtDateTime } from '../utils/format';
import type { AppNotification } from '../types';

const kindIcon = { prediction: BrainCircuit, recovery: Wrench, cluster: Server, experiment: FlaskConical, system: Info } as const;
const sevIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle, critical: AlertOctagon } as const;
const sevTone = { info: 'blue', success: 'green', warning: 'amber', critical: 'red' } as const;

export default function Notifications() {
  const { data, loading, error, reload } = useAsync(notificationService.list);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [read, setRead] = useState<'all' | 'unread'>('all');
  const [sev, setSev] = useState<'all' | AppNotification['severity']>('all');
  const nav = useNavigate();
  const toast = useToast();
  useEffect(() => { if (data) setItems(data); }, [data]);

  const shown = items.filter((n) => (read === 'all' || !n.read) && (sev === 'all' || n.severity === sev));
  const unread = items.filter((n) => !n.read).length;
  const mark = (id: string, v = true) => setItems((x) => x.map((n) => (n.id === id ? { ...n, read: v } : n)));

  return (
    <div className="stack">
      <PageHeader
        title="Notifications" subtitle={`${unread} unread`}
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Notifications' }]}
        actions={<button className="btn" disabled={unread === 0} onClick={() => { setItems((x) => x.map((n) => ({ ...n, read: true }))); toast('All notifications marked as read'); }}><CheckCheck size={15} /> Mark all as read</button>}
      />
      <DemoBanner />
      <div className="row between">
        <Segmented value={read} onChange={setRead} label="Read state" options={[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread' }]} />
        <Segmented value={sev} onChange={setSev} label="Severity" options={[{ id: 'all', label: 'Any' }, { id: 'critical', label: 'Critical' }, { id: 'warning', label: 'Warning' }, { id: 'success', label: 'Success' }, { id: 'info', label: 'Info' }]} />
      </div>
      <Card pad={false}>
        {loading ? <LoadingState rows={5} /> : error ? <ErrorState message={error} onRetry={reload} /> : shown.length === 0 ? (
          <EmptyState title="You’re all caught up" message="No notifications match the current filter." />
        ) : (
          <div className="list">
            {shown.map((n) => {
              const Kind = kindIcon[n.kind]; const Sev = sevIcon[n.severity];
              return (
                <div key={n.id} className={`list-item ${n.read ? '' : 'unread'}`}>
                  <span className={`kpi-icon tone-${sevTone[n.severity]}`}><Kind size={16} aria-hidden /></span>
                  <div className="body">
                    <div className="row" style={{ gap: 6 }}>
                      <span className="t1">{n.title}</span>
                      {!n.read && <span className="badge b-blue" style={{ padding: '0 8px' }}>New</span>}
                      <span className={`badge b-${sevTone[n.severity]}`} style={{ padding: '0 8px' }}><Sev size={11} aria-hidden /> {n.severity}</span>
                    </div>
                    <div className="t2">{n.body}</div>
                    <div className="row" style={{ marginTop: 6, gap: 6 }}>
                      <span className="muted" style={{ fontSize: 12 }}>{fmtDateTime(n.time)}</span>
                      {n.link && <button className="btn btn-sm" onClick={() => { mark(n.id); nav(n.link!); }}>View</button>}
                      <button className="btn btn-sm btn-ghost" onClick={() => mark(n.id, !n.read)}>{n.read ? 'Mark unread' : 'Mark read'}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
