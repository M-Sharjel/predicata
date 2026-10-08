import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { recoveryService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { BeforeAfter, Card, PageHeader, Timeline } from '../components/Cards';
import { ActionTag, DemoBanner, RiskBadge, StatusBadge } from '../components/Badges';
import { EmptyState, ErrorState, PageLoading } from '../components/States';
import { ConfirmDialog, useToast } from '../components/Overlays';
import { ACTION_LABEL, fmtDateTime, fmtSeconds } from '../utils/format';

export default function RecoveryDetail() {
  const { id = '' } = useParams();
  const { data: r, loading, error, reload } = useAsync(() => recoveryService.get(id), [id]);
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!r) return <Card><EmptyState title="Recovery action not found" message={`No action with id ${id}.`} action={<Link className="btn" to="/recovery">Back to recovery actions</Link>} /></Card>;

  const canRetry = r.result === 'Failed' || r.result === 'Pending';
  return (
    <div className="stack">
      <PageHeader
        title={`Recovery ${r.id}`} subtitle={<span className="row" style={{ gap: 8 }}><ActionTag action={r.action} /><StatusBadge status={r.result} /></span>}
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Recovery Actions', to: '/recovery' }, { label: r.id }]}
        actions={canRetry ? <button className="btn btn-primary" onClick={() => setConfirm(true)}>{r.result === 'Pending' ? 'Approve & run (simulated)' : 'Retry (simulated)'}</button> : undefined}
      />
      <DemoBanner>Simulated action. No Kubernetes command was or will be executed.</DemoBanner>
      <div className="grid g-main-rev">
        <Card title="Action details">
          <dl className="kv">
            <dt>Action ID</dt><dd className="mono">{r.id}</dd>
            <dt>Action type</dt><dd><ActionTag action={r.action} /></dd>
            <dt>Target service</dt><dd className="mono">{r.service}</dd>
            <dt>Trigger reason</dt><dd>{r.reason}</dd>
            <dt>Prediction</dt><dd><Link className="mono" to={`/predictions/${r.predictionId}`}>{r.predictionId}</Link> · {r.risk}% <RiskBadge level={r.riskLevel} /></dd>
            <dt>Started</dt><dd>{fmtDateTime(r.startedAt)}</dd>
            <dt>Duration</dt><dd>{r.durationSec ? fmtSeconds(r.durationSec) : '—'}</dd>
            <dt>Retries</dt><dd>{r.retries}</dd>
            <dt>Result</dt><dd><StatusBadge status={r.result} /></dd>
          </dl>
        </Card>
        <Card title="Verification" hint="Post-recovery health checks">
          <div className="list">
            {r.verification.map((v) => (
              <div key={v.check} className="list-item" style={{ padding: '10px 0' }}>
                {v.passed ? <CheckCircle2 size={18} style={{ color: 'var(--green)', flex: 'none' }} aria-label="passed" /> : <XCircle size={18} style={{ color: 'var(--red)', flex: 'none' }} aria-label="failed" />}
                <div className="body"><div className="t1">{v.check}</div><div className="t2">{v.detail}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid g-main-rev">
        <Card title="Before vs after" hint="Before state → action executed → after state"><BeforeAfter before={r.before} after={r.after} /></Card>
        <Card title="Timeline"><Timeline events={r.timeline} /></Card>
      </div>
      {confirm && (
        <ConfirmDialog
          title="Run recovery action?" confirmLabel="Run (simulated)"
          message={<>This will <strong>simulate</strong> “{ACTION_LABEL[r.action]}” on <span className="mono">{r.service}</span>. No real infrastructure is changed.</>}
          onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); toast('Simulated action queued'); }}
        />
      )}
    </div>
  );
}
