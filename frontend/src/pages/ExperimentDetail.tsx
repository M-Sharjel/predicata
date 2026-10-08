import { Link, useParams } from 'react-router-dom';
import { experimentService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, Timeline } from '../components/Cards';
import { Badge, DemoBanner } from '../components/Badges';
import { CompareBars, MultiLine } from '../components/Charts';
import { EmptyState, ErrorState, PageLoading } from '../components/States';
import { CompareCards } from './experimentParts';
import { fmtDate, fmtSeconds } from '../utils/format';

export default function ExperimentDetail() {
  const { id = '' } = useParams();
  const { data: e, loading, error, reload } = useAsync(() => experimentService.get(id), [id]);
  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!e) return <Card><EmptyState title="Experiment not found" message={`No experiment with id ${id}.`} action={<Link className="btn" to="/experiments">Back to experiments</Link>} /></Card>;

  const has = e.status === 'Completed';
  const b = e.baseline, p = e.predicta;
  const bars = [
    { t: 'Downtime (s)', baseline: b.downtimeSec, predicta: p.downtimeSec },
    { t: 'Recovery (s)', baseline: b.recoverySec, predicta: p.recoverySec },
    { t: 'Actions', baseline: b.recoveryActions, predicta: p.recoveryActions },
  ];

  return (
    <div className="stack">
      <PageHeader
        title={e.name} subtitle={<span className="row" style={{ gap: 8 }}><span className="mono">{e.id}</span><Badge tone={has ? 'green' : e.status === 'Running' ? 'blue' : 'gray'}>{e.status}</Badge></span>}
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Experiments', to: '/experiments' }, { label: e.id }]}
      />
      <DemoBanner>Mock / demo results – not real experimental evidence.</DemoBanner>

      <Card title="Scenario">
        <dl className="kv">
          <dt>Scenario</dt><dd>{e.scenario}</dd>
          <dt>Traffic level</dt><dd>{e.trafficLevel}</dd>
          <dt>Duration</dt><dd>{e.durationMin} minutes</dd>
          <dt>Date</dt><dd>{fmtDate(e.date)}</dd>
          <dt>Result</dt><dd>{e.result}</dd>
        </dl>
      </Card>

      {!has ? (
        <Card><EmptyState title={e.status === 'Running' ? 'Experiment running' : 'Experiment scheduled'} message={e.conclusion} /></Card>
      ) : (
        <>
          <Card title="Improvement metrics" hint="PREDICTA relative to baseline (mock)">
            <CompareCards items={[
              { label: 'Downtime', unit: 's', b: b.downtimeSec, p: p.downtimeSec, lowerBetter: true },
              { label: 'Failed requests', unit: '', b: b.failedRequests, p: p.failedRequests, lowerBetter: true },
              { label: 'Average latency', unit: 'ms', b: b.avgLatencyMs, p: p.avgLatencyMs, lowerBetter: true },
              { label: 'Peak latency', unit: 'ms', b: b.peakLatencyMs, p: p.peakLatencyMs, lowerBetter: true },
              { label: 'Recovery time', unit: 's', b: b.recoverySec, p: p.recoverySec, lowerBetter: true },
              { label: 'Avg CPU', unit: '%', b: b.avgCpu, p: p.avgCpu, lowerBetter: true },
            ]} />
          </Card>

          <div className="grid g-2">
            <Card title="Baseline results" hint="Kubernetes HPA (CPU target 70%)">
              <dl className="kv">
                <dt>Downtime</dt><dd>{fmtSeconds(b.downtimeSec)}</dd>
                <dt>Failed requests</dt><dd>{b.failedRequests}</dd>
                <dt>Avg / peak latency</dt><dd>{b.avgLatencyMs} / {b.peakLatencyMs} ms</dd>
                <dt>Recovery time</dt><dd>{fmtSeconds(b.recoverySec)}</dd>
                <dt>Recovery actions</dt><dd>{b.successfulRecoveries} / {b.recoveryActions} successful</dd>
                <dt>Avg CPU / memory</dt><dd>{b.avgCpu}% / {b.avgMemory}%</dd>
              </dl>
            </Card>
            <Card title="PREDICTA results" hint="Predictive ML + recovery engine">
              <dl className="kv">
                <dt>Downtime</dt><dd>{fmtSeconds(p.downtimeSec)}</dd>
                <dt>Failed requests</dt><dd>{p.failedRequests}</dd>
                <dt>Avg / peak latency</dt><dd>{p.avgLatencyMs} / {p.peakLatencyMs} ms</dd>
                <dt>Recovery time</dt><dd>{fmtSeconds(p.recoverySec)}</dd>
                <dt>Recovery actions</dt><dd>{p.successfulRecoveries} / {p.recoveryActions} successful</dd>
                <dt>Avg CPU / memory</dt><dd>{p.avgCpu}% / {p.avgMemory}%</dd>
              </dl>
            </Card>
          </div>

          <div className="grid g-2">
            <Card title="Response latency over time" hint="ms · mock series">
              <MultiLine data={e.series} ariaLabel="Latency over time: baseline vs PREDICTA" series={[{ key: 'baseline', name: 'Baseline', color: '#f59e0b' }, { key: 'predicta', name: 'PREDICTA', color: '#2563eb' }]} />
            </Card>
            <Card title="Outcome comparison" hint="Lower is better">
              <CompareBars data={bars} ariaLabel="Outcome comparison bar chart" series={[{ key: 'baseline', name: 'Baseline', color: '#f59e0b' }, { key: 'predicta', name: 'PREDICTA', color: '#2563eb' }]} />
            </Card>
          </div>

          <div className="grid g-main-rev">
            <Card title="Timeline"><Timeline events={e.timeline} /></Card>
            <Card title="Conclusion">
              <p style={{ color: 'var(--text-2)' }}>{e.conclusion}</p>
              <p className="help" style={{ marginTop: 10 }}>Placeholder text for the GUI prototype. Conclusions must be re-written once real experiments are run.</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
