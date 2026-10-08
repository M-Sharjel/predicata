import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ListChecks, XCircle } from 'lucide-react';
import { recoveryService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, StatCard } from '../components/Cards';
import { ActionTag, DemoBanner, RiskBadge, StatusBadge } from '../components/Badges';
import { DataTable } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/States';
import { SearchInput, SelectField } from '../components/Inputs';
import { fmtDateTime, fmtSeconds } from '../utils/format';

export default function Recovery() {
  const { data, loading, error, reload } = useAsync(recoveryService.list);
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [res, setRes] = useState('All');
  const rows = useMemo(() => (data ?? []).filter((r) =>
    (res === 'All' || r.result === res) && (q === '' || `${r.id} ${r.service} ${r.reason}`.toLowerCase().includes(q.toLowerCase())),
  ), [data, res, q]);
  const count = (r: string) => (data ?? []).filter((x) => x.result === r).length;

  return (
    <div className="stack">
      <PageHeader title="Recovery Actions" subtitle="Automated, allow-listed recovery activity" crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Recovery Actions' }]} />
      <DemoBanner>Recovery actions are simulated. Nothing is executed against Kubernetes in this phase.</DemoBanner>
      <div className="grid g-4 keep2">
        <StatCard label="Total actions" value={data?.length ?? '–'} sub="All time (mock)" tone="blue" icon={<ListChecks size={16} />} />
        <StatCard label="Successful" value={data ? count('Success') : '–'} sub="Verification passed" tone="green" icon={<CheckCircle2 size={16} />} />
        <StatCard label="Failed" value={data ? count('Failed') : '–'} sub="Verification failed" tone="red" icon={<XCircle size={16} />} />
        <StatCard label="Pending" value={data ? count('Pending') + count('In Progress') : '–'} sub="Awaiting approval / running" tone="amber" icon={<Clock size={16} />} />
      </div>
      <Card pad={false}>
        <div className="filters">
          <div className="field grow"><span className="label">Search</span><SearchInput value={q} onChange={setQ} placeholder="Action ID, service or reason" /></div>
          <SelectField label="Result" value={res} onChange={setRes} options={['All', 'Success', 'Failed', 'Pending', 'In Progress']} />
          <button className="btn" onClick={() => { setQ(''); setRes('All'); }}>Reset</button>
        </div>
        {loading ? <LoadingState rows={6} /> : error ? <ErrorState message={error} onRetry={reload} /> : (
          <DataTable
            ariaLabel="Recovery actions" rowKey={(r) => r.id} rows={rows} onRowClick={(r) => nav(`/recovery/${r.id}`)}
            columns={[
              { key: 'a', header: 'Action', render: (r) => <span><ActionTag action={r.action} /> <span className="mono muted" style={{ marginLeft: 4 }}>{r.id}</span></span> },
              { key: 's', header: 'Service', sort: (r) => r.service, render: (r) => <span className="mono">{r.service}</span> },
              { key: 're', header: 'Reason', render: (r) => <span style={{ maxWidth: 300, display: 'inline-block' }}>{r.reason}</span> },
              { key: 'ri', header: 'Risk', sort: (r) => r.risk, render: (r) => <span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><strong>{r.risk}%</strong><RiskBadge level={r.riskLevel} /></span> },
              { key: 'st', header: 'Started', sort: (r) => r.startedAt, render: (r) => fmtDateTime(r.startedAt) },
              { key: 'd', header: 'Duration', sort: (r) => r.durationSec, render: (r) => (r.durationSec ? fmtSeconds(r.durationSec) : '—') },
              { key: 'r', header: 'Result', render: (r) => <StatusBadge status={r.result} /> },
              { key: 'v', header: '', noLabel: true, render: (r) => <Link className="btn btn-sm" to={`/recovery/${r.id}`} onClick={(e) => e.stopPropagation()}>View details</Link> },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
