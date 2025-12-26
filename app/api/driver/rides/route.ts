import { NextRequest, NextResponse } from 'next/server';
import { listRides } from '@/app/lib/ridesStore';
import { getDb } from '@/app/lib/db';
import { tickets } from '@/app/lib/schema';
import { eq, and } from 'drizzle-orm';

interface RideWithDate {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  departureTime: string;
  arrivalTime: string;
  allValidated: boolean;
}

interface DateGroup {
  date: string;
  rides: RideWithDate[];
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Get all completed tickets from today onwards
    const upcomingTickets = await db
      .select({
        rideId: tickets.rideId,
        departureDate: tickets.departureDate,
        validated: tickets.validated,
      })
      .from(tickets)
      .where(eq(tickets.paymentStatus, 'completed'));
    
    // Filter to only upcoming tickets (today or future)
    const filteredTickets = upcomingTickets.filter(t => t.departureDate >= todayStr);
    
    if (filteredTickets.length === 0) {
      return NextResponse.json([]);
    }
    
    // Group tickets by date and ride
    // Map: date -> rideId -> { tickets }
    const dateRideMap = new Map<string, Map<string, { validated: boolean }[]>>();
    
    for (const ticket of filteredTickets) {
      if (!dateRideMap.has(ticket.departureDate)) {
        dateRideMap.set(ticket.departureDate, new Map());
      }
      const rideMap = dateRideMap.get(ticket.departureDate)!;
      if (!rideMap.has(ticket.rideId)) {
        rideMap.set(ticket.rideId, []);
      }
      rideMap.get(ticket.rideId)!.push({ validated: ticket.validated ?? false });
    }
    
    // Get all rides from database
    const allRides = await listRides();
    const ridesMap = new Map(allRides.map(r => [r.id, r]));
    
    // Build the response grouped by date
    const dateGroups: DateGroup[] = [];
    
    // Sort dates chronologically
    const sortedDates = Array.from(dateRideMap.keys()).sort();
    
    for (const date of sortedDates) {
      const rideMap = dateRideMap.get(date)!;
      const rides: RideWithDate[] = [];
      
      for (const [rideId, ticketsList] of rideMap) {
        const ride = ridesMap.get(rideId);
        if (ride) {
          // Check if all tickets for this ride on this date are validated
          const allValidated = ticketsList.length > 0 && ticketsList.every(t => t.validated === true);
          
          rides.push({
            id: ride.id,
            lineName: ride.lineName,
            originStopId: ride.originStopId,
            destinationStopId: ride.destinationStopId,
            departureTime: ride.departureTime,
            arrivalTime: ride.arrivalTime,
            allValidated,
          });
        }
      }
      
      // Sort rides by departure time
      rides.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      
      if (rides.length > 0) {
        dateGroups.push({
          date,
          rides,
        });
      }
    }
    
    return NextResponse.json(dateGroups);
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


