import type { Kpi, RiskPoint, Signal } from '../types';
import { labels, series } from '../utils/format';

// ---- MOCK / DEMO DATA: no real infrastructure is being monitored ----

export const dashboardKpis: Kpi[] = [
  { label: 'Failure Risk', value: '18%', sub: 'LOW · next 30 min', trend: 'down', trendLabel: '−4% vs 1h', tone: 'green', spark: series(11, 20, 22, 6, -4) },
  { label: 'CPU Utilization', value: '62%', sub: '12 pods · avg', trend: 'up', trendLabel: '+6% vs 1h', tone: 'blue', spark: series(12, 20, 55, 6, 7) },
  { label: 'Memory Usage', value: '71%', sub: '22.7 / 32 GiB', trend: 'up', trendLabel: '+2% vs 1h', tone: 'violet', spark: series(13, 20, 68, 3, 3) },
  { label: 'Active Pods', value: '12 / 16', sub: '4 pods scaled down', trend: 'flat', trendLabel: 'stable', tone: 'amber', spark: series(14, 20, 12, 0.6, 0, 8, 16) },
];

const L = labels(30, 2);
const riskVals = series(21, 30, 20, 5, -2, 4, 100).map((v, i) => (i > 18 && i < 24 ? v + 18 : v));
export const riskTimeline: RiskPoint[] = L.map((t, i) => ({ t, risk: Math.round(riskVals[i]) }));

export const dashboardPrediction = {
  risk: 18,
  level: 'LOW' as const,
  confidence: 94,
  horizonMin: 30,
  modelName: 'Random Forest v1.2 (demo)',
};

export const currentSignals: Signal[] = [
  { key: 'cpu', label: 'CPU', value: '62%', pct: 62, tone: 'amber' },
  { key: 'memory', label: 'Memory', value: '71%', pct: 71, tone: 'amber' },
  { key: 'requests', label: 'Requests', value: '1.8k/min', pct: 45, tone: 'green' },
  { key: 'latency', label: 'Latency', value: '184ms', pct: 30, tone: 'green' },
  { key: 'errors', label: 'Error rate', value: '0.8%', pct: 8, tone: 'green' },
];
