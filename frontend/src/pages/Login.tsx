import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BrainCircuit, Eye, EyeOff, ShieldCheck, Wrench } from 'lucide-react';
import { useSession } from '../utils/session';
import { Field } from '../components/Inputs';
import { Modal, useToast } from '../components/Overlays';

export default function Login() {
  const { authed, login } = useSession();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const dest = (loc.state as { from?: string } | null)?.from ?? '/dashboard';

  if (authed) return <Navigate to={dest} replace />;

  const go = () => { setBusy(true); setTimeout(() => { login(); nav(dest, { replace: true }); }, 500); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 6) return setErr('Password must be at least 6 characters.');
    setErr('');
    go();
  };

  return (
    <div className="login">
      <section className="login-hero" aria-label="About PREDICTA">
        <div className="brand" style={{ padding: 0 }}>
          <span className="brand-mark"><Activity size={20} color="#fff" aria-hidden /></span>
          <span><span className="brand-name" style={{ display: 'block' }}>PREDICTA</span><span className="brand-sub">AI Infrastructure Intelligence</span></span>
        </div>
        <div className="stack" style={{ gap: 24 }}>
          <h2>Predict infrastructure failures before they reach your users.</h2>
          <div className="feat"><BrainCircuit size={20} /><div><strong style={{ color: '#fff' }}>Predictive risk scoring</strong><br />Machine-learning risk scores from live Kubernetes telemetry.</div></div>
          <div className="feat"><Wrench size={20} /><div><strong style={{ color: '#fff' }}>Safe automated recovery</strong><br />Only predefined, verified actions – never arbitrary commands.</div></div>
          <div className="feat"><ShieldCheck size={20} /><div><strong style={{ color: '#fff' }}>Measured against a baseline</strong><br />Compare against standard Kubernetes autoscaling.</div></div>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Final Year Project prototype · Demo environment · Simulated data</div>
      </section>

      <div className="login-form-wrap">
        <div className="login-card">
          <div className="mobile-brand" style={{ display: 'none' }} />
          <h1 style={{ fontSize: 26, letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p className="muted" style={{ margin: '4px 0 20px' }}>Sign in to the PREDICTA control center.</p>
          <form className="stack" onSubmit={submit} noValidate>
            {err && <div className="banner demo" role="alert" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>{err}</div>}
            <Field label="Email">
              {(id) => <input id={id} className="input" type="email" autoComplete="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
            <Field label="Password">
              {(id) => (
                <div className="input-wrap">
                  <input id={id} className="input" style={{ paddingLeft: 12, paddingRight: 44 }} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" className="btn btn-ghost btn-icon btn-sm clear" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              )}
            </Field>
            <div className="row between">
              <label className="check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => setForgot(true)}>Forgot password?</button>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            <div className="row" style={{ color: 'var(--text-3)', flexWrap: 'nowrap' }}><hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--border)' }} /> or <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--border)' }} /></div>
            <button className="btn btn-block" type="button" disabled={busy} onClick={go}>Continue with demo account</button>
            <p className="help" style={{ textAlign: 'center' }}>Mock authentication – no credentials are verified or stored.</p>
          </form>
        </div>
      </div>

      {forgot && (
        <Modal title="Reset password" onClose={() => setForgot(false)}
          footer={<><button className="btn" onClick={() => setForgot(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setForgot(false); toast('Reset link sent (simulated)'); }}>Send reset link</button></>}>
          <p className="muted" style={{ marginBottom: 12 }}>Enter your email and we’ll “send” a reset link. (Simulated – no email is sent.)</p>
          <Field label="Email">{(id) => <input id={id} className="input" type="email" defaultValue={email} />}</Field>
        </Modal>
      )}
    </div>
  );
}
