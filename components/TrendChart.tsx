"use client";

import { useRef, useState, useEffect, useMemo } from "react";

interface Series {
  label: string;
  color: string;
  values: number[];
}

// Computes a "nice" axis domain and tick set from the actual data range,
// rather than always anchoring at a fixed 0-100. When several series sit
// close together (e.g. 70-86), a fixed 0-100 axis flattens all of them into
// a thin band and the differences become illegible. Zooming into the real
// range — padded and rounded to clean numbers — keeps the chart honest
// (it's still linear, still starts from a real tick) while actually showing
// the shape of the data. A small note in the UI discloses the zoomed axis.
function computeNiceDomain(allValues: number[], tickCount = 4): { min: number; max: number; ticks: number[] } {
  if (allValues.length === 0) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };

  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const range = dataMax - dataMin;

  // Pad by 20% of the range (or a flat minimum pad if the range is ~0) so
  // lines never touch the very top/bottom edge of the plot.
  const pad = Math.max(range * 0.2, 3);
  let min = dataMin - pad;
  let max = dataMax + pad;

  // Round the step to a clean value (1, 2, 5, 10, 25, 50...) so tick labels
  // aren't awkward fractions.
  const rawStep = (max - min) / tickCount;
  const niceSteps = [1, 2, 5, 10, 25, 50, 100];
  const step = niceSteps.find((s) => s >= rawStep) ?? niceSteps[niceSteps.length - 1];

  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  min = Math.max(min, 0); // scores never go negative
  max = Math.min(max, 100); // scores never exceed 100

  const ticks: number[] = [];
  for (let v = min; v <= max + 0.001; v += step) ticks.push(Math.round(v));

  return { min, max, ticks };
}

export function TrendChart({
  labels,
  series,
  height = 220,
  insufficient = false,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  insufficient?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { min: yMin, max: yMax, ticks: yTicks } = useMemo(
    () => computeNiceDomain(series.flatMap((s) => s.values)),
    [series]
  );
  const isZoomed = yMin > 0 || yMax < 100;

  const padLeft = 36;
  const padRight = 28;
  const padTop = 16;
  const padBottom = 28;
  const plotW = Math.max(width - padLeft - padRight, 1);
  const plotH = height - padTop - padBottom;

  const xFor = (i: number) => padLeft + (labels.length > 1 ? (i / (labels.length - 1)) * plotW : plotW / 2);
  const yFor = (v: number) => padTop + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

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
      const midY = (y0 + y1) / 2;
      d += ` Q ${x0} ${y0} ${midX} ${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0]} ${last[1]}`;
    return d;
  }

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[11.5px] text-gray">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
        {isZoomed && <span className="text-[10.5px] text-gray/70">Axis zoomed to {yMin}–{yMax} to show detail</span>}
      </div>
      {insufficient && (
        <p className="text-[11.5px] text-gray/70 text-center py-3">
          Not enough data yet — scan a few more times to see a trend line.
        </p>
      )}
      <svg width={width} height={height} className="w-full block" style={{ height }}>
        {yTicks.map((t) => (
          <line key={t} x1={padLeft} x2={width - padRight} y1={yFor(t)} y2={yFor(t)} stroke="rgba(28,28,26,0.08)" strokeWidth="1" />
        ))}
        {yTicks.map((t) => (
          <text key={t} x={padLeft - 10} y={yFor(t)} fontSize="11" fill="#A8A6A0" textAnchor="end" dominantBaseline="middle">
            {t}
          </text>
        ))}
        {series.map((s) => (
          <path key={s.label} d={smoothPath(s.values)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" />
        ))}
        {series.map((s) =>
          s.values.map((v, i) =>
            i === s.values.length - 1 ? (
              <circle key={`${s.label}-${i}`} cx={xFor(i)} cy={yFor(v)} r="3.5" fill={s.color} stroke="#fff" strokeWidth="1.5" />
            ) : null
          )
        )}
        {labels.map((l, i) => (
          <text
            key={l}
            x={xFor(i)}
            y={height - 8}
            fontSize="11"
            fill="#A8A6A0"
            textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
