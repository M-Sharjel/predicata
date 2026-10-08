import { useMemo, useState } from 'react';
import { Boxes, Cpu, Layers, Network, Rocket, Server } from 'lucide-react';
import { infrastructureService } from '../services';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, Progress, StatCard, loadTone } from '../components/Cards';
import { Badge, DemoBanner, HealthBadge } from '../components/Badges';
import { MultiLine } from '../components/Charts';
import { DataTable } from '../components/DataTable';
import { ErrorState, PageLoading } from '../components/States';
import { SearchInput, Tabs } from '../components/Inputs';

type Tab = 'nodes' | 'pods' | 'deployments' | 'services' | 'namespaces';

export default function Infrastructure() {
  const { data, loading, error, reload } = useAsync(infrastructureService.get);
  const [tab, setTab] = useState<Tab>('nodes');
  const [q, setQ] = useState('');
  const f = (s: string) => s.toLowerCase().includes(q.toLowerCase());

  const pods = useMemo(() => (data?.pods ?? []).filter((p) => f(p.name) || f(p.namespace)), [data, q]);
  if (loading) return <PageLoading />;
  if (error || !data) return <ErrorState message={error ?? undefined} onRetry={reload} />;
  const c = data.cluster;

  const meter = (v: number) => (
    <div className="row" style={{ flexWrap: 'nowrap', minWidth: 120, justifyContent: 'flex-end' }}>
      <div style={{ flex: 1, minWidth: 60 }}><Progress pct={v} tone={loadTone(v)} /></div>
      <span style={{ width: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}%</span>
    </div>
  );

  return (
    <div className="stack">
      <PageHeader title="Infrastructure" subtitle="Cluster, nodes, workloads and resource usage" crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Infrastructure' }]} />
      <DemoBanner />

      <div className="grid g-4 keep2">
        <StatCard label="Cluster status" value={<HealthBadge state={c.status} />} sub={`${c.name} · ${c.version}`} tone="green" icon={<Server size={16} />} />
        <StatCard label="Nodes" value={c.nodes} sub="1 control-plane · 2 workers" tone="blue" icon={<Boxes size={16} />} />
        <StatCard label="Running pods" value={`${c.runningPods} / ${c.totalPods}`} sub="1 pending · 1 crash-looping" tone="amber" icon={<Layers size={16} />} />
        <StatCard label="Capacity" value={c.cpuCapacity} sub={`${c.memoryCapacity} memory`} tone="violet" icon={<Cpu size={16} />} />
      </div>

      <div className="grid g-2">
        <Card title="CPU usage" hint="Cluster total vs. demo namespace">
          <MultiLine ariaLabel="CPU usage chart" unit="%" height="sm" data={data.charts.cpu} series={[{ key: 'v', name: 'Cluster', color: '#2563eb' }, { key: 'v2', name: 'demo ns', color: '#14b8a6' }]} />
        </Card>
        <Card title="Memory usage" hint="Cluster total vs. demo namespace">
          <MultiLine ariaLabel="Memory usage chart" unit="%" height="sm" data={data.charts.memory} series={[{ key: 'v', name: 'Cluster', color: '#7c3aed' }, { key: 'v2', name: 'demo ns', color: '#14b8a6' }]} />
        </Card>
        <Card title="Network" hint="Ingress / egress (MB/s)">
          <MultiLine ariaLabel="Network chart" height="sm" data={data.charts.network} series={[{ key: 'v', name: 'Ingress', color: '#0891b2' }, { key: 'v2', name: 'Egress', color: '#f59e0b' }]} />
        </Card>
        <Card title="Disk" hint="Usage % / IO (MB/s)">
          <MultiLine ariaLabel="Disk chart" height="sm" data={data.charts.disk} series={[{ key: 'v', name: 'Usage %', color: '#16a34a' }, { key: 'v2', name: 'IO', color: '#ea580c' }]} />
        </Card>
      </div>

      <Card pad={false}>
        <div style={{ padding: '4px 18px 0' }}>
          <Tabs<Tab>
            label="Kubernetes resources" value={tab} onChange={setTab}
            tabs={[
              { id: 'nodes', label: `Nodes (${data.nodes.length})` },
              { id: 'pods', label: `Pods (${data.pods.length})` },
              { id: 'deployments', label: `Deployments (${data.deployments.length})` },
              { id: 'services', label: `Services (${data.services.length})` },
              { id: 'namespaces', label: `Namespaces (${data.namespaces.length})` },
            ]}
          />
        </div>
        {tab === 'pods' && (
          <div className="filters"><div className="field grow"><span className="label">Search pods</span><SearchInput value={q} onChange={setQ} placeholder="Filter by name or namespace" label="Search pods" /></div></div>
        )}
        <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === 'nodes' && (
            <DataTable ariaLabel="Nodes" rowKey={(r) => r.name} rows={data.nodes} columns={[
              { key: 'n', header: 'Node', sort: (r) => r.name, render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.name}</span> },
              { key: 'r', header: 'Role', render: (r) => <span className="muted">{r.role}</span> },
              { key: 's', header: 'Status', render: (r) => <HealthBadge state={r.status} /> },
              { key: 'c', header: 'CPU', sort: (r) => r.cpu, render: (r) => meter(r.cpu) },
              { key: 'm', header: 'Memory', sort: (r) => r.memory, render: (r) => meter(r.memory) },
              { key: 'p', header: 'Pods', sort: (r) => r.pods, render: (r) => `${r.pods} pods` },
            ]} />
          )}
          {tab === 'pods' && (
            <DataTable ariaLabel="Pods" rowKey={(r) => r.name} rows={pods} columns={[
              { key: 'n', header: 'Pod', sort: (r) => r.name, render: (r) => <span className="mono truncate" style={{ maxWidth: 260, display: 'inline-block' }}>{r.name}</span> },
              { key: 'ns', header: 'Namespace', render: (r) => r.namespace },
              { key: 's', header: 'Status', render: (r) => <Badge tone={r.status === 'Running' ? 'green' : r.status === 'Pending' ? 'amber' : 'red'}>{r.status}</Badge> },
              { key: 'r', header: 'Restarts', sort: (r) => r.restarts, render: (r) => r.restarts },
              { key: 'nd', header: 'Node', render: (r) => <span className="mono">{r.node}</span> },
              { key: 'c', header: 'CPU', render: (r) => `${r.cpu}%` },
              { key: 'm', header: 'Memory', render: (r) => `${r.memory}%` },
            ]} />
          )}
          {tab === 'deployments' && (
            <DataTable ariaLabel="Deployments" rowKey={(r) => r.name} rows={data.deployments} columns={[
              { key: 'n', header: 'Deployment', render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.name}</span> },
              { key: 'ns', header: 'Namespace', render: (r) => r.namespace },
              { key: 'r', header: 'Ready', render: (r) => r.ready },
              { key: 's', header: 'Status', render: (r) => <HealthBadge state={r.status} /> },
              { key: 'i', header: 'Image', render: (r) => <span className="mono muted">{r.image}</span> },
            ]} />
          )}
          {tab === 'services' && (
            <DataTable ariaLabel="Services" rowKey={(r) => r.name} rows={data.services} columns={[
              { key: 'n', header: 'Service', render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.name}</span> },
              { key: 'ns', header: 'Namespace', render: (r) => r.namespace },
              { key: 't', header: 'Type', render: (r) => <Badge tone="blue" dot={false}>{r.type}</Badge> },
              { key: 'ip', header: 'Cluster IP', render: (r) => <span className="mono">{r.clusterIp}</span> },
              { key: 'p', header: 'Port', render: (r) => <span className="mono">{r.port}</span> },
            ]} />
          )}
          {tab === 'namespaces' && (
            <DataTable ariaLabel="Namespaces" rowKey={(r) => r.name} rows={data.namespaces} columns={[
              { key: 'n', header: 'Namespace', render: (r) => <span className="mono" style={{ fontWeight: 600 }}>{r.name}</span> },
              { key: 'p', header: 'Pods', render: (r) => r.pods },
              { key: 's', header: 'Status', render: (r) => <Badge tone="green">{r.status}</Badge> },
            ]} />
          )}
        </div>
      </Card>
      <p className="muted" style={{ fontSize: 12 }}><Network size={12} style={{ verticalAlign: -2 }} /> <Rocket size={12} style={{ verticalAlign: -2 }} /> Read-only view in this phase. No actions are sent to a cluster.</p>
    </div>
  );
}
