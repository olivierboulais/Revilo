interface Series {
  label: string;
  color: string;
  values: number[];
}

export function TrendChart({
  labels,
  series,
  height = 220,
  yMax = 100,
  yStep = 25,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  yMax?: number;
  yStep?: number;
}) {
  const width = 100; // percentage-based viewBox, scales to container
  const padLeft = 6;
  const padRight = 2;
  const padTop = 6;
  const padBottom = 10;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xFor = (i: number) => padLeft + (i / (labels.length - 1)) * plotW;
  const yFor = (v: number) => padTop + plotH - (v / yMax) * plotH;

  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  function smoothPath(values: number[]): string {
    if (values.length === 0) return "";
    const pts = values.map((v, i) => [xFor(i), yFor(v)] as const);
    if (pts.length < 3) {
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
    }
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const midX = (x0 + x1) / 2;
      d += ` Q ${x0} ${y0} ${midX} ${(y0 + y1) / 2}`;
    }
    d += ` T ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
    return d;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11.5px] text-gray">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {yTicks.map((t) => (
          <line key={t} x1={padLeft} x2={width - padRight} y1={yFor(t)} y2={yFor(t)} stroke="rgba(28,28,26,0.06)" strokeWidth="0.3" />
        ))}
        {yTicks.map((t) => (
          <text key={t} x={0} y={yFor(t)} fontSize="2.6" fill="#A8A6A0" dominantBaseline="middle">
            {t}
          </text>
        ))}
        {series.map((s) => (
          <path key={s.label} d={smoothPath(s.values)} fill="none" stroke={s.color} strokeWidth="0.6" strokeLinecap="round" />
        ))}
        {series.map((s) =>
          s.values.map((v, i) => (
            <circle key={`${s.label}-${i}`} cx={xFor(i)} cy={yFor(v)} r={i === s.values.length - 1 ? 0.9 : 0} fill={s.color} />
          ))
        )}
        {labels.map((l, i) => (
          <text key={l} x={xFor(i)} y={height - 2} fontSize="2.6" fill="#A8A6A0" textAnchor="middle">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
