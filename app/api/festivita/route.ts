import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { festivita } from "@/app/lib/schema";

/**
 * GET /api/festivita
 * Returns the list of holiday dates to disable in the calendar modal.
 */
export async function GET() {
  try {
    const db = getDb();
    const records = await db.select().from(festivita);

    return NextResponse.json({
      festivita: records,
    });
  } catch (error) {
    console.error("Error fetching festivita:", error);
    return NextResponse.json(
      { error: "Impossibile recuperare le festività" },
      { status: 500 }
    );
  }
}


