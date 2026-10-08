import { Link, useParams } from 'react-router-dom';
import { predictionService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, Progress } from '../components/Cards';
import { ActionTag, DemoBanner, RiskBadge, riskTone } from '../components/Badges';
import { AreaTrend } from '../components/Charts';
import { EmptyState, ErrorState, PageLoading } from '../components/States';
import { ACTION_LABEL, fmtDateTime, labels } from '../utils/format';
import { useToast } from '../components/Overlays';

const toneColor = { green: 'var(--green)', amber: 'var(--amber)', orange: 'var(--orange)', red: 'var(--red)' } as const;

export default function PredictionDetail() {
  const { id = '' } = useParams();
  const { data: p, loading, error, reload } = useAsync(() => predictionService.get(id), [id]);
  const toast = useToast();
  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!p) return <Card><EmptyState title="Prediction not found" message={`No prediction with id ${id}.`} action={<Link className="btn" to="/predictions">Back to predictions</Link>} /></Card>;

  const L = labels(24, 1);
  const mk = (arr: number[]) => arr.map((v, i) => ({ t: L[i], v }));
  const trends: { key: keyof typeof p.trends; title: string; color: string; unit: string }[] = [
    { key: 'cpu', title: 'CPU trend', color: '#2563eb', unit: '%' },
    { key: 'memory', title: 'Memory trend', color: '#7c3aed', unit: '%' },
    { key: 'latency', title: 'Latency trend', color: '#d97706', unit: 'ms' },
    { key: 'requests', title: 'Request trend', color: '#0891b2', unit: '/min' },
    { key: 'errors', title: 'Error trend', color: '#dc2626', unit: '%' },
  ];
  const maxW = Math.max(...p.contributions.map((c) => c.weight));

  return (
    <div className="stack">
      <PageHeader
        title={`Prediction ${p.id}`} subtitle={`${p.service} · ${fmtDateTime(p.timestamp)}`}
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Predictions', to: '/predictions' }, { label: p.id }]}
        actions={<button className="btn btn-primary" disabled={p.recommendedAction === 'NO_ACTION'} onClick={() => toast(`Action “${ACTION_LABEL[p.recommendedAction]}” queued (simulated – nothing executed)`)}>Apply recommended action</button>}
      />
      <DemoBanner />
      <div className="grid g-main">
        <div className="stack">
          <Card title="Prediction details">
            <div className="risk-hero" style={{ marginBottom: 16 }}>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Risk score</div>
                <div className="risk-num" style={{ color: toneColor[riskTone[p.riskLevel] as keyof typeof toneColor] }}>{p.riskScore}%</div>
              </div>
              <div className="risk-meta">
                <div><div className="k">Risk level</div><div className="val"><RiskBadge level={p.riskLevel} /></div></div>
                <div><div className="k">Confidence</div><div className="val">{p.confidence}%</div></div>
                <div><div className="k">Horizon</div><div className="val">{p.horizonMin} min</div></div>
              </div>
            </div>
            <dl className="kv">
              <dt>Affected service</dt><dd className="mono">{p.service}</dd>
              <dt>Predicted failure</dt><dd>{p.predictedFailure}</dd>
              <dt>Recommended action</dt><dd><ActionTag action={p.recommendedAction} /></dd>
              <dt>Status</dt><dd>{p.status}</dd>
            </dl>
          </Card>
          <Card title="Explanation" hint="Why the model produced this score">
            <p style={{ color: 'var(--text-2)' }}>{p.explanation}</p>
          </Card>
        </div>
        <Card title="Contributing signals" hint="Relative influence on the score">
          {p.contributions.map((c) => (
            <div className="signal" key={c.signal} style={{ gridTemplateColumns: '110px 1fr auto' }}>
              <span>{c.signal}</span>
              <Progress pct={(c.weight / maxW) * 100} tone="blue" />
              <span className="v" style={{ minWidth: 40 }}>{c.weight}%</span>
            </div>
          ))}
        </Card>
      </div>
      <div className="grid g-3">
        {trends.map((t) => (
          <Card key={t.key} title={t.title} hint="Last 24 minutes">
            <AreaTrend data={mk(p.trends[t.key])} color={t.color} unit={t.unit} height="sm" ariaLabel={`${t.title} chart`} />
          </Card>
        ))}
      </div>
    </div>
  );
}
