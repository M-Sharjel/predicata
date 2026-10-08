import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { incidentService } from '../services';
import { incidentServices } from '../data/mockIncidents';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader } from '../components/Cards';
import { ActionTag, DemoBanner, RiskBadge, StatusBadge } from '../components/Badges';
import { DataTable } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/States';
import { DatePicker, SearchInput, SelectField } from '../components/Inputs';
import { fmtDateTime, fmtDuration } from '../utils/format';

export default function Incidents() {
  const { data, loading, error, reload } = useAsync(incidentService.list);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sev, setSev] = useState('All');
  const [status, setStatus] = useState('All');
  const [svc, setSvc] = useState('All');
  const [date, setDate] = useState('');

  const rows = useMemo(() => (data ?? []).filter((i) =>
    (sev === 'All' || i.severity === sev) &&
    (status === 'All' || i.status === status) &&
    (svc === 'All' || i.service === svc) &&
    (!date || i.detectedAt.slice(0, 10) === date) &&
    (q === '' || `${i.id} ${i.title} ${i.service}`.toLowerCase().includes(q.toLowerCase())),
  ), [data, sev, status, svc, date, q]);

  return (
    <div className="stack">
      <PageHeader title="Incidents" subtitle="Detected incidents and their automated responses" crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Incidents' }]} />
      <DemoBanner />
      <Card pad={false}>
        <div className="filters">
          <div className="field grow"><span className="label">Search</span><SearchInput value={q} onChange={setQ} placeholder="Incident ID, title or service" /></div>
          <SelectField label="Severity" value={sev} onChange={setSev} options={['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']} />
          <SelectField label="Status" value={status} onChange={setStatus} options={['All', 'Open', 'Investigating', 'Resolved', 'Auto-Recovered']} />
          <SelectField label="Service" value={svc} onChange={setSvc} options={['All', ...incidentServices]} />
          <DatePicker label="Date" value={date} onChange={setDate} />
          <button className="btn" onClick={() => { setQ(''); setSev('All'); setStatus('All'); setSvc('All'); setDate(''); }}>Reset</button>
        </div>
        {loading ? <LoadingState rows={6} /> : error ? <ErrorState message={error} onRetry={reload} /> : (
          <DataTable
            ariaLabel="Incidents" rowKey={(r) => r.id} rows={rows} onRowClick={(r) => nav(`/incidents/${r.id}`)}
            columns={[
              { key: 'id', header: 'Incident ID', sort: (r) => r.id, render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.id}</span> },
              { key: 't', header: 'Title', render: (r) => r.title },
              { key: 'sev', header: 'Severity', render: (r) => <RiskBadge level={r.severity} /> },
              { key: 'svc', header: 'Service', sort: (r) => r.service, render: (r) => <span className="mono">{r.service}</span> },
              { key: 'd', header: 'Detected', sort: (r) => r.detectedAt, render: (r) => fmtDateTime(r.detectedAt) },
              { key: 'du', header: 'Duration', sort: (r) => r.durationMin, render: (r) => fmtDuration(r.durationMin) },
              { key: 'st', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'a', header: 'Action', render: (r) => <ActionTag action={r.action} /> },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
