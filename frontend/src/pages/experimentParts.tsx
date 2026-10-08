import { TrendingDown, TrendingUp } from 'lucide-react';

export interface CompareItem { label: string; unit: string; b: number; p: number; lowerBetter: boolean }

/** Side-by-side Baseline vs PREDICTA tiles. Colour reflects the direction of the (mock) difference only. */
export function CompareCards({ items }: { items: CompareItem[] }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
      {items.map((it) => {
        const better = it.lowerBetter ? it.p < it.b : it.p > it.b;
        const same = it.p === it.b;
        const delta = it.b === 0 ? 0 : Math.round(((it.p - it.b) / it.b) * 100);
        const max = Math.max(it.b, it.p, 1);
        return (
          <div key={it.label} className="card card-pad" style={{ boxShadow: 'none', background: 'var(--surface-2)' }}>
            <div className="muted" style={{ fontWeight: 600 }}>{it.label}</div>
            <div className="compare-bar" style={{ marginTop: 10 }}>
              <div className="compare-row"><span>Baseline</span><div className="bar"><i className="fill-amber" style={{ width: `${(it.b / max) * 100}%` }} /></div><strong>{it.b}{it.unit}</strong></div>
              <div className="compare-row"><span>PREDICTA</span><div className="bar"><i className="fill-blue" style={{ width: `${(it.p / max) * 100}%` }} /></div><strong>{it.p}{it.unit}</strong></div>
            </div>
            <div className="kpi-trend" style={{ marginTop: 10, color: same ? 'var(--text-3)' : better ? 'var(--green)' : 'var(--red)' }}>
              {same ? '—' : better ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {same ? 'No difference' : `${delta > 0 ? '+' : ''}${delta}% vs baseline (mock)`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
