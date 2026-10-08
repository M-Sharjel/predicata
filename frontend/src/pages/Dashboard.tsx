import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, BrainCircuit, Cpu, MemoryStick, Server, RefreshCw } from 'lucide-react';
import { dashboardService, incidentService, recoveryService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, KpiCard, PageHeader, Progress } from '../components/Cards';
import { ActionTag, Badge, DemoBanner, RiskBadge, StatusBadge, riskTone } from '../components/Badges';
import { AreaTrend } from '../components/Charts';
import { DataTable } from '../components/DataTable';
import { ErrorState, PageLoading } from '../components/States';
import { fmtDateTime, fmtTime, MOCK_NOW } from '../utils/format';
import { useToast } from '../components/Overlays';

const icons = [<BrainCircuit size={17} />, <Cpu size={17} />, <MemoryStick size={17} />, <Server size={17} />];
const toneColor = { green: 'var(--green)', amber: 'var(--amber)', orange: 'var(--orange)', red: 'var(--red)' } as const;

export default function Dashboard() {
  const nav = useNavigate();
  const toast = useToast();
  const dash = useAsync(dashboardService.get);
  const inc = useAsync(incidentService.list);
  const rec = useAsync(recoveryService.list);

  if (dash.loading) return <PageLoading />;
  if (dash.error || !dash.data) return <ErrorState message={dash.error ?? undefined} onRetry={dash.reload} />;
  const d = dash.data;

  return (
    <div className="stack">
      <PageHeader
        title="Overview"
        subtitle="Predictive health and automated recovery control center"
        actions={<>
          <Badge tone="green">Cluster Healthy</Badge>
          <span className="muted" style={{ fontSize: 12.5 }}>Last updated {fmtDateTime(MOCK_NOW.toISOString())}</span>
          <button className="btn btn-sm" onClick={() => { dash.reload(); toast('Dashboard refreshed (mock data)'); }}><RefreshCw size={14} /> Refresh</button>
        </>}
      />
      <DemoBanner />

      <div className="grid g-4">
        {d.kpis.map((k, i) => <KpiCard key={k.label} kpi={k} icon={icons[i]} />)}
      </div>

      <div className="grid g-main">
        <Card
          title="Failure Risk Prediction"
          hint={`Model: ${d.prediction.modelName}`}
          actions={<Link className="btn btn-sm" to="/predictions">View history</Link>}
        >
          <div className="risk-hero" style={{ marginBottom: 14 }}>
            <div>
              <div className="k muted" style={{ fontSize: 12 }}>Current risk</div>
              <div className="risk-num" style={{ color: toneColor[riskTone[d.prediction.level] as keyof typeof toneColor] }}>{d.prediction.risk}%</div>
            </div>
            <div className="risk-meta">
              <div><div className="k">Risk level</div><div className="val"><RiskBadge level={d.prediction.level} /></div></div>
              <div><div className="k">Model confidence</div><div className="val">{d.prediction.confidence}%</div></div>
              <div><div className="k">Prediction horizon</div><div className="val">{d.prediction.horizonMin} minutes</div></div>
            </div>
          </div>
          <AreaTrend
            data={d.risk as unknown as Record<string, number | string>[]} dataKey="risk" color="#2563eb" unit="%" domain={[0, 100]}
            ariaLabel="Failure risk over the last hour" height="lg"
            thresholds={[{ y: 30, label: 'MEDIUM', color: '#f59e0b' }, { y: 60, label: 'HIGH', color: '#f97316' }, { y: 80, label: 'CRITICAL', color: '#ef4444' }]}
          />
        </Card>

        <Card title="Current Signals" hint="Latest values from the monitored service">
          {d.signals.map((s) => (
            <div className="signal" key={s.key}>
              <span>{s.label}</span>
              <Progress pct={s.pct} tone={s.tone} />
              <span className="v">{s.value}</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid g-main">
        <Card title="Recent Incidents" pad={false} actions={<Link className="btn btn-sm" to="/incidents">View all</Link>}>
          {inc.loading ? <div style={{ padding: 18 }}>Loading…</div> : inc.error ? <ErrorState message={inc.error} onRetry={inc.reload} /> : (
            <DataTable
              ariaLabel="Recent incidents" pageSize={5} rowKey={(r) => r.id}
              rows={inc.data!.slice(0, 5)} onRowClick={(r) => nav(`/incidents/${r.id}`)}
              columns={[
                { key: 'time', header: 'Time', render: (r) => fmtTime(r.detectedAt) },
                { key: 'inc', header: 'Incident', render: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
                { key: 'svc', header: 'Service', render: (r) => <span className="mono">{r.service}</span> },
                { key: 'act', header: 'Action', render: (r) => <ActionTag action={r.action} /> },
                { key: 'st', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
          )}
        </Card>

        <Card title="Recovery Activity" pad={false} actions={<Link className="btn btn-sm" to="/recovery">View all</Link>}>
          {rec.loading ? <div style={{ padding: 18 }}>Loading…</div> : rec.error ? <ErrorState message={rec.error} onRetry={rec.reload} /> : (
            <div className="list">
              {rec.data!.slice(0, 5).map((r) => (
                <Link key={r.id} to={`/recovery/${r.id}`} className="list-item" style={{ color: 'inherit' }}>
                  <span className={`kpi-icon tone-${r.result === 'Success' ? 'green' : r.result === 'Failed' ? 'red' : 'amber'}`}><AlertTriangle size={15} /></span>
                  <div className="body">
                    <div className="t1">{r.action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</div>
                    <div className="t2 mono">{r.service} · {fmtTime(r.startedAt)}</div>
                  </div>
                  <StatusBadge status={r.result} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
