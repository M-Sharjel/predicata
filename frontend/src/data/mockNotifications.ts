import type { AppNotification } from '../types';
import { ago } from '../utils/format';

export const notifications: AppNotification[] = [
  { id: 'n1', kind: 'prediction', severity: 'warning', title: 'Prediction risk increased', body: 'demo-web risk rose from 22% to 58% (MEDIUM) in the last 10 minutes.', time: ago(6), read: false, link: '/predictions/PRD-2402' },
  { id: 'n2', kind: 'recovery', severity: 'success', title: 'Recovery completed', body: 'SCALE_UP on demo-web verified successfully (3 → 5 replicas).', time: ago(31), read: false, link: '/recovery/RCV-1040' },
  { id: 'n3', kind: 'cluster', severity: 'warning', title: 'Cluster warning', body: 'node-03 CPU is at 81% and memory at 83%.', time: ago(55), read: false, link: '/infrastructure' },
  { id: 'n4', kind: 'recovery', severity: 'critical', title: 'Recovery failed verification', body: 'ROLLBACK_DEPLOYMENT on auth-svc did not meet latency target after 2 retries.', time: ago(120), read: false, link: '/recovery/RCV-1043' },
  { id: 'n5', kind: 'experiment', severity: 'info', title: 'Experiment completed', body: 'EXP-01 “Gradual traffic ramp” finished. Results available (mock).', time: ago(200), read: true, link: '/experiments/EXP-01' },
  { id: 'n6', kind: 'system', severity: 'success', title: 'System healthy', body: 'All monitored services returned to normal operating range.', time: ago(340), read: true },
  { id: 'n7', kind: 'prediction', severity: 'critical', title: 'CRITICAL risk detected', body: 'checkout-svc risk 91% – restart recommended.', time: ago(480), read: true, link: '/predictions/PRD-2406' },
  { id: 'n8', kind: 'system', severity: 'info', title: 'Model updated', body: 'Prediction model switched to Random Forest v1.2 (demo).', time: ago(1500), read: true },
];
