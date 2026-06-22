import { ScanReport } from "@/lib/types";

export interface DriftResult {
  hasDrift: boolean;
  drops: Array<{ metric: string; previous: number; current: number; delta: number }>;
}

const DRIFT_THRESHOLD = 10; // points drop required to trigger an alert

export function detectDrift(previous: ScanReport, current: ScanReport): DriftResult {
  const pairs = [
    { metric: "Alignment Score", previous: previous.alignment.overall, current: current.alignment.overall },
    { metric: "Adoption Score", previous: previous.adoption.overall, current: current.adoption.overall },
    { metric: "Architecture Score", previous: previous.architecture.overall, current: current.architecture.overall },
  ];

  const drops = pairs
    .map((p) => ({ ...p, delta: p.previous - p.current }))
    .filter((p) => p.delta >= DRIFT_THRESHOLD);

  return { hasDrift: drops.length > 0, drops };
}
