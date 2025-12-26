import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/app/lib/auth';
import { getDb } from '@/app/lib/db';
import { tickets, stops, rides } from '@/app/lib/schema';
import { eq, desc } from 'drizzle-orm';

interface TicketInfo {
  id: string;
  ticketNumber: string;
  passengerName: string;
  passengerSurname: string;
  passengerEmail: string;
  passengerCount: number;
  amountPaid: number;
  validated: boolean;
  purchaseTimestamp: Date | null;
  originStopName: string;
  destinationStopName: string;
}

interface RideGroup {
  rideId: string;
  rideName: string;
  departureTime: string;
  tickets: TicketInfo[];
}

interface DateGroup {
  date: string;
  rides: RideGroup[];
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Get all completed tickets
    const allTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.paymentStatus, 'completed'))
      .orderBy(desc(tickets.departureDate), tickets.departureTime);

    if (allTickets.length === 0) {
      return NextResponse.json([]);
    }

    // Get all stops for mapping
    const allStops = await db.select().from(stops);
    const stopIdToStop = Object.fromEntries(allStops.map((s) => [s.id, s] as const));

    // Get all rides for mapping
    const allRides = await db.select().from(rides);
    const rideIdToRide = Object.fromEntries(allRides.map((r) => [r.id, r] as const));

    // Group tickets by date -> ride
    const dateMap = new Map<string, Map<string, TicketInfo[]>>();

    for (const ticket of allTickets) {
      const date = ticket.departureDate;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, new Map());
      }
      
      const rideMap = dateMap.get(date)!;
      
      if (!rideMap.has(ticket.rideId)) {
        rideMap.set(ticket.rideId, []);
      }

      const originStop = stopIdToStop[ticket.originStopId];
      const destinationStop = stopIdToStop[ticket.destinationStopId];

      rideMap.get(ticket.rideId)!.push({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        passengerName: ticket.passengerName,
        passengerSurname: ticket.passengerSurname,
        passengerEmail: ticket.passengerEmail,
        passengerCount: ticket.passengerCount,
        amountPaid: ticket.amountPaid,
        validated: ticket.validated ?? false,
        purchaseTimestamp: ticket.purchaseTimestamp,
        originStopName: originStop ? `${originStop.city} - ${originStop.name}` : ticket.originStopId,
        destinationStopName: destinationStop ? `${destinationStop.city} - ${destinationStop.name}` : ticket.destinationStopId,
      });
    }

    // Build the response
    const dateGroups: DateGroup[] = [];

    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    for (const date of sortedDates) {
      const rideMap = dateMap.get(date)!;
      const rideGroups: RideGroup[] = [];

      for (const [rideId, ticketList] of rideMap) {
        const ride = rideIdToRide[rideId];
        const originStop = ride ? stopIdToStop[ride.originStopId] : null;
        const destStop = ride ? stopIdToStop[ride.destinationStopId] : null;

        const rideName = ride
          ? `${originStop?.city || ''} ${originStop?.name || ''} → ${destStop?.city || ''} ${destStop?.name || ''}`
          : rideId;

        rideGroups.push({
          rideId,
          rideName,
          departureTime: ride?.departureTime || '',
          tickets: ticketList,
        });
      }

      // Sort rides by departure time
      rideGroups.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

      dateGroups.push({
        date,
        rides: rideGroups,
      });
    }

    return NextResponse.json(dateGroups);
  } catch (error) {
    console.error('Error fetching archived tickets:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

