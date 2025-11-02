import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { listRides, createRide, RideWithStops } from "@/app/lib/ridesStore";
import { emitAudit } from "@/app/lib/adminData";
import { NextResponse as _NR } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const archivedCookie = req.cookies.get("archived_rides")?.value || "";
  const archivedIds = new Set(archivedCookie.split(",").filter(Boolean));
  const all = await listRides();
  const visible = all.filter((r) => !archivedIds.has(r.id) && !r.archived);
  return NextResponse.json(visible);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Omit<RideWithStops, "id">;

    // Basic validations
    if (!body.lineName || !body.originStopId || !body.destinationStopId || !body.departureTime || !body.arrivalTime) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    }

    const hhmm = /^\d{2}:\d{2}$/;
    if (!hhmm.test(body.departureTime) || !hhmm.test(body.arrivalTime)) {
      return NextResponse.json({ error: "Formato orario non valido (HH:MM)" }, { status: 400 });
    }

    const created = await createRide({
      lineName: body.lineName,
      originStopId: body.originStopId,
      destinationStopId: body.destinationStopId,
      departureTime: body.departureTime,
      arrivalTime: body.arrivalTime,
      originFascia: body.originFascia,
      destinationFascia: body.destinationFascia,
      intermediateStops: body.intermediateStops ?? [],
    });

    const auditChanges = [
      { field: "lineName", after: created.lineName },
      { field: "originStopId", after: String(created.originStopId) },
      { field: "destinationStopId", after: String(created.destinationStopId) },
      { field: "departureTime", after: created.departureTime },
      { field: "arrivalTime", after: created.arrivalTime },
    ];

    emitAudit({
      actor: session.sub,
      type: "ride.created",
      rideId: created.id,
      description: `Corsa ${created.lineName} creata (${created.departureTime} → ${created.arrivalTime})`,
      changes: auditChanges,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}


