// Swap point: once multiple scans are persisted per workspace (see lib/store.ts),
// replace this with a real query over past ScanReport.alignment/adoption/architecture
// values. For now this generates a plausible trailing trend that lands exactly on
// the current real score, so the chart is illustrative but not contradictory.

function seededTrend(end: number, points: number, volatility: number, seed: number): number[] {
  const values: number[] = [];
  let v = Math.max(end - volatility * 1.5, 40);
  for (let i = 0; i < points - 1; i++) {
    const drift = (end - v) / (points - i);
    const noise = (Math.sin(seed + i * 1.7) * volatility) / 2;
    v = Math.min(Math.max(v + drift + noise, 30), 100);
    values.push(Math.round(v));
  }
  values.push(Math.round(end));
  return values;
}

export function generateScoreHistory(currentAlignment: number, currentAdoption: number, currentArchitecture: number) {
  const labels = ["8w ago", "7w ago", "6w ago", "5w ago", "4w ago", "3w ago", "2w ago", "This scan"];
  return {
    labels,
    alignment: seededTrend(currentAlignment, labels.length, 6, 1.3),
    adoption: seededTrend(currentAdoption, labels.length, 5, 4.1),
    architecture: seededTrend(currentArchitecture, labels.length, 4, 7.7),
  };
}
