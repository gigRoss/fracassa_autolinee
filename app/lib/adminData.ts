import { nowInItaly, formatRelativeItalian } from "./dateUtils";

export type KpiSummary = {
  scheduledToday: number;
  changedLast7d: number;
  recentChanges: Array<{ id: string; when: string; description: string }>;
};

export async function fetchKpis(): Promise<KpiSummary> {
  // Simula latenza
  await new Promise((r) => setTimeout(r, 300));
  const recent = getRecentAudit();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const changedLast7d = auditEvents.filter((e) => e.timestamp >= sevenDaysAgo).length;
  return {
    scheduledToday: 42,
    changedLast7d,
    recentChanges: recent,
  };
}

export type AuditChange = {
  field: string;
  before?: string;
  after?: string;
};

export type AuditEvent = {
  id: string;
  when: string;
  timestamp: number;
  actor: string;
  type: "ride.updated" | "ride.created" | "ride.deleted";
  rideId: string;
  description: string;
  changes?: AuditChange[];
};

const auditEvents: AuditEvent[] = [];

export function emitAudit(event: Omit<AuditEvent, "id" | "when" | "timestamp">) {
  const now = nowInItaly();
  const label = formatRelativeItalian(now);
  const id = `chg-${String(auditEvents.length + 1).padStart(3, "0")}`;
  const complete: AuditEvent = { id, when: label, timestamp: now.getTime(), ...event };
  auditEvents.unshift(complete);
  // keep last 50
  if (auditEvents.length > 50) auditEvents.length = 50;
}

export function getRecentAudit(): Array<{ id: string; when: string; description: string }> {
  return auditEvents.map(({ id, when, description }) => ({ id, when, description }));
}

export function getAuditEventsFull(): AuditEvent[] {
  return auditEvents.slice();
}


