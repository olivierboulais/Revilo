import { ScanReport } from "@/lib/types";
import { findUserByEmail } from "@/lib/db/users";
import { getScanHistoryForUser } from "@/lib/db/scans";

export interface ScoreHistory {
  labels: string[];
  alignment: number[];
  adoption: number[];
  architecture: number[];
  isReal: boolean; // false when falling back to a single-point placeholder
  insufficient: boolean; // true when fewer than MIN_REAL_SCANS exist
}

const MIN_REAL_SCANS = 2; // a single point can't show a "trend"

function relativeLabel(iso: string, now: Date, isMostRecent: boolean): string {
  if (isMostRecent) return "This scan";
  const days = Math.round((now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "Earlier today";
  if (days === 1) return "1d ago";
  if (days < 14) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

// Real history once enough scans exist for a user; otherwise a single-point
// placeholder with the current scan's scores — flagged via `isReal: false`
// and `insufficient: true` so callers can show a "not enough data" message
// instead of a misleading fake trend line.
export async function getScoreHistory(email: string, current: ScanReport): Promise<ScoreHistory> {
  const user = await findUserByEmail(email).catch(() => null);

  if (user) {
    const recentFirst = await getScanHistoryForUser(user.id, 8);
    if (recentFirst.length >= MIN_REAL_SCANS) {
      const oldestFirst = [...recentFirst].reverse();
      const now = new Date();
      return {
        labels: oldestFirst.map((s, i) => relativeLabel(s.scannedAt, now, i === oldestFirst.length - 1)),
        alignment: oldestFirst.map((s) => s.alignment.overall),
        adoption: oldestFirst.map((s) => s.adoption.overall),
        architecture: oldestFirst.map((s) => s.architecture.overall),
        isReal: true,
        insufficient: false,
      };
    }
  }

  // Instead of generating fake historical data, return a single-point dataset
  // showing only the current scan scores so the chart doesn't mislead new users.
  return {
    labels: ["This scan"],
    alignment: [current.alignment.overall],
    adoption: [current.adoption.overall],
    architecture: [current.architecture.overall],
    isReal: false,
    insufficient: true,
  };
}
