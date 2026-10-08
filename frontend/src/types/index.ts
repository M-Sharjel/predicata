export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HealthState = 'Healthy' | 'Warning' | 'Failed';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved' | 'Auto-Recovered';
export type RecoveryResult = 'Success' | 'Failed' | 'Pending' | 'In Progress';
export type ActionType =
  | 'SCALE_UP'
  | 'SCALE_DOWN'
  | 'RESTART_UNHEALTHY_POD'
  | 'ROLLBACK_DEPLOYMENT'
  | 'NOTIFY_ADMIN'
  | 'NO_ACTION';

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  tone: 'green' | 'blue' | 'amber' | 'red' | 'violet';
  spark: number[];
}

export interface Signal {
  key: string;
  label: string;
  value: string;
  pct: number; // normalised 0-100 for the gauge bar
  tone: 'green' | 'amber' | 'orange' | 'red';
}

export interface RiskPoint {
  t: string;
  risk: number;
}

export interface Prediction {
  id: string;
  timestamp: string;
  service: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  horizonMin: number;
  predictedFailure: string;
  recommendedAction: ActionType;
  status: 'Active' | 'Acted' | 'Expired' | 'False Alarm';
  explanation: string;
  contributions: { signal: string; weight: number }[];
  trends: Record<'cpu' | 'memory' | 'latency' | 'requests' | 'errors', number[]>;
}

export interface TimelineEvent {
  time: string;
  title: string;
  detail?: string;
  tone?: 'green' | 'amber' | 'red' | 'blue';
}

export interface MetricSet {
  cpu: number;
  memory: number;
  latencyMs: number;
  errorRate: number;
  replicas: number;
}

export interface Incident {
  id: string;
  severity: RiskLevel;
  title: string;
  service: string;
  detectedAt: string;
  durationMin: number;
  status: IncidentStatus;
  action: ActionType;
  predictionId: string;
  recoveryId: string;
  signals: string[];
  before: MetricSet;
  after: MetricSet;
  result: string;
  timeline: TimelineEvent[];
}

export interface RecoveryAction {
  id: string;
  action: ActionType;
  service: string;
  reason: string;
  risk: number;
  riskLevel: RiskLevel;
  startedAt: string;
  durationSec: number;
  result: RecoveryResult;
  predictionId: string;
  retries: number;
  before: MetricSet;
  after: MetricSet;
  verification: { check: string; passed: boolean; detail: string }[];
  timeline: TimelineEvent[];
}

export interface ExperimentSide {
  downtimeSec: number;
  failedRequests: number;
  avgLatencyMs: number;
  peakLatencyMs: number;
  recoverySec: number;
  recoveryActions: number;
  successfulRecoveries: number;
  avgCpu: number;
  avgMemory: number;
}

export interface Experiment {
  id: string;
  name: string;
  date: string;
  scenario: string;
  trafficLevel: string;
  durationMin: number;
  status: 'Completed' | 'Running' | 'Scheduled';
  result: 'Predicta better' | 'Baseline better' | 'Inconclusive' | '—';
  baseline: ExperimentSide;
  predicta: ExperimentSide;
  series: { t: string; baseline: number; predicta: number }[];
  timeline: TimelineEvent[];
  conclusion: string;
}

export interface NodeInfo {
  name: string;
  status: HealthState;
  cpu: number;
  memory: number;
  pods: number;
  role: string;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'CrashLoopBackOff';
  restarts: number;
  node: string;
  cpu: number;
  memory: number;
}

export interface DeploymentInfo {
  name: string;
  namespace: string;
  ready: string;
  desired: number;
  status: HealthState;
  image: string;
}

export interface ServiceInfo {
  name: string;
  namespace: string;
  type: string;
  clusterIp: string;
  port: string;
}

export interface MetricSeriesPoint {
  t: string;
  v: number;
  v2?: number;
}

export type MetricKey = 'cpu' | 'memory' | 'requests' | 'latency' | 'errors' | 'pods' | 'restarts';
export type TimeRange = '15m' | '1h' | '6h' | '24h' | '7d';

export interface AppNotification {
  id: string;
  kind: 'prediction' | 'recovery' | 'cluster' | 'experiment' | 'system';
  severity: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}
