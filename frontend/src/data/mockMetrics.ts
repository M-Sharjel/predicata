import type { MetricKey, MetricSeriesPoint, TimeRange } from '../types';
import { labels, series } from '../utils/format';

export const rangeConfig: Record<TimeRange, { label: string; points: number; stepMin: number }> = {
  '15m': { label: 'Last 15 min', points: 15, stepMin: 1 },
  '1h': { label: 'Last 1 hour', points: 30, stepMin: 2 },
  '6h': { label: 'Last 6 hours', points: 36, stepMin: 10 },
  '24h': { label: 'Last 24 hours', points: 48, stepMin: 30 },
  '7d': { label: 'Last 7 days', points: 42, stepMin: 240 },
};

export const metricMeta: Record<MetricKey, { label: string; unit: string; base: number; amp: number; drift: number; min: number; max: number; color: string; seed: number }> = {
  cpu: { label: 'CPU Utilization', unit: '%', base: 60, amp: 8, drift: 6, min: 0, max: 100, color: '#2563eb', seed: 31 },
  memory: { label: 'Memory Usage', unit: '%', base: 68, amp: 3, drift: 4, min: 0, max: 100, color: '#7c3aed', seed: 32 },
  requests: { label: 'Request Rate', unit: 'req/min', base: 1700, amp: 300, drift: 200, min: 0, max: 5000, color: '#0891b2', seed: 33 },
  latency: { label: 'Response Latency', unit: 'ms', base: 180, amp: 40, drift: 30, min: 20, max: 1500, color: '#d97706', seed: 34 },
  errors: { label: 'Error Rate', unit: '%', base: 0.8, amp: 0.4, drift: 0.2, min: 0, max: 20, color: '#dc2626', seed: 35 },
  pods: { label: 'Running Pods', unit: '', base: 12, amp: 1, drift: 0, min: 6, max: 16, color: '#16a34a', seed: 36 },
  restarts: { label: 'Pod Restarts', unit: '', base: 1, amp: 1.2, drift: 1, min: 0, max: 10, color: '#ea580c', seed: 37 },
};

const rangeSeed: Record<TimeRange, number> = { '15m': 1, '1h': 2, '6h': 3, '24h': 4, '7d': 5 };

export function buildMetric(key: MetricKey, range: TimeRange): MetricSeriesPoint[] {
  const m = metricMeta[key];
  const c = rangeConfig[range];
  const ls = labels(c.points, c.stepMin);
  let vals = series(m.seed * 10 + rangeSeed[range], c.points, m.base, m.amp, m.drift, m.min, m.max);
  if (key === 'pods' || key === 'restarts') vals = vals.map((v) => Math.round(v));
  return ls.map((t, i) => ({ t: range === '7d' || range === '24h' ? `${t}` : t, v: vals[i] }));
}

export function summarise(points: MetricSeriesPoint[]) {
  const vs = points.map((p) => p.v);
  return {
    current: vs[vs.length - 1],
    avg: vs.reduce((a, b) => a + b, 0) / vs.length,
    min: Math.min(...vs),
    max: Math.max(...vs),
  };
}
