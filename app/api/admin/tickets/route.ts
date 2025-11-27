import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/lib/auth';
import { getAllTickets } from '@/app/lib/ticketUtils';
import { getDb } from '@/app/lib/db';
import { stops } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';

const TICKETS_SESSION_COOKIE = 'tickets_admin_session';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(TICKETS_SESSION_COOKIE)?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all tickets
    const allTickets = await getAllTickets();

    // Get all stops for mapping
    const db = getDb();
    const allStops = await db.select().from(stops);
    const stopIdToStop = Object.fromEntries(allStops.map((s) => [s.id, s] as const));

    // Enrich tickets with stop names
    const enrichedTickets = allTickets.map((ticket) => {
      const originStop = stopIdToStop[ticket.originStopId];
      const destinationStop = stopIdToStop[ticket.destinationStopId];

      return {
        ...ticket,
        originStopName: originStop ? `${originStop.city} - ${originStop.name}` : ticket.originStopId,
        destinationStopName: destinationStop ? `${destinationStop.city} - ${destinationStop.name}` : ticket.destinationStopId,
      };
    });

    return NextResponse.json(enrichedTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

