import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { Kpi } from '../types';

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 6 }}>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <ChevronRight size={13} aria-hidden />}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title, subtitle, crumbs, actions,
}: { title: string; subtitle?: ReactNode; crumbs?: { label: string; to?: string }[]; actions?: ReactNode }) {
  return (
    <header>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="page-head">
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {subtitle && <p className="sub">{subtitle}</p>}
        </div>
        {actions && <div className="head-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({ title, hint, actions, children, pad = true, className = '' }: {
  title?: ReactNode; hint?: ReactNode; actions?: ReactNode; children: ReactNode; pad?: boolean; className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          <div style={{ minWidth: 0 }}>
            {title && <h2 className="card-title">{title}</h2>}
            {hint && <div className="hint" style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{hint}</div>}
          </div>
          {actions}
        </div>
      )}
      {pad ? <div className="card-body">{children}</div> : <div style={{ paddingTop: title ? 12 : 0 }}>{children}</div>}
    </section>
  );
}

const sparkColor: Record<string, string> = { green: '#22c55e', blue: '#3b82f6', amber: '#f59e0b', red: '#ef4444', violet: '#8b5cf6' };

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }));
  const id = `sp${color.replace('#', '')}`;
  return (
    <div className="kpi-spark" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={d} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KpiCard({ kpi, icon }: { kpi: Kpi; icon: ReactNode }) {
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  return (
    <div className="card kpi">
      <div className="kpi-top">
        <span>{kpi.label}</span>
        <span className={`kpi-icon tone-${kpi.tone}`}>{icon}</span>
      </div>
      <div className="kpi-value">{kpi.value}</div>
      <div className="kpi-foot">
        <div style={{ minWidth: 0 }}>
          <div className="kpi-sub">{kpi.sub}</div>
          {kpi.trendLabel && (
            <span className="kpi-trend muted"><TrendIcon size={13} aria-hidden /> {kpi.trendLabel}</span>
          )}
        </div>
        <Sparkline data={kpi.spark} color={sparkColor[kpi.tone]} />
      </div>
    </div>
  );
}

/** Simple stat tile (used on Recovery / Experiments / Metrics). */
export function StatCard({ label, value, sub, tone = 'blue', icon }: {
  label: string; value: ReactNode; sub?: ReactNode; tone?: 'green' | 'blue' | 'amber' | 'red' | 'violet' | 'gray'; icon?: ReactNode;
}) {
  return (
    <div className="card kpi">
      <div className="kpi-top">
        <span>{label}</span>
        {icon && <span className={`kpi-icon tone-${tone}`}>{icon}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export function Progress({ pct, tone }: { pct: number; tone: 'green' | 'amber' | 'orange' | 'red' | 'blue' }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i className={`fill-${tone}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function loadTone(pct: number): 'green' | 'amber' | 'orange' | 'red' {
  return pct < 60 ? 'green' : pct < 75 ? 'amber' : pct < 90 ? 'orange' : 'red';
}

export function Timeline({ events }: { events: { time: string; title: string; detail?: string; tone?: string }[] }) {
  return (
    <ol className="timeline" style={{ listStyle: 'none', margin: 0 }}>
      {events.map((e, i) => (
        <li key={i} className={`tl-item ${e.tone ?? ''}`}>
          <div className="tl-time">{e.time}</div>
          <div className="tl-title">{e.title}</div>
          {e.detail && <div className="muted" style={{ fontSize: 13 }}>{e.detail}</div>}
        </li>
      ))}
    </ol>
  );
}

export function BeforeAfter({ before, after }: {
  before: { cpu: number; memory: number; latencyMs: number; errorRate: number; replicas: number };
  after: { cpu: number; memory: number; latencyMs: number; errorRate: number; replicas: number };
}) {
  const rows: [string, string, string, boolean][] = [
    ['Replicas', String(before.replicas), String(after.replicas), after.replicas >= before.replicas],
    ['CPU', `${before.cpu}%`, `${after.cpu}%`, after.cpu <= before.cpu],
    ['Memory', `${before.memory}%`, `${after.memory}%`, after.memory <= before.memory],
    ['Latency', `${before.latencyMs} ms`, `${after.latencyMs} ms`, after.latencyMs <= before.latencyMs],
    ['Error rate', `${before.errorRate}%`, `${after.errorRate}%`, after.errorRate <= before.errorRate],
  ];
  return (
    <div className="table-wrap">
      <table className="t">
        <thead><tr><th>Metric</th><th>Before</th><th>After</th></tr></thead>
        <tbody>
          {rows.map(([k, b, a, good]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{b}</td>
              <td style={{ fontWeight: 650, color: good ? 'var(--green)' : 'var(--red)' }}>{a}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
