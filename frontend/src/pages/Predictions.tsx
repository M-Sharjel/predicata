import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { predictionService } from '../services';
import { predictionServices } from '../data/mockPredictions';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader } from '../components/Cards';
import { ActionTag, Badge, DemoBanner, RiskBadge } from '../components/Badges';
import { DataTable } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/States';
import { SearchInput, SelectField } from '../components/Inputs';
import { useToast } from '../components/Overlays';
import { fmtDateTime, MOCK_NOW } from '../utils/format';

const rangeMin: Record<string, number> = { '1h': 60, '6h': 360, '24h': 1440, '7d': 10080, all: Infinity };

export default function Predictions() {
  const { data, loading, error, reload } = useAsync(predictionService.list);
  const nav = useNavigate();
  const toast = useToast();
  const [risk, setRisk] = useState('All');
  const [svc, setSvc] = useState('All');
  const [range, setRange] = useState('all');
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');

  const rows = useMemo(() => (data ?? []).filter((p) =>
    (risk === 'All' || p.riskLevel === risk) &&
    (svc === 'All' || p.service === svc) &&
    (status === 'All' || p.status === status) &&
    (MOCK_NOW.getTime() - new Date(p.timestamp).getTime()) / 60000 <= rangeMin[range] &&
    (q === '' || `${p.id} ${p.service} ${p.predictedFailure}`.toLowerCase().includes(q.toLowerCase())),
  ), [data, risk, svc, status, range, q]);

  const reset = () => { setRisk('All'); setSvc('All'); setRange('all'); setStatus('All'); setQ(''); };

  return (
    <div className="stack">
      <PageHeader
        title="Predictions" subtitle="AI prediction history and risk assessments"
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Predictions' }]}
        actions={<button className="btn" onClick={() => toast('Export started (simulated)')}><Download size={15} /> Export CSV</button>}
      />
      <DemoBanner>Predictions are generated mock data; no ML model is running yet.</DemoBanner>
      <Card pad={false}>
        <div className="filters">
          <div className="field grow"><span className="label">Search</span><SearchInput value={q} onChange={setQ} placeholder="ID, service, failure type" /></div>
          <SelectField label="Risk level" value={risk} onChange={setRisk} options={['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']} />
          <SelectField label="Service" value={svc} onChange={setSvc} options={['All', ...predictionServices]} />
          <SelectField label="Time range" value={range} onChange={setRange} options={[{ value: 'all', label: 'All time' }, { value: '1h', label: 'Last hour' }, { value: '6h', label: 'Last 6 hours' }, { value: '24h', label: 'Last 24 hours' }, { value: '7d', label: 'Last 7 days' }]} />
          <SelectField label="Status" value={status} onChange={setStatus} options={['All', 'Active', 'Acted', 'Expired', 'False Alarm']} />
          <button className="btn" onClick={reset}>Reset</button>
        </div>
        {loading ? <LoadingState rows={6} /> : error ? <ErrorState message={error} onRetry={reload} /> : (
          <DataTable
            ariaLabel="Prediction history" rowKey={(r) => r.id} rows={rows} onRowClick={(r) => nav(`/predictions/${r.id}`)}
            columns={[
              { key: 't', header: 'Timestamp', sort: (r) => r.timestamp, render: (r) => fmtDateTime(r.timestamp) },
              { key: 's', header: 'Service', sort: (r) => r.service, render: (r) => <span className="mono">{r.service}</span> },
              { key: 'sc', header: 'Risk score', sort: (r) => r.riskScore, render: (r) => <strong>{r.riskScore}%</strong> },
              { key: 'l', header: 'Level', render: (r) => <RiskBadge level={r.riskLevel} /> },
              { key: 'c', header: 'Confidence', sort: (r) => r.confidence, render: (r) => `${r.confidence}%` },
              { key: 'f', header: 'Predicted failure', render: (r) => r.predictedFailure },
              { key: 'a', header: 'Recommended action', render: (r) => <ActionTag action={r.recommendedAction} /> },
              { key: 'st', header: 'Status', render: (r) => <Badge tone={r.status === 'Active' ? 'blue' : r.status === 'Acted' ? 'green' : r.status === 'False Alarm' ? 'red' : 'gray'}>{r.status}</Badge> },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
