import { NextResponse } from "next/server";
import { listRides } from "@/app/lib/ridesStore";

export async function GET() {
  try {
    const rides = await listRides();
    const visible = rides.filter((r) => !r.archived);
    return NextResponse.json(visible);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


