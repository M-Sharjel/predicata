import { mock } from './mockApi';
import { currentSignals, dashboardKpis, dashboardPrediction, riskTimeline } from '../data/mockDashboard';
import { predictions } from '../data/mockPredictions';
import { incidents } from '../data/mockIncidents';
import { recoveryActions } from '../data/mockRecovery';
import { experiments } from '../data/mockExperiments';
import { clusterSummary, deployments, namespaces, nodes, pods, resourceCharts, services } from '../data/mockInfrastructure';
import { buildMetric } from '../data/mockMetrics';
import { notifications } from '../data/mockNotifications';
import type { MetricKey, TimeRange } from '../types';

// Later phase: replace each body with `api.get('/api/v1/...')`.

export const dashboardService = {
  get: () => mock({ kpis: dashboardKpis, prediction: dashboardPrediction, risk: riskTimeline, signals: currentSignals }),
};

export const predictionService = {
  list: () => mock(predictions),
  get: (id: string) => mock(predictions.find((p) => p.id === id) ?? null),
};

export const incidentService = {
  list: () => mock(incidents),
  get: (id: string) => mock(incidents.find((p) => p.id === id) ?? null),
};

export const recoveryService = {
  list: () => mock(recoveryActions),
  get: (id: string) => mock(recoveryActions.find((p) => p.id === id) ?? null),
};

export const experimentService = {
  list: () => mock(experiments),
  get: (id: string) => mock(experiments.find((p) => p.id === id) ?? null),
};

export const infrastructureService = {
  get: () => mock({ cluster: clusterSummary, nodes, pods, deployments, services, namespaces, charts: resourceCharts }),
};

export const metricsService = {
  get: (key: MetricKey, range: TimeRange) => mock(buildMetric(key, range), 200),
};

export const notificationService = {
  list: () => mock(notifications),
};
