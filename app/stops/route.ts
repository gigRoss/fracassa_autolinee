import { NextResponse } from "next/server";
import { listStops } from "@/app/lib/stopsStore";

export async function GET() {
  try {
    const stops = await listStops();
    return NextResponse.json(stops);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


