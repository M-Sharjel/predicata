import type { DeploymentInfo, NodeInfo, PodInfo, ServiceInfo } from '../types';
import { labels, series } from '../utils/format';

export const clusterSummary = {
  name: 'predicta-demo-cluster',
  status: 'Healthy' as const,
  version: 'v1.30.2 (demo)',
  nodes: 3,
  namespaces: 5,
  deployments: 6,
  services: 7,
  runningPods: 12,
  totalPods: 16,
  cpuCapacity: '12 vCPU',
  memoryCapacity: '32 GiB',
};

export const nodes: NodeInfo[] = [
  { name: 'node-01', status: 'Healthy', cpu: 48, memory: 61, pods: 8, role: 'control-plane' },
  { name: 'node-02', status: 'Healthy', cpu: 62, memory: 70, pods: 12, role: 'worker' },
  { name: 'node-03', status: 'Warning', cpu: 81, memory: 83, pods: 15, role: 'worker' },
];

const podSeed: [string, string, PodInfo['status'], number, string][] = [
  ['demo-web-7d9f-abc12', 'demo', 'Running', 0, 'node-02'],
  ['demo-web-7d9f-def34', 'demo', 'Running', 0, 'node-03'],
  ['demo-web-7d9f-ghi56', 'demo', 'Running', 1, 'node-02'],
  ['demo-api-5c8b-jk789', 'demo', 'Running', 0, 'node-02'],
  ['demo-api-5c8b-lm012', 'demo', 'Running', 2, 'node-03'],
  ['checkout-svc-6f4d-n3456', 'shop', 'Running', 0, 'node-01'],
  ['checkout-svc-6f4d-p7890', 'shop', 'CrashLoopBackOff', 6, 'node-03'],
  ['auth-svc-9b2a-q1234', 'shop', 'Running', 0, 'node-01'],
  ['worker-queue-3e1c-r5678', 'jobs', 'Running', 1, 'node-03'],
  ['worker-queue-3e1c-s9012', 'jobs', 'Pending', 0, 'node-03'],
  ['prometheus-0', 'monitoring', 'Running', 0, 'node-01'],
  ['grafana-5d7c-t3456', 'monitoring', 'Running', 0, 'node-01'],
];
export const pods: PodInfo[] = podSeed.map(([name, namespace, status, restarts, node], i) => ({
  name, namespace, status, restarts, node,
  cpu: status === 'Pending' ? 0 : Math.round(20 + ((i * 13) % 65)),
  memory: status === 'Pending' ? 0 : Math.round(30 + ((i * 17) % 55)),
}));

export const deployments: DeploymentInfo[] = [
  { name: 'demo-web', namespace: 'demo', ready: '3/3', desired: 3, status: 'Healthy', image: 'predicta/demo-web:1.0.3' },
  { name: 'demo-api', namespace: 'demo', ready: '2/2', desired: 2, status: 'Healthy', image: 'predicta/demo-api:1.0.3' },
  { name: 'checkout-svc', namespace: 'shop', ready: '1/2', desired: 2, status: 'Warning', image: 'predicta/checkout:2.1.0' },
  { name: 'auth-svc', namespace: 'shop', ready: '1/1', desired: 1, status: 'Healthy', image: 'predicta/auth:1.4.2' },
  { name: 'worker-queue', namespace: 'jobs', ready: '1/2', desired: 2, status: 'Warning', image: 'predicta/worker:0.9.1' },
  { name: 'grafana', namespace: 'monitoring', ready: '1/1', desired: 1, status: 'Healthy', image: 'grafana/grafana:11' },
];

export const services: ServiceInfo[] = [
  { name: 'demo-web', namespace: 'demo', type: 'LoadBalancer', clusterIp: '10.96.12.40', port: '80/TCP' },
  { name: 'demo-api', namespace: 'demo', type: 'ClusterIP', clusterIp: '10.96.33.8', port: '8080/TCP' },
  { name: 'checkout-svc', namespace: 'shop', type: 'ClusterIP', clusterIp: '10.96.71.5', port: '8080/TCP' },
  { name: 'auth-svc', namespace: 'shop', type: 'ClusterIP', clusterIp: '10.96.5.19', port: '9000/TCP' },
  { name: 'worker-queue', namespace: 'jobs', type: 'ClusterIP', clusterIp: '10.96.88.2', port: '5672/TCP' },
  { name: 'prometheus', namespace: 'monitoring', type: 'ClusterIP', clusterIp: '10.96.2.77', port: '9090/TCP' },
  { name: 'grafana', namespace: 'monitoring', type: 'NodePort', clusterIp: '10.96.9.31', port: '3000/TCP' },
];

export const namespaces = [
  { name: 'demo', pods: 5, status: 'Active' },
  { name: 'shop', pods: 3, status: 'Active' },
  { name: 'jobs', pods: 2, status: 'Active' },
  { name: 'monitoring', pods: 2, status: 'Active' },
  { name: 'kube-system', pods: 4, status: 'Active' },
];

const L = labels(24, 5);
export const resourceCharts = {
  cpu: L.map((t, i) => ({ t, v: series(1, 24, 58, 6, 5)[i], v2: series(2, 24, 40, 5, 3)[i] })),
  memory: L.map((t, i) => ({ t, v: series(3, 24, 68, 3, 4)[i], v2: series(4, 24, 52, 3, 2)[i] })),
  network: L.map((t, i) => ({ t, v: series(5, 24, 120, 25, 30, 0, 400)[i], v2: series(6, 24, 80, 20, 20, 0, 400)[i] })),
  disk: L.map((t, i) => ({ t, v: series(7, 24, 44, 1.5, 3)[i], v2: series(8, 24, 18, 4, 0)[i] })),
};
