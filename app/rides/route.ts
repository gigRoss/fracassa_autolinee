import { NextResponse } from "next/server";
import { listRides } from "@/app/lib/ridesStore";

export async function GET() {
  try {
    const rides = await listRides();
    const visible = rides.filter((r) => !r.archived);
    // Map 'id' to 'slug' for the public API
    const mapped = visible.map((r) => ({
      slug: r.id,
      lineName: r.lineName,
      originStopId: r.originStopId,
      destinationStopId: r.destinationStopId,
      departureTime: r.departureTime,
      arrivalTime: r.arrivalTime,
      originFascia: r.originFascia,
      destinationFascia: r.destinationFascia,
      intermediateStops: r.intermediateStops,
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


