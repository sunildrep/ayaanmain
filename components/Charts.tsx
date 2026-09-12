"use client";

export type Slice = { label: string; value: number; color: string; count?: number };

export function inr(v: number) {
  return `₹${Math.round(Number(v) || 0).toLocaleString("en-IN")}`;
}

export function DonutChart({ data, size = 180, thickness = 28 }: { data: Slice[]; size?: number; thickness?: number }) {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
  if (total <= 0) return <div className="text-sm text-slate-500 text-center py-8">No data yet</div>;
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = data.map((d) => {
    const frac = (Number(d.value) || 0) / total;
    const seg = { ...d, frac, dash: frac * C, offset: acc };
    acc += frac * C;
    return seg;
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {segs.map((s) =>
            s.frac > 0 ? (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${s.dash} ${C - s.dash}`}
                strokeDashoffset={-s.offset}
                strokeLinecap="butt"
              />
            ) : null
          )}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-lg font-bold text-navy-900 leading-none">{inr(total)}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full grid gap-2">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-slate-700 font-medium">{s.label}</span>
            {s.count !== undefined && <span className="text-xs text-slate-400">({s.count})</span>}
            <span className="ml-auto font-semibold text-navy-900">{inr(s.value)}</span>
            <span className="text-xs text-slate-500 w-11 text-right">{(s.frac * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type BarGroup = { label: string; bars: { label: string; value: number; color: string }[] };

export function GroupedBarChart({
  groups,
  height = 200,
  formatValue = inr,
}: {
  groups: BarGroup[];
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...groups.flatMap((g) => g.bars.map((b) => Number(b.value) || 0)));
  if (groups.length === 0) return <div className="text-sm text-slate-500 text-center py-8">No data yet</div>;
  const legend = groups[0]?.bars.map((b) => ({ label: b.label, color: b.color })) ?? [];
  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-4 min-w-full" style={{ height }}>
          {groups.map((g) => (
            <div key={g.label} className="flex-1 min-w-[64px] flex flex-col items-center justify-end gap-1 h-full">
              <div className="flex items-end gap-1.5 h-full w-full justify-center">
                {g.bars.map((b) => {
                  const h = Math.max(2, ((Number(b.value) || 0) / max) * (height - 56));
                  return (
                    <div key={b.label} className="flex flex-col items-center justify-end h-full" title={`${g.label} • ${b.label}: ${formatValue(b.value)}`}>
                      <span className="text-[10px] font-semibold text-slate-600 mb-1 whitespace-nowrap">
                        {(Number(b.value) || 0) >= 1000 ? `${Math.round((Number(b.value) || 0) / 1000)}k` : Math.round(Number(b.value) || 0)}
                      </span>
                      <div className="w-6 sm:w-8 rounded-t-lg transition-all" style={{ height: h, background: b.color }} />
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] font-medium text-slate-600 text-center leading-tight truncate w-full">{g.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
        {legend.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export const CHART_COLORS = {
  navy: "#0b1d3a",
  sky: "#0ea5e9",
  amber: "#f59e0b",
  emerald: "#10b981",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  slate: "#64748b",
  teal: "#14b8a6",
};
