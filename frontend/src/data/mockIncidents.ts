import type { Incident, IncidentStatus, RiskLevel } from '../types';
import { ago } from '../utils/format';
import { recoveryActions } from './mockRecovery';

const titles = [
  'CPU saturation predicted',
  'Memory growth anomaly',
  'Latency degradation',
  'Pod readiness failures',
  'Elevated 5xx error rate',
  'Request surge detected',
  'Restart loop detected',
  'Replica shortfall',
];
const severities: RiskLevel[] = ['HIGH', 'CRITICAL', 'MEDIUM', 'CRITICAL', 'HIGH', 'MEDIUM', 'HIGH', 'LOW'];
const statuses: IncidentStatus[] = ['Auto-Recovered', 'Auto-Recovered', 'Investigating', 'Open', 'Resolved', 'Auto-Recovered', 'Investigating', 'Resolved'];
const signalSets = [
  ['CPU 87%', 'Latency 620ms', 'Requests +64%'],
  ['Memory 91%', 'OOM risk', 'Restarts +3'],
  ['Latency 840ms', 'Error rate 3.4%'],
  ['Readiness failing', 'Replicas 2/4'],
  ['5xx 7.2%', 'Latency 700ms'],
  ['Requests 3.1k/min', 'CPU 78%'],
  ['Restarts 6', 'CrashLoopBackOff'],
  ['Replicas 2/3', 'CPU 55%'],
];

export const incidents: Incident[] = recoveryActions.slice(0, 12).map((rec, i) => {
  const k = i % titles.length;
  return {
    id: `INC-${String(300 + i)}`,
    severity: severities[k],
    title: titles[k],
    service: rec.service,
    detectedAt: ago(20 + i * 100),
    durationMin: 4 + ((i * 11) % 38),
    status: statuses[k],
    action: rec.action,
    predictionId: rec.predictionId,
    recoveryId: rec.id,
    signals: signalSets[k],
    before: rec.before,
    after: rec.after,
    result:
      rec.result === 'Success'
        ? 'Recovered automatically. Verification passed.'
        : rec.result === 'Failed'
          ? 'Automated recovery failed verification. Escalated to administrator.'
          : 'Awaiting administrator approval.',
    timeline: rec.timeline,
  };
});

export const incidentServices = Array.from(new Set(incidents.map((x) => x.service)));
