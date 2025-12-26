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
  departureDate: string;
}

interface RideGroup {
  rideId: string;
  rideName: string;
  departureTime: string;
  departureDate: string;
  tickets: TicketInfo[];
}

interface MonthGroup {
  month: string; // formato YYYY-MM
  monthLabel: string; // es. "Dicembre 2025"
  totalTickets: number;
  totalAmount: number;
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

    // Group tickets by month -> date+ride
    const monthMap = new Map<string, Map<string, TicketInfo[]>>();

    for (const ticket of allTickets) {
      const date = ticket.departureDate;
      const month = date.substring(0, 7); // YYYY-MM
      const dateRideKey = `${date}|${ticket.rideId}`;
      
      if (!monthMap.has(month)) {
        monthMap.set(month, new Map());
      }
      
      const dateRideMap = monthMap.get(month)!;
      
      if (!dateRideMap.has(dateRideKey)) {
        dateRideMap.set(dateRideKey, []);
      }

      const originStop = stopIdToStop[ticket.originStopId];
      const destinationStop = stopIdToStop[ticket.destinationStopId];

      dateRideMap.get(dateRideKey)!.push({
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
        departureDate: ticket.departureDate,
      });
    }

    // Build the response
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    const monthGroups: MonthGroup[] = [];

    // Sort months in descending order (most recent first)
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));

    for (const month of sortedMonths) {
      const dateRideMap = monthMap.get(month)!;
      const rideGroups: RideGroup[] = [];
      let totalTickets = 0;
      let totalAmount = 0;

      // Sort date+ride keys in descending order by date, then by time
      const sortedDateRideKeys = Array.from(dateRideMap.keys()).sort((a, b) => {
        const [dateA] = a.split('|');
        const [dateB] = b.split('|');
        return dateB.localeCompare(dateA);
      });

      for (const dateRideKey of sortedDateRideKeys) {
        const [date, rideId] = dateRideKey.split('|');
        const ticketList = dateRideMap.get(dateRideKey)!;
        
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
          departureDate: date,
          tickets: ticketList,
        });

        totalTickets += ticketList.length;
        totalAmount += ticketList.reduce((sum, t) => sum + t.amountPaid, 0);
      }

      // Parse month for label
      const [year, monthNum] = month.split('-');
      const monthLabel = `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`;

      monthGroups.push({
        month,
        monthLabel,
        totalTickets,
        totalAmount,
        rides: rideGroups,
      });
    }

    return NextResponse.json(monthGroups);
  } catch (error) {
    console.error('Error fetching archived tickets:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
