import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const axis = { stroke: 'var(--text-3)', fontSize: 11 } as const;
const tip = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)', boxShadow: 'var(--shadow)' },
  labelStyle: { color: 'var(--text-3)' },
};

interface BaseProps {
  data: Record<string, string | number>[];
  height?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
  unit?: string;
  domain?: [number | 'auto', number | 'auto'];
}

/** Wrapper gives charts a labelled region and a CSS-controlled height so they resize with the layout. */
function Frame({ ariaLabel, height = 'md', children }: { ariaLabel: string; height?: string; children: React.ReactElement }) {
  return (
    <div className={`chart ${height === 'sm' ? 'sm' : height === 'lg' ? 'lg' : ''}`} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>{children}</ResponsiveContainer>
    </div>
  );
}

export function AreaTrend({ data, dataKey = 'v', color = 'var(--primary)', thresholds, ...p }: BaseProps & {
  dataKey?: string; color?: string; thresholds?: { y: number; label: string; color: string }[];
}) {
  const id = `ar-${dataKey}-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <Frame {...p}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="t" {...axis} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis {...axis} tickLine={false} axisLine={false} domain={p.domain ?? ['auto', 'auto']} width={46} />
        <Tooltip {...tip} formatter={(v: number) => [`${v}${p.unit ?? ''}`, '']} separator="" />
        {thresholds?.map((t) => (
          <ReferenceLine key={t.y} y={t.y} stroke={t.color} strokeDasharray="4 4" label={{ value: t.label, fill: t.color, fontSize: 10, position: 'insideTopRight' }} />
        ))}
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={false} />
      </AreaChart>
    </Frame>
  );
}

export function MultiLine({ data, series, ...p }: BaseProps & { series: { key: string; name: string; color: string }[] }) {
  return (
    <Frame {...p}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="t" {...axis} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis {...axis} tickLine={false} axisLine={false} width={46} domain={p.domain ?? ['auto', 'auto']} />
        <Tooltip {...tip} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
        ))}
      </LineChart>
    </Frame>
  );
}

export function CompareBars({ data, series, ...p }: BaseProps & { series: { key: string; name: string; color: string }[] }) {
  return (
    <Frame {...p}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="t" {...axis} tickLine={false} axisLine={false} interval={0} />
        <YAxis {...axis} tickLine={false} axisLine={false} width={46} />
        <Tooltip {...tip} cursor={{ fill: 'var(--surface-2)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
      </BarChart>
    </Frame>
  );
}

export function MiniBars({ values, color = 'var(--primary)' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <svg viewBox={`0 0 ${values.length * 8} 40`} width="100%" height="48" preserveAspectRatio="none" aria-hidden>
      {values.map((v, i) => <rect key={i} x={i * 8 + 1} width={6} y={40 - (v / max) * 38} height={(v / max) * 38} rx={2} fill={color} opacity={0.75} />)}
    </svg>
  );
}
