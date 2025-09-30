import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { getAuditEventsFull } from "@/app/lib/adminData";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const actor = url.searchParams.get("actor") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const fromStr = url.searchParams.get("from") || undefined;
  const toStr = url.searchParams.get("to") || undefined;

  const fromTs = fromStr ? Date.parse(fromStr) : undefined;
  const toTs = toStr ? Date.parse(toStr) : undefined;

  const events = getAuditEventsFull().filter((e) => {
    if (actor && e.actor !== actor) return false;
    if (type && e.type !== type) return false;
    if (fromTs !== undefined && e.timestamp < fromTs) return false;
    if (toTs !== undefined && e.timestamp > toTs) return false;
    return true;
  });

  return NextResponse.json(events);
}


