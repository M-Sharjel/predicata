import { useState } from 'react';
import { Card, PageHeader } from '../components/Cards';
import { DemoBanner } from '../components/Badges';
import { Field, SettingRow, Switch, Tabs } from '../components/Inputs';
import { Modal, useToast } from '../components/Overlays';
import { useSession, type ThemePref } from '../utils/session';

type Tab = 'info' | 'account' | 'notif' | 'theme' | 'security';

export default function Profile() {
  const [tab, setTab] = useState<Tab>('info');
  const [name, setName] = useState('Sharjeel A.');
  const [email, setEmail] = useState('admin@predicta.demo');
  const [n, setN] = useState({ email: true, push: false, digest: true });
  const [pwOpen, setPwOpen] = useState(false);
  const [mfa, setMfa] = useState(false);
  const { theme, setTheme } = useSession();
  const toast = useToast();
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="stack">
      <PageHeader title="Profile" subtitle="Your account and preferences" crumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Profile' }]} />
      <DemoBanner>Mock profile – nothing is saved to a server.</DemoBanner>
      <Tabs<Tab> label="Profile sections" value={tab} onChange={setTab} tabs={[{ id: 'info', label: 'Information' }, { id: 'account', label: 'Account' }, { id: 'notif', label: 'Notifications' }, { id: 'theme', label: 'Theme' }, { id: 'security', label: 'Security' }]} />
      <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'info' && (
          <Card title="Profile information">
            <div className="row" style={{ marginBottom: 16, flexWrap: 'nowrap' }}>
              <span className="avatar lg" aria-hidden>{initials}</span>
              <div><div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div><div className="muted">Administrator (demo)</div></div>
            </div>
            <div className="grid g-2">
              <Field label="Full name">{(id) => <input id={id} className="input" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
              <Field label="Email">{(id) => <input id={id} className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
              <Field label="Role">{(id) => <input id={id} className="input" value="Administrator" disabled />}</Field>
              <Field label="Organization">{(id) => <input id={id} className="input" value="PREDICTA Demo Lab" disabled />}</Field>
            </div>
            <div className="row" style={{ marginTop: 16 }}><button className="btn btn-primary" onClick={() => toast('Profile updated (simulated)')}>Save profile</button></div>
          </Card>
        )}
        {tab === 'account' && (
          <Card title="Account settings">
            <SettingRow title="Language"><select className="select" aria-label="Language"><option>English</option><option>اردو</option></select></SettingRow>
            <SettingRow title="Time zone"><select className="select" aria-label="Time zone"><option>Asia/Karachi</option><option>UTC</option></select></SettingRow>
            <SettingRow title="Default landing page"><select className="select" aria-label="Landing page"><option>Overview</option><option>Predictions</option><option>Incidents</option></select></SettingRow>
          </Card>
        )}
        {tab === 'notif' && (
          <Card title="Notification preferences">
            <SettingRow inline title="Email alerts"><Switch label="Email alerts" checked={n.email} onChange={(v) => setN({ ...n, email: v })} /></SettingRow>
            <SettingRow inline title="Push alerts"><Switch label="Push alerts" checked={n.push} onChange={(v) => setN({ ...n, push: v })} /></SettingRow>
            <SettingRow inline title="Daily digest"><Switch label="Daily digest" checked={n.digest} onChange={(v) => setN({ ...n, digest: v })} /></SettingRow>
          </Card>
        )}
        {tab === 'theme' && (
          <Card title="Theme preferences">
            <div className="cards-2" role="radiogroup" aria-label="Theme">
              {(['light', 'dark', 'system'] as ThemePref[]).map((t) => (
                <label key={t} className="card card-pad check" style={{ boxShadow: 'none', borderColor: theme === t ? 'var(--primary)' : undefined }}>
                  <input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} /> <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{t === 'system' ? 'Match system' : t}</span>
                </label>
              ))}
            </div>
          </Card>
        )}
        {tab === 'security' && (
          <Card title="Security settings">
            <SettingRow inline title="Two-factor authentication" desc="Mock toggle"><Switch label="Two-factor authentication" checked={mfa} onChange={setMfa} /></SettingRow>
            <SettingRow inline title="Password" desc="Last changed 30 days ago (mock)"><button className="btn" onClick={() => setPwOpen(true)}>Change password</button></SettingRow>
            <SettingRow inline title="Active sessions" desc="1 session (this device)"><button className="btn" onClick={() => toast('Other sessions signed out (simulated)')}>Sign out others</button></SettingRow>
          </Card>
        )}
      </div>
      {pwOpen && (
        <Modal title="Change password" onClose={() => setPwOpen(false)}
          footer={<><button className="btn" onClick={() => setPwOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setPwOpen(false); toast('Password changed (simulated)'); }}>Update password</button></>}>
          <div className="stack">
            <Field label="Current password">{(id) => <input id={id} className="input" type="password" autoComplete="current-password" />}</Field>
            <Field label="New password">{(id) => <input id={id} className="input" type="password" autoComplete="new-password" />}</Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
