import { Link, useParams } from 'react-router-dom';
import { incidentService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { BeforeAfter, Card, PageHeader, Timeline } from '../components/Cards';
import { ActionTag, Badge, DemoBanner, RiskBadge, StatusBadge } from '../components/Badges';
import { EmptyState, ErrorState, PageLoading } from '../components/States';
import { fmtDateTime, fmtDuration } from '../utils/format';

export default function IncidentDetail() {
  const { id = '' } = useParams();
  const { data: i, loading, error, reload } = useAsync(() => incidentService.get(id), [id]);
  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!i) return <Card><EmptyState title="Incident not found" message={`No incident with id ${id}.`} action={<Link className="btn" to="/incidents">Back to incidents</Link>} /></Card>;

  return (
    <div className="stack">
      <PageHeader
        title={`${i.id} · ${i.title}`} subtitle={<span className="row" style={{ gap: 8 }}><RiskBadge level={i.severity} /><StatusBadge status={i.status} /></span>}
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Incidents', to: '/incidents' }, { label: i.id }]}
        actions={<><Link className="btn" to={`/predictions/${i.predictionId}`}>View prediction</Link><Link className="btn btn-primary" to={`/recovery/${i.recoveryId}`}>View recovery</Link></>}
      />
      <DemoBanner />
      <div className="grid g-main-rev">
        <Card title="Incident overview">
          <dl className="kv">
            <dt>Service</dt><dd className="mono">{i.service}</dd>
            <dt>Detected</dt><dd>{fmtDateTime(i.detectedAt)}</dd>
            <dt>Duration</dt><dd>{fmtDuration(i.durationMin)}</dd>
            <dt>Prediction</dt><dd><Link to={`/predictions/${i.predictionId}`} className="mono">{i.predictionId}</Link></dd>
            <dt>Recovery action</dt><dd><ActionTag action={i.action} /> <Link to={`/recovery/${i.recoveryId}`} className="mono">{i.recoveryId}</Link></dd>
            <dt>Recovery result</dt><dd>{i.result}</dd>
          </dl>
        </Card>
        <Card title="Detected signals">
          <div className="pill-row">{i.signals.map((s) => <Badge key={s} tone="amber" dot={false}>{s}</Badge>)}</div>
        </Card>
      </div>
      <div className="grid g-main-rev">
        <Card title="Before / after metrics" hint="Around the recovery action"><BeforeAfter before={i.before} after={i.after} /></Card>
        <Card title="Timeline"><Timeline events={i.timeline} /></Card>
      </div>
    </div>
  );
}
