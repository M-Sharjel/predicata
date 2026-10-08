import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

function read(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

export type ThemePref = 'light' | 'dark' | 'system';

interface Ctx {
  authed: boolean;
  login: () => void;
  logout: () => void;
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
}
const SessionCtx = createContext<Ctx>(null as unknown as Ctx);
export const useSession = () => useContext(SessionCtx);

/** Mock session only – there is no real authentication in this GUI phase. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => read('predicta.auth', '0') === '1');
  const [theme, setThemeState] = useState<ThemePref>(() => read('predicta.theme', 'light') as ThemePref);

  useEffect(() => {
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  const login = useCallback(() => { write('predicta.auth', '1'); setAuthed(true); }, []);
  const logout = useCallback(() => { write('predicta.auth', '0'); setAuthed(false); }, []);
  const setTheme = useCallback((t: ThemePref) => { write('predicta.theme', t); setThemeState(t); }, []);

  return <SessionCtx.Provider value={{ authed, login, logout, theme, setTheme }}>{children}</SessionCtx.Provider>;
}
