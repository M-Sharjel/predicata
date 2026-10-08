import type { ActionType, Prediction, RiskLevel } from '../types';
import { ago, riskLevel, series } from '../utils/format';

const services = ['demo-web', 'demo-api', 'checkout-svc', 'auth-svc', 'worker-queue'];
const failures = [
  'CPU saturation',
  'Memory exhaustion',
  'Latency degradation',
  'Pod crash loop',
  'Error-rate spike',
];
const actions: ActionType[] = ['SCALE_UP', 'RESTART_UNHEALTHY_POD', 'NOTIFY_ADMIN', 'SCALE_UP', 'NO_ACTION'];
const statuses: Prediction['status'][] = ['Active', 'Acted', 'Acted', 'Expired', 'False Alarm'];
const scores = [18, 34, 52, 67, 74, 85, 91, 23, 41, 63, 78, 12, 57, 88, 29, 45, 70, 36, 82, 15, 49, 66, 93, 27];

function explain(level: RiskLevel, svc: string, failure: string): string {
  if (level === 'LOW') return `${svc} is operating inside its normal envelope. No sustained upward trend was detected in the last 30 minutes.`;
  return `Combined upward trends in CPU, latency and request rate on ${svc} resemble historical patterns preceding "${failure.toLowerCase()}". The model expects thresholds to be breached within the prediction horizon if no action is taken. (Mock explanation – demo data.)`;
}

export const predictions: Prediction[] = scores.map((score, i) => {
  const service = services[i % services.length];
  const failure = failures[(i * 2) % failures.length];
  const level = riskLevel(score);
  const up = score / 100;
  return {
    id: `PRD-${String(2400 + i)}`,
    timestamp: ago(6 + i * 37),
    service,
    riskScore: score,
    riskLevel: level,
    confidence: 78 + ((i * 7) % 20),
    horizonMin: i % 3 === 0 ? 15 : 30,
    predictedFailure: score <= 30 ? 'None expected' : failure,
    recommendedAction: score <= 30 ? 'NO_ACTION' : level === 'CRITICAL' ? 'RESTART_UNHEALTHY_POD' : actions[i % actions.length],
    status: score <= 30 ? 'Expired' : statuses[i % statuses.length],
    explanation: explain(level, service, failure),
    contributions: [
      { signal: 'CPU trend', weight: Math.round(20 + up * 25) },
      { signal: 'Latency trend', weight: Math.round(15 + up * 20) },
      { signal: 'Request rate', weight: Math.round(10 + up * 15) },
      { signal: 'Memory trend', weight: Math.round(10 + up * 10) },
      { signal: 'Error rate', weight: Math.round(5 + up * 10) },
    ],
    trends: {
      cpu: series(100 + i, 24, 40 + up * 30, 5, up * 25),
      memory: series(200 + i, 24, 50 + up * 20, 3, up * 15),
      latency: series(300 + i, 24, 150 + up * 150, 20, up * 300, 50, 1500),
      requests: series(400 + i, 24, 1200 + up * 500, 120, up * 800, 200, 4000),
      errors: series(500 + i, 24, 0.5 + up * 2, 0.3, up * 5, 0, 20),
    },
  };
});

export const predictionServices = services;
