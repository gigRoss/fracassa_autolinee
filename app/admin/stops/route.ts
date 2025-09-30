import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { createStop, listStops, seedStops } from "@/app/lib/stopsStore";

seedStops();

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listStops());
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body?.city || !body?.name) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    }
    const created = createStop({ city: body.city, name: body.name });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}


