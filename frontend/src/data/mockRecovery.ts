import type { ActionType, MetricSet, RecoveryAction, RecoveryResult, TimelineEvent } from '../types';
import { ACTION_LABEL, ago, fmtTime, riskLevel } from '../utils/format';
import { predictions } from './mockPredictions';

const reasons: Record<ActionType, string> = {
  SCALE_UP: 'HIGH risk · CPU > 80% with rising latency and request rate',
  SCALE_DOWN: 'LOW risk for 30 min · CPU < 25% with idle replicas',
  RESTART_UNHEALTHY_POD: 'CRITICAL risk · readiness probe failing on 1 pod',
  ROLLBACK_DEPLOYMENT: 'Error rate > 5% after latest deployment revision',
  NOTIFY_ADMIN: 'MEDIUM risk · action requires manual approval',
  NO_ACTION: 'Risk below action threshold',
};

const plan: { action: ActionType; service: string; result: RecoveryResult }[] = [
  { action: 'SCALE_UP', service: 'demo-web', result: 'Success' },
  { action: 'RESTART_UNHEALTHY_POD', service: 'checkout-svc', result: 'Success' },
  { action: 'SCALE_UP', service: 'demo-api', result: 'Success' },
  { action: 'ROLLBACK_DEPLOYMENT', service: 'auth-svc', result: 'Failed' },
  { action: 'NOTIFY_ADMIN', service: 'worker-queue', result: 'Pending' },
  { action: 'SCALE_UP', service: 'demo-web', result: 'In Progress' },
  { action: 'SCALE_DOWN', service: 'demo-api', result: 'Success' },
  { action: 'RESTART_UNHEALTHY_POD', service: 'worker-queue', result: 'Success' },
  { action: 'SCALE_UP', service: 'checkout-svc', result: 'Failed' },
  { action: 'SCALE_UP', service: 'demo-web', result: 'Success' },
  { action: 'RESTART_UNHEALTHY_POD', service: 'demo-api', result: 'Success' },
  { action: 'NOTIFY_ADMIN', service: 'auth-svc', result: 'Pending' },
];

function build(i: number): RecoveryAction {
  const p = plan[i];
  const pred = predictions[(i * 2 + 3) % predictions.length];
  const score = Math.max(pred.riskScore, p.action === 'SCALE_DOWN' ? 12 : 62);
  const started = ago(25 + i * 95);
  const startMs = new Date(started).getTime();
  const at = (s: number) => fmtTime(new Date(startMs + s * 1000).toISOString());
  const scaleUp = p.action === 'SCALE_UP';
  const ok = p.result === 'Success';
  const failed = p.result === 'Failed';
  const before: MetricSet = { cpu: scaleUp ? 87 : 74, memory: 78, latencyMs: scaleUp ? 620 : 840, errorRate: p.action === 'ROLLBACK_DEPLOYMENT' ? 7.2 : 3.4, replicas: scaleUp ? 3 : 4 };
  const after: MetricSet = ok
    ? { cpu: scaleUp ? 59 : 51, memory: 64, latencyMs: 180, errorRate: 0.6, replicas: scaleUp ? 5 : p.action === 'SCALE_DOWN' ? 2 : 4 }
    : failed
      ? { ...before, cpu: before.cpu - 2, latencyMs: before.latencyMs + 40 }
      : before;
  const dur = p.result === 'Pending' ? 0 : 38 + ((i * 17) % 90);
  const timeline: TimelineEvent[] = [
    { time: at(0), title: 'Risk threshold exceeded', detail: `Risk ${score}% (${riskLevel(score)})`, tone: 'amber' },
    { time: at(4), title: 'Decision policy approved action', detail: `${ACTION_LABEL[p.action]} is on the allow-list`, tone: 'blue' },
    ...(p.result === 'Pending' ? [] : [{ time: at(9), title: `${ACTION_LABEL[p.action]} executed (simulated)`, detail: `target: ${p.service}`, tone: 'blue' as const }]),
    ...(p.result === 'In Progress' ? [{ time: at(30), title: 'Waiting for recovery interval', detail: 'Verification scheduled in 60s', tone: 'amber' as const }] : []),
    ...(ok ? [{ time: at(dur), title: 'Verification passed', detail: 'Health, replicas, CPU, latency and errors back in range', tone: 'green' as const }] : []),
    ...(failed ? [{ time: at(dur), title: 'Verification failed', detail: 'Latency still above threshold – retry scheduled', tone: 'red' as const }] : []),
  ];
  return {
    id: `RCV-${String(1040 + i)}`,
    action: p.action,
    service: p.service,
    reason: reasons[p.action],
    risk: score,
    riskLevel: riskLevel(score),
    startedAt: started,
    durationSec: dur,
    result: p.result,
    predictionId: pred.id,
    retries: failed ? 2 : 0,
    before,
    after,
    verification: [
      { check: 'Pod health', passed: ok, detail: ok ? 'All pods Ready' : 'Readiness probe failing' },
      { check: 'Replica count', passed: ok || p.result === 'Pending', detail: `${after.replicas} replicas` },
      { check: 'CPU / memory', passed: ok, detail: `CPU ${after.cpu}% · Mem ${after.memory}%` },
      { check: 'Response latency', passed: ok, detail: `${after.latencyMs} ms` },
      { check: 'Error rate', passed: ok, detail: `${after.errorRate}%` },
    ],
    timeline,
  };
}

export const recoveryActions: RecoveryAction[] = plan.map((_, i) => build(i));
export const recoveryReasons = reasons;
