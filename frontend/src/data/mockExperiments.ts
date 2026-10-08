import type { Experiment, ExperimentSide } from '../types';
import { ago, fmtTime } from '../utils/format';

// ---- MOCK / DEMO RESULTS ----
// These numbers are illustrative placeholders. They are NOT real experimental
// evidence and must be replaced by measured results in a later phase.

const mk = (
  id: string, name: string, minsAgo: number, scenario: string, traffic: string, dur: number,
  status: Experiment['status'], result: Experiment['result'],
  b: ExperimentSide, p: ExperimentSide, conclusion: string,
): Experiment => {
  const n = 16;
  const series = Array.from({ length: n }, (_, i) => {
    const spike = Math.exp(-Math.pow((i - 7) / 3.2, 2));
    return {
      t: `${i * Math.round(dur / n)}m`,
      baseline: Math.round(b.avgLatencyMs * 0.6 + spike * (b.peakLatencyMs - b.avgLatencyMs * 0.6)),
      predicta: Math.round(p.avgLatencyMs * 0.6 + spike * (p.peakLatencyMs - p.avgLatencyMs * 0.6) * 0.6),
    };
  });
  const t0 = new Date(ago(minsAgo)).getTime();
  const at = (m: number) => fmtTime(new Date(t0 + m * 60_000).toISOString());
  return {
    id, name, date: ago(minsAgo), scenario, trafficLevel: traffic, durationMin: dur, status, result,
    baseline: b, predicta: p, series, conclusion,
    timeline: [
      { time: at(0), title: 'Experiment started', detail: 'Both modes reset to 2 replicas', tone: 'blue' },
      { time: at(Math.round(dur * 0.25)), title: 'Load ramp begins', detail: traffic, tone: 'amber' },
      { time: at(Math.round(dur * 0.35)), title: 'PREDICTA risk crossed HIGH', detail: 'Scale-up recommended', tone: 'amber' },
      { time: at(Math.round(dur * 0.4)), title: 'Baseline HPA threshold reached', detail: 'CPU target 70% exceeded', tone: 'red' },
      { time: at(Math.round(dur * 0.7)), title: 'Load returns to normal', tone: 'green' },
      { time: at(dur), title: 'Experiment finished', tone: 'green' },
    ],
  };
};

export const experiments: Experiment[] = [
  mk('EXP-01', 'Gradual traffic ramp', 1500, 'CPU-bound load ramp', '200 → 1,800 req/min', 30, 'Completed', 'Predicta better',
    { downtimeSec: 48, failedRequests: 412, avgLatencyMs: 342, peakLatencyMs: 1180, recoverySec: 142, recoveryActions: 3, successfulRecoveries: 2, avgCpu: 74, avgMemory: 69 },
    { downtimeSec: 12, failedRequests: 96, avgLatencyMs: 221, peakLatencyMs: 640, recoverySec: 71, recoveryActions: 4, successfulRecoveries: 4, avgCpu: 63, avgMemory: 66 },
    'In this mock scenario PREDICTA scaled before CPU saturation, reducing downtime and failed requests. Illustrative only.'),
  mk('EXP-02', 'Sudden traffic spike', 3300, 'Request burst', '300 → 3,000 req/min in 60s', 20, 'Completed', 'Predicta better',
    { downtimeSec: 95, failedRequests: 880, avgLatencyMs: 510, peakLatencyMs: 2100, recoverySec: 190, recoveryActions: 2, successfulRecoveries: 2, avgCpu: 82, avgMemory: 72 },
    { downtimeSec: 41, failedRequests: 360, avgLatencyMs: 388, peakLatencyMs: 1320, recoverySec: 104, recoveryActions: 3, successfulRecoveries: 3, avgCpu: 71, avgMemory: 68 },
    'A sudden spike gives little warning; improvement is smaller. Illustrative only.'),
  mk('EXP-03', 'Memory leak simulation', 5800, 'Controlled memory growth', 'Steady 800 req/min', 45, 'Completed', 'Inconclusive',
    { downtimeSec: 30, failedRequests: 210, avgLatencyMs: 260, peakLatencyMs: 780, recoverySec: 120, recoveryActions: 2, successfulRecoveries: 1, avgCpu: 45, avgMemory: 84 },
    { downtimeSec: 28, failedRequests: 198, avgLatencyMs: 255, peakLatencyMs: 760, recoverySec: 118, recoveryActions: 2, successfulRecoveries: 1, avgCpu: 44, avgMemory: 83 },
    'HPA is CPU-based; both modes behaved similarly. Difference not meaningful in this mock run.'),
  mk('EXP-04', 'Unhealthy pod injection', 8600, 'Readiness probe failure', 'Steady 1,000 req/min', 25, 'Completed', 'Baseline better',
    { downtimeSec: 18, failedRequests: 120, avgLatencyMs: 210, peakLatencyMs: 520, recoverySec: 40, recoveryActions: 1, successfulRecoveries: 1, avgCpu: 52, avgMemory: 58 },
    { downtimeSec: 26, failedRequests: 170, avgLatencyMs: 238, peakLatencyMs: 610, recoverySec: 62, recoveryActions: 2, successfulRecoveries: 1, avgCpu: 54, avgMemory: 59 },
    'Kubernetes restarted the pod faster than the verification interval allowed in this mock run.'),
  mk('EXP-05', 'Sustained peak load', 0, 'Long high-load soak', '1,500 req/min sustained', 60, 'Running', '—',
    { downtimeSec: 0, failedRequests: 0, avgLatencyMs: 0, peakLatencyMs: 0, recoverySec: 0, recoveryActions: 0, successfulRecoveries: 0, avgCpu: 0, avgMemory: 0 },
    { downtimeSec: 0, failedRequests: 0, avgLatencyMs: 0, peakLatencyMs: 0, recoverySec: 0, recoveryActions: 0, successfulRecoveries: 0, avgCpu: 0, avgMemory: 0 },
    'Experiment in progress – results will appear when it finishes.'),
  mk('EXP-06', 'Night-time traffic dip', -1440, 'Scale-down behaviour', '1,200 → 150 req/min', 30, 'Scheduled', '—',
    { downtimeSec: 0, failedRequests: 0, avgLatencyMs: 0, peakLatencyMs: 0, recoverySec: 0, recoveryActions: 0, successfulRecoveries: 0, avgCpu: 0, avgMemory: 0 },
    { downtimeSec: 0, failedRequests: 0, avgLatencyMs: 0, peakLatencyMs: 0, recoverySec: 0, recoveryActions: 0, successfulRecoveries: 0, avgCpu: 0, avgMemory: 0 },
    'Scheduled – no results yet.'),
];
