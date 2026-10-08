import type { ReactNode } from 'react';
import type { ActionType, HealthState, IncidentStatus, RecoveryResult, RiskLevel } from '../types';
import { ACTION_LABEL } from '../utils/format';

export type Tone = 'green' | 'amber' | 'orange' | 'red' | 'blue' | 'gray' | 'violet';

export function Badge({ tone = 'gray', children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`badge b-${tone}`}>
      {dot && <span className="dot" aria-hidden />}
      {children}
    </span>
  );
}

export const riskTone: Record<RiskLevel, Tone> = { LOW: 'green', MEDIUM: 'amber', HIGH: 'orange', CRITICAL: 'red' };

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge tone={riskTone[level]}>{level}</Badge>;
}

const healthTone: Record<HealthState, Tone> = { Healthy: 'green', Warning: 'amber', Failed: 'red' };
export function HealthBadge({ state }: { state: HealthState }) {
  return <Badge tone={healthTone[state]}>{state}</Badge>;
}

const incTone: Record<IncidentStatus, Tone> = { Open: 'red', Investigating: 'amber', Resolved: 'green', 'Auto-Recovered': 'blue' };
const recTone: Record<RecoveryResult, Tone> = { Success: 'green', Failed: 'red', Pending: 'amber', 'In Progress': 'blue' };

export function StatusBadge({ status }: { status: IncidentStatus | RecoveryResult | string }) {
  const tone = (incTone as Record<string, Tone>)[status] ?? (recTone as Record<string, Tone>)[status] ?? 'gray';
  return <Badge tone={tone}>{status}</Badge>;
}

export function ActionTag({ action }: { action: ActionType }) {
  return <span className="badge b-gray mono" style={{ fontFamily: 'var(--mono)', fontSize: 11.5 }}>{ACTION_LABEL[action] ?? action}</span>;
}

export function DemoBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="banner demo" role="note">
      <strong>DEMO DATA</strong>
      <span>{children ?? 'All values on this page are simulated mock data. No real infrastructure is connected.'}</span>
    </div>
  );
}
