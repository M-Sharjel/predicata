import { useState } from 'react';
import { Download } from 'lucide-react';
import { metricsService } from '../services';
import { metricMeta, rangeConfig, summarise } from '../data/mockMetrics';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader } from '../components/Cards';
import { DemoBanner } from '../components/Badges';
import { AreaTrend } from '../components/Charts';
import { ErrorState, LoadingState } from '../components/States';
import { Segmented, Tabs } from '../components/Inputs';
import { useToast } from '../components/Overlays';
import type { MetricKey, TimeRange } from '../types';

const keys: MetricKey[] = ['cpu', 'memory', 'requests', 'latency', 'errors', 'pods', 'restarts'];
const fmt = (k: MetricKey, v: number) => {
  const m = metricMeta[k];
  const s = k === 'errors' ? v.toFixed(2) : k === 'requests' ? Math.round(v).toLocaleString() : Math.round(v * 10) / 10;
  return `${s}${m.unit && m.unit !== 'req/min' ? m.unit : ''}`;
};

function MetricCard({ k, range, onOpen }: { k: MetricKey; range: TimeRange; onOpen: () => void }) {
  const { data, loading, error, reload } = useAsync(() => metricsService.get(k, range), [k, range]);
  const m = metricMeta[k];
  const s = data ? summarise(data) : null;
  return (
    <Card
      title={m.label} hint={s ? `Current ${fmt(k, s.current)}${m.unit === 'req/min' ? ' req/min' : ''}` : undefined}
      actions={<button className="btn btn-sm" onClick={onOpen}>Details</button>}
    >
      {loading ? <LoadingState rows={3} /> : error || !data ? <ErrorState message={error ?? undefined} onRetry={reload} /> : (
        <>
          <AreaTrend data={data as unknown as Record<string, string | number>[]} color={m.color} height="sm" unit={m.unit === 'req/min' ? '' : m.unit} ariaLabel={`${m.label} over ${rangeConfig[range].label}`} />
          <div className="row between muted" style={{ fontSize: 12.5, marginTop: 6 }}>
            <span>Avg {fmt(k, s!.avg)}</span><span>Min {fmt(k, s!.min)}</span><span>Max {fmt(k, s!.max)}</span>
          </div>
        </>
      )}
    </Card>
  );
}

export default function Metrics() {
  const [range, setRange] = useState<TimeRange>('1h');
  const [focus, setFocus] = useState<MetricKey | 'overview'>('overview');
  const toast = useToast();
  const detail = useAsync(() => (focus === 'overview' ? Promise.resolve(null) : metricsService.get(focus, range)), [focus, range]);

  return (
    <div className="stack">
      <PageHeader
        title="Metrics & Reports" subtitle="Infrastructure and application metrics"
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Metrics & Reports' }]}
        actions={<>
          <Segmented<TimeRange> label="Time range" value={range} onChange={setRange} options={(Object.keys(rangeConfig) as TimeRange[]).map((r) => ({ id: r, label: rangeConfig[r].label.replace('Last ', '') }))} />
          <button className="btn" onClick={() => toast('Report export started (simulated)')}><Download size={15} /> Export report</button>
        </>}
      />
      <DemoBanner>Simulated time-series. Grafana will remain the infrastructure visualization layer in a later phase.</DemoBanner>
      <Tabs<MetricKey | 'overview'> label="Metric views" value={focus} onChange={setFocus} tabs={[{ id: 'overview', label: 'All metrics' }, ...keys.map((k) => ({ id: k, label: metricMeta[k].label.replace(' Utilization', '').replace(' Usage', '') }))]} />

      {focus === 'overview' ? (
        <div className="grid g-2">
          {keys.map((k) => <MetricCard key={k} k={k} range={range} onOpen={() => setFocus(k)} />)}
        </div>
      ) : (
        <Card title={metricMeta[focus].label} hint={rangeConfig[range].label}>
          {detail.loading ? <LoadingState rows={6} /> : detail.error || !detail.data ? <ErrorState message={detail.error ?? undefined} onRetry={detail.reload} /> : (() => {
            const s = summarise(detail.data);
            return (
              <>
                <div className="grid g-4 keep2" style={{ marginBottom: 16 }}>
                  {([['Current', s.current], ['Average', s.avg], ['Minimum', s.min], ['Maximum', s.max]] as const).map(([l, v]) => (
                    <div key={l} className="card card-pad" style={{ boxShadow: 'none', background: 'var(--surface-2)' }}>
                      <div className="muted" style={{ fontSize: 12 }}>{l}</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(focus, v)}</div>
                    </div>
                  ))}
                </div>
                <AreaTrend data={detail.data as unknown as Record<string, string | number>[]} color={metricMeta[focus].color} height="lg" ariaLabel={`${metricMeta[focus].label} detail chart`} unit={metricMeta[focus].unit === 'req/min' ? '' : metricMeta[focus].unit} />
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
