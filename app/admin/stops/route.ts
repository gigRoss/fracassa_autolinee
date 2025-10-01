import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { createStop, listStops } from "@/app/lib/stopsStore";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const stops = await listStops();
    return NextResponse.json(stops);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
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
    const created = await createStop({ city: body.city, name: body.name });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Database error:', e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


