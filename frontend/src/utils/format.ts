import type { RiskLevel } from '../types';

/** Deterministic PRNG so mock charts look the same on every reload. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function series(seed: number, n: number, base: number, amp: number, drift = 0, min = 0, max = 100): number[] {
  const r = seeded(seed);
  return Array.from({ length: n }, (_, i) => {
    const v = base + drift * (i / Math.max(1, n - 1)) + (r() - 0.5) * 2 * amp;
    return Math.round(Math.min(max, Math.max(min, v)) * 10) / 10;
  });
}

export function riskLevel(score: number): RiskLevel {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

/** Fixed "now" for mock data so timestamps are stable. */
export const MOCK_NOW = new Date('2026-10-08T14:32:00');

export function ago(minutes: number): string {
  return new Date(MOCK_NOW.getTime() - minutes * 60_000).toISOString();
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, ${fmtTime(iso)}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function fmtSeconds(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export function labels(n: number, stepMin: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(MOCK_NOW.getTime() - (n - 1 - i) * stepMin * 60_000);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  });
}

export const ACTION_LABEL: Record<string, string> = {
  SCALE_UP: 'Scale Up',
  SCALE_DOWN: 'Scale Down',
  RESTART_UNHEALTHY_POD: 'Restart Pod',
  ROLLBACK_DEPLOYMENT: 'Rollback',
  NOTIFY_ADMIN: 'Notify Admin',
  NO_ACTION: 'No Action',
};
