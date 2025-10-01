import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { getStopById, updateStop, deleteStop } from "@/app/lib/stopsStore";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getStopById(id);
  if (!existing) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const city = typeof body?.city === 'string' ? body.city.trim() : undefined;
    if ((name !== undefined && name.length === 0) || (city !== undefined && city.length === 0)) {
      return NextResponse.json({ error: "Campi non validi" }, { status: 400 });
    }

    const updated = await updateStop(id, { name, city });
    return NextResponse.json(updated, { status: 200 });
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

  const { id } = await params;
  const existing = await getStopById(id);
  if (!existing) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }

  try {
    await deleteStop(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    // Likely constraint error due to references
    return NextResponse.json({ error: e?.message || "Impossibile eliminare la fermata" }, { status: 400 });
  }
}


