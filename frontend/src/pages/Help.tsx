import { useState } from 'react';
import { PageHeader, Card } from '../components/Cards';
import { SearchInput } from '../components/Inputs';

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  { id: 'start', title: 'Getting Started', body: (<><p>PREDICTA monitors a Kubernetes-deployed application, estimates the risk of selected infrastructure failures, and (in later phases) performs safe, predefined recovery actions and verifies the result.</p><ol><li>Sign in (mock authentication in this prototype).</li><li>Open <strong>Overview</strong> for current risk, signals and recent activity.</li><li>Use <strong>Predictions</strong> and <strong>Incidents</strong> to investigate.</li><li>Use <strong>Experiments</strong> to compare against baseline autoscaling.</li></ol></>) },
  { id: 'predictions', title: 'How Predictions Work', body: (<><p>Metrics (CPU, memory, request rate, latency, error rate, pod health) are turned into features such as trends and rolling averages. A model outputs a risk score from 0–100.</p><ul><li>0–30 LOW</li><li>31–60 MEDIUM</li><li>61–80 HIGH</li><li>81–100 CRITICAL</li></ul><p>The prototype targets selected, measurable conditions – it does not claim to predict every possible failure.</p></>) },
  { id: 'recovery', title: 'How Recovery Works', body: (<><p>The ML model only <em>recommends</em>. A separate decision policy validates the recommendation against an allow-list (SCALE_UP, SCALE_DOWN, RESTART_UNHEALTHY_POD, ROLLBACK_DEPLOYMENT, NOTIFY_ADMIN, NO_ACTION). After an action, the system waits, then verifies pod health, replicas, CPU/memory, latency and errors.</p><p>The model never runs shell commands and never talks to Kubernetes directly.</p></>) },
  { id: 'experiments', title: 'Experiments', body: <p>Each experiment runs the same load profile twice – once with the Kubernetes HPA baseline and once with PREDICTA – and records downtime, failed requests, latency, recovery time and actions. Results shown today are mock placeholders.</p> },
  { id: 'metrics', title: 'Metrics', body: <p>Metrics come from Prometheus in the full system. Grafana provides infrastructure dashboards; this app is the application-level control center.</p> },
  { id: 'k8s', title: 'Kubernetes Integration', body: <p>Planned: a least-privilege service account scoped to the demo namespace (get/list pods and deployments, patch deployment scale). Credentials stay on the backend and are never sent to the browser. Not implemented in this GUI phase.</p> },
  { id: 'arch', title: 'System Architecture', body: (
    <div className="arch" style={{ maxWidth: 360 }} role="img" aria-label="Architecture: React dashboard to FastAPI to Prometheus to Kubernetes to demo application">
      {['React Dashboard', 'FastAPI Backend  (Prediction · Recovery · Metrics)', 'Prometheus', 'Kubernetes', 'Monitored Demo Application'].map((n, i, a) => (
        <div key={n}><div className="arch-node">{n}</div>{i < a.length - 1 && <div className="arch-arrow" aria-hidden>↓</div>}</div>
      ))}
    </div>) },
  { id: 'faq', title: 'FAQ', body: (
    <div className="faq">
      <details><summary>Is this connected to a real cluster?</summary><p>No. All data in this GUI phase is simulated mock data.</p></details>
      <details><summary>Can PREDICTA fix any failure?</summary><p>No. Only a small set of predefined, safe actions is supported.</p></details>
      <details><summary>Are the experiment results real?</summary><p>No. They are placeholders and must not be used as evidence.</p></details>
      <details><summary>Where do credentials live?</summary><p>On the backend only, with least-privilege access.</p></details>
    </div>) },
];

export default function Help() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState('start');
  const shown = sections.filter((s) => s.id === 'faq' || !q || s.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="stack">
      <PageHeader title="Help & Documentation" subtitle="Learn how PREDICTA works" crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Help' }]} />
      <div style={{ maxWidth: 420 }}><SearchInput value={q} onChange={setQ} placeholder="Search documentation" label="Search documentation" /></div>
      <div className="help-grid">
        <Card className="help-nav" pad={false}>
          <nav aria-label="Documentation sections">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''} onClick={() => setActive(s.id)}>{s.title}</a>
            ))}
          </nav>
        </Card>
        <div className="stack">
          {shown.map((s) => (
            <section key={s.id} id={s.id} className="card card-pad prose" style={{ scrollMarginTop: 80 }}>
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
