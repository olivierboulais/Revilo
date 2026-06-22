"use client";

import { useRef, useState, useEffect } from "react";

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
  // Real, consistent pixel coordinate space (no mixed-unit viewBox) so
  // stroke widths and font sizes read at sane, legible sizes regardless of
  // container width. Width is measured from the actual rendered container.
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

  const padLeft = 36;
  const padRight = 28;
  const padTop = 16;
  const padBottom = 28;
  const plotW = Math.max(width - padLeft - padRight, 1);
  const plotH = height - padTop - padBottom;

  const xFor = (i: number) => padLeft + (labels.length > 1 ? (i / (labels.length - 1)) * plotW : plotW / 2);
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
      const midY = (y0 + y1) / 2;
      d += ` Q ${x0} ${y0} ${midX} ${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0]} ${last[1]}`;
    return d;
  }

  return (
    <div ref={containerRef}>
      <div className="flex items-center gap-4 mb-3">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11.5px] text-gray">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
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
