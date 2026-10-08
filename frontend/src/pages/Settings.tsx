import { useState } from 'react';
import { PageHeader, Card } from '../components/Cards';
import { DemoBanner } from '../components/Badges';
import { SelectField, SettingRow, Switch, Tabs } from '../components/Inputs';
import { ConfirmDialog, useToast } from '../components/Overlays';
import { useSession, type ThemePref } from '../utils/session';

type Section = 'general' | 'monitoring' | 'prediction' | 'recovery' | 'notifications' | 'appearance' | 'security';

const defaults = {
  orgName: 'PREDICTA Demo Lab', timezone: 'Asia/Karachi', demoMode: true,
  collect: '15', predictEvery: '60', retention: '30',
  medium: 31, high: 61, critical: 81, horizon: '30', model: 'rf',
  autoRecovery: true, approval: false, maxRetries: 2, cooldown: 300,
  allowed: { SCALE_UP: true, SCALE_DOWN: true, RESTART_UNHEALTHY_POD: true, ROLLBACK_DEPLOYMENT: false, NOTIFY_ADMIN: true },
  nEmail: true, nPush: false, nCritical: true, nRecovery: true, nExperiment: false,
  compact: false, mfa: false, session: '60',
};
type Form = typeof defaults;

export default function Settings() {
  const [s, setS] = useState<Form>(defaults);
  const [saved, setSaved] = useState<Form>(defaults);
  const [tab, setTab] = useState<Section>('general');
  const [confirmReset, setConfirmReset] = useState(false);
  const { theme, setTheme } = useSession();
  const toast = useToast();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setS((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);

  return (
    <div className="stack">
      <PageHeader
        title="Settings" subtitle="Configure monitoring, prediction and recovery behaviour"
        crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Settings' }]}
        actions={<>
          <button className="btn" disabled={!dirty} onClick={() => setConfirmReset(true)}>Discard changes</button>
          <button className="btn btn-primary" disabled={!dirty} onClick={() => { setSaved(s); toast('Settings saved (UI only – nothing applied)'); }}>Save changes</button>
        </>}
      />
      <DemoBanner>These are UI controls only. No infrastructure changes are made at this stage.</DemoBanner>
      <Tabs<Section> label="Settings sections" value={tab} onChange={setTab} tabs={[
        { id: 'general', label: 'General' }, { id: 'monitoring', label: 'Monitoring' }, { id: 'prediction', label: 'Prediction' }, { id: 'recovery', label: 'Recovery' },
        { id: 'notifications', label: 'Notifications' }, { id: 'appearance', label: 'Appearance' }, { id: 'security', label: 'Security' },
      ]} />

      <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'general' && (
          <Card title="General">
            <SettingRow title="Organization name" desc="Shown in reports"><input className="input" aria-label="Organization name" value={s.orgName} onChange={(e) => set('orgName', e.target.value)} /></SettingRow>
            <SettingRow title="Time zone"><select className="select" aria-label="Time zone" value={s.timezone} onChange={(e) => set('timezone', e.target.value)}><option>Asia/Karachi</option><option>UTC</option><option>Europe/London</option><option>America/New_York</option></select></SettingRow>
            <SettingRow inline title="Demo mode" desc="Use simulated metrics and predictions"><Switch label="Demo mode" checked={s.demoMode} onChange={(v) => set('demoMode', v)} /></SettingRow>
          </Card>
        )}
        {tab === 'monitoring' && (
          <Card title="Monitoring">
            <SettingRow title="Metric collection interval" desc="How often metrics are scraped"><select className="select" aria-label="Metric collection interval" value={s.collect} onChange={(e) => set('collect', e.target.value)}><option value="5">5 seconds</option><option value="15">15 seconds</option><option value="30">30 seconds</option><option value="60">1 minute</option></select></SettingRow>
            <SettingRow title="Prediction interval" desc="How often risk is re-evaluated"><select className="select" aria-label="Prediction interval" value={s.predictEvery} onChange={(e) => set('predictEvery', e.target.value)}><option value="30">30 seconds</option><option value="60">1 minute</option><option value="300">5 minutes</option></select></SettingRow>
            <SettingRow title="Data retention" desc="How long history is kept"><select className="select" aria-label="Data retention" value={s.retention} onChange={(e) => set('retention', e.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></SettingRow>
          </Card>
        )}
        {tab === 'prediction' && (
          <Card title="Prediction">
            <SettingRow title="Model selection" desc="Mock list – no model is loaded yet"><select className="select" aria-label="Model" value={s.model} onChange={(e) => set('model', e.target.value)}><option value="rf">Random Forest v1.2 (demo)</option><option value="gb">Gradient Boosting v0.9 (demo)</option><option value="iso">Isolation Forest (anomaly, demo)</option></select></SettingRow>
            <SettingRow title="Prediction horizon"><select className="select" aria-label="Prediction horizon" value={s.horizon} onChange={(e) => set('horizon', e.target.value)}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></SettingRow>
            {([['medium', 'MEDIUM risk threshold'], ['high', 'HIGH risk threshold'], ['critical', 'CRITICAL risk threshold']] as const).map(([k, label]) => (
              <SettingRow key={k} title={label} desc={`Score ≥ ${s[k]}%`}>
                <input type="range" className="range" min={10} max={99} aria-label={label} value={s[k]} onChange={(e) => set(k, Number(e.target.value))} />
              </SettingRow>
            ))}
          </Card>
        )}
        {tab === 'recovery' && (
          <Card title="Recovery">
            <SettingRow inline title="Enable automatic recovery" desc="When off, actions are only recommended"><Switch label="Enable automatic recovery" checked={s.autoRecovery} onChange={(v) => set('autoRecovery', v)} /></SettingRow>
            <SettingRow inline title="Require approval" desc="An administrator must approve each action"><Switch label="Require approval" checked={s.approval} onChange={(v) => set('approval', v)} /></SettingRow>
            <SettingRow title="Allowed actions" desc="Only predefined safe actions can be enabled">
              <div className="stack" style={{ gap: 8 }}>
                {Object.entries(s.allowed).map(([k, v]) => (
                  <label key={k} className="check"><input type="checkbox" checked={v} onChange={(e) => set('allowed', { ...s.allowed, [k]: e.target.checked })} /> <span className="mono">{k}</span></label>
                ))}
              </div>
            </SettingRow>
            <SettingRow title="Maximum retries"><input type="number" min={0} max={5} className="input" aria-label="Maximum retries" value={s.maxRetries} onChange={(e) => set('maxRetries', Math.min(5, Math.max(0, Number(e.target.value))))} /></SettingRow>
            <SettingRow title="Cooldown period (seconds)" desc="Minimum wait between actions on a service"><input type="number" min={0} step={30} className="input" aria-label="Cooldown period" value={s.cooldown} onChange={(e) => set('cooldown', Math.max(0, Number(e.target.value)))} /></SettingRow>
          </Card>
        )}
        {tab === 'notifications' && (
          <Card title="Notifications">
            <SettingRow inline title="Email notifications"><Switch label="Email notifications" checked={s.nEmail} onChange={(v) => set('nEmail', v)} /></SettingRow>
            <SettingRow inline title="Push notifications"><Switch label="Push notifications" checked={s.nPush} onChange={(v) => set('nPush', v)} /></SettingRow>
            <SettingRow inline title="CRITICAL risk alerts"><Switch label="Critical alerts" checked={s.nCritical} onChange={(v) => set('nCritical', v)} /></SettingRow>
            <SettingRow inline title="Recovery results"><Switch label="Recovery results" checked={s.nRecovery} onChange={(v) => set('nRecovery', v)} /></SettingRow>
            <SettingRow inline title="Experiment completion"><Switch label="Experiment completion" checked={s.nExperiment} onChange={(v) => set('nExperiment', v)} /></SettingRow>
          </Card>
        )}
        {tab === 'appearance' && (
          <Card title="Appearance">
            <SettingRow title="Theme" desc="Applied immediately">
              <SelectField label="Theme" value={theme} onChange={(v) => setTheme(v as ThemePref)} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'Match system' }]} />
            </SettingRow>
            <SettingRow inline title="Compact tables" desc="Not wired up yet"><Switch label="Compact tables" checked={s.compact} onChange={(v) => set('compact', v)} /></SettingRow>
          </Card>
        )}
        {tab === 'security' && (
          <Card title="Security">
            <SettingRow inline title="Two-factor authentication" desc="Mock toggle"><Switch label="Two-factor authentication" checked={s.mfa} onChange={(v) => set('mfa', v)} /></SettingRow>
            <SettingRow title="Session timeout"><select className="select" aria-label="Session timeout" value={s.session} onChange={(e) => set('session', e.target.value)}><option value="15">15 minutes</option><option value="60">1 hour</option><option value="480">8 hours</option></select></SettingRow>
            <p className="help" style={{ paddingTop: 10 }}>Kubernetes credentials are never exposed to the browser; the backend will hold least-privilege access.</p>
          </Card>
        )}
      </div>

      {confirmReset && (
        <ConfirmDialog title="Discard unsaved changes?" message="Your edits on this page will be lost." confirmLabel="Discard" danger
          onCancel={() => setConfirmReset(false)} onConfirm={() => { setS(saved); setConfirmReset(false); toast('Changes discarded', 'info'); }} />
      )}
    </div>
  );
}
