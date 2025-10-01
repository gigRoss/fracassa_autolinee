import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { getRideById, updateRide, RideWithStops } from "@/app/lib/ridesStore";
import { emitAudit } from "@/app/lib/adminData";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rideId } = await params;
  const existing = await getRideById(rideId);
  if (!existing) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  try {
    const body = (await req.json()) as Partial<Omit<RideWithStops, "id">>;

    // Basic validations
    const hhmm = /^\d{2}:\d{2}$/;
    if (body.departureTime && !hhmm.test(body.departureTime)) {
      return NextResponse.json({ error: "Formato orario partenza non valido (HH:MM)" }, { status: 400 });
    }
    if (body.arrivalTime && !hhmm.test(body.arrivalTime)) {
      return NextResponse.json({ error: "Formato orario arrivo non valido (HH:MM)" }, { status: 400 });
    }

    const updated = await updateRide(rideId, body);
    if (!updated) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    const changes = [] as Array<{ field: string; before?: string; after?: string }>;
    const pushChange = (field: string, beforeVal: unknown, afterVal: unknown) => {
      if (beforeVal !== afterVal) {
        changes.push({ field, before: beforeVal !== undefined ? String(beforeVal) : undefined, after: afterVal !== undefined ? String(afterVal) : undefined });
      }
    };
    if (body.lineName !== undefined) pushChange("lineName", existing.lineName, updated.lineName);
    if (body.originStopId !== undefined) pushChange("originStopId", existing.originStopId, updated.originStopId);
    if (body.destinationStopId !== undefined) pushChange("destinationStopId", existing.destinationStopId, updated.destinationStopId);
    if (body.departureTime !== undefined) pushChange("departureTime", existing.departureTime, updated.departureTime);
    if (body.arrivalTime !== undefined) pushChange("arrivalTime", existing.arrivalTime, updated.arrivalTime);
    if (body.intermediateStops !== undefined) pushChange("intermediateStops", JSON.stringify(existing.intermediateStops ?? []), JSON.stringify(updated.intermediateStops ?? []));
    if (body.archived !== undefined) pushChange("archived", existing.archived ?? false, updated.archived ?? false);

    emitAudit({
      actor: session.sub,
      type: "ride.updated",
      rideId,
      description: `Corsa ${updated.lineName} aggiornata` + (changes.length ? ` (${changes.map(c => `${c.field}`).join(", ")})` : ""),
      changes,
    });

    const res = NextResponse.json(updated, { status: 200 });
    // If undoing archived state, drop it from cookie
    if (body.archived === false) {
      const cookieVal = req.cookies.get("archived_rides")?.value || "";
      const setIds = new Set(cookieVal.split(",").filter(Boolean));
      setIds.delete(rideId);
      res.cookies.set("archived_rides", Array.from(setIds).join(","), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rideId } = await params;
  const existing = await getRideById(rideId);
  if (!existing) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const archived = await updateRide(rideId, { archived: true });
  if (!archived) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  emitAudit({
    actor: session.sub,
    type: "ride.deleted",
    rideId,
    description: `Corsa ${archived.lineName} archiviata`,
    changes: [{ field: "archived", before: String(existing.archived ?? false), after: String(true) }],
  });

  const cookieVal = req.cookies.get("archived_rides")?.value || "";
  const setIds = new Set(cookieVal.split(",").filter(Boolean));
  setIds.add(rideId);
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set("archived_rides", Array.from(setIds).join(","), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}


