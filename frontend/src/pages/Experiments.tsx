import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { experimentService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader } from '../components/Cards';
import { Badge, DemoBanner } from '../components/Badges';
import { DataTable } from '../components/DataTable';
import { ErrorState, PageLoading } from '../components/States';
import { SelectField } from '../components/Inputs';
import { Modal, useToast } from '../components/Overlays';
import { CompareCards } from './experimentParts';
import { fmtDate } from '../utils/format';

const resultTone = { 'Predicta better': 'green', 'Baseline better': 'amber', Inconclusive: 'gray', '—': 'gray' } as const;
const statusTone = { Completed: 'green', Running: 'blue', Scheduled: 'gray' } as const;

export default function Experiments() {
  const { data, loading, error, reload } = useAsync(experimentService.list);
  const nav = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);

  const done = useMemo(() => (data ?? []).filter((e) => e.status === 'Completed'), [data]);
  const rows = useMemo(() => (data ?? []).filter((e) => status === 'All' || e.status === status), [data, status]);
  if (loading) return <PageLoading />;
  if (error || !data) return <ErrorState message={error ?? undefined} onRetry={reload} />;

  const avg = (side: 'baseline' | 'predicta', key: 'downtimeSec' | 'failedRequests' | 'avgLatencyMs' | 'recoverySec') =>
    Math.round(done.reduce((a, e) => a + e[side][key], 0) / Math.max(1, done.length));
  const rate = (side: 'baseline' | 'predicta') => {
    const t = done.reduce((a, e) => a + e[side].recoveryActions, 0);
    const s = done.reduce((a, e) => a + e[side].successfulRecoveries, 0);
    return t ? Math.round((s / t) * 100) : 0;
  };

  return (
    <div className="stack">
      <PageHeader
        title="Experiments" subtitle="Baseline Kubernetes autoscaling vs PREDICTA predictive recovery"
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Experiments' }]}
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New experiment</button>}
      />
      <DemoBanner>Mock / demo results – illustrative placeholders, not real experimental evidence. Replace with measured data before drawing conclusions.</DemoBanner>

      <Card title="Experiment overview" hint={`Average across ${done.length} completed mock experiments`}>
        <CompareCards
          items={[
            { label: 'Downtime', unit: 's', b: avg('baseline', 'downtimeSec'), p: avg('predicta', 'downtimeSec'), lowerBetter: true },
            { label: 'Failed requests', unit: '', b: avg('baseline', 'failedRequests'), p: avg('predicta', 'failedRequests'), lowerBetter: true },
            { label: 'Average latency', unit: 'ms', b: avg('baseline', 'avgLatencyMs'), p: avg('predicta', 'avgLatencyMs'), lowerBetter: true },
            { label: 'Recovery time', unit: 's', b: avg('baseline', 'recoverySec'), p: avg('predicta', 'recoverySec'), lowerBetter: true },
            { label: 'Successful recovery', unit: '%', b: rate('baseline'), p: rate('predicta'), lowerBetter: false },
          ]}
        />
      </Card>

      <Card pad={false} title="Experiment list">
        <div className="filters">
          <SelectField label="Status" value={status} onChange={setStatus} options={['All', 'Completed', 'Running', 'Scheduled']} />
        </div>
        <DataTable
          ariaLabel="Experiments" rowKey={(r) => r.id} rows={rows} onRowClick={(r) => nav(`/experiments/${r.id}`)}
          columns={[
            { key: 'n', header: 'Experiment', sort: (r) => r.name, render: (r) => <span><strong>{r.name}</strong> <span className="mono muted">{r.id}</span></span> },
            { key: 'd', header: 'Date', sort: (r) => r.date, render: (r) => fmtDate(r.date) },
            { key: 's', header: 'Scenario', render: (r) => r.scenario },
            { key: 'st', header: 'Status', render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
            { key: 'r', header: 'Result', render: (r) => <Badge tone={resultTone[r.result]} dot={false}>{r.result}</Badge> },
          ]}
        />
      </Card>

      {open && (
        <Modal title="New experiment" onClose={() => setOpen(false)}
          footer={<><button className="btn" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setOpen(false); toast('Experiment scheduled (simulated)'); }}>Schedule</button></>}>
          <div className="stack">
            <div className="field"><label htmlFor="en">Name</label><input id="en" className="input" placeholder="e.g. Gradual traffic ramp #2" /></div>
            <SelectField label="Scenario" value="ramp" onChange={() => {}} options={[{ value: 'ramp', label: 'CPU-bound load ramp' }, { value: 'spike', label: 'Request burst' }, { value: 'mem', label: 'Controlled memory growth' }]} />
            <SelectField label="Duration" value="30" onChange={() => {}} options={[{ value: '20', label: '20 minutes' }, { value: '30', label: '30 minutes' }, { value: '60', label: '60 minutes' }]} />
            <p className="help">Frontend only – scheduling does not start any load or touch a cluster.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
