import { NextRequest, NextResponse } from 'next/server';
import { listRides } from '@/app/lib/ridesStore';
import { getRideIdsWithUpcomingTickets } from '@/app/lib/ticketUtils';

export async function GET(req: NextRequest) {
  try {
    // Get ride IDs that have upcoming tickets (today or future)
    const rideIdsWithTickets = await getRideIdsWithUpcomingTickets();
    
    if (rideIdsWithTickets.length === 0) {
      // No rides with active tickets
      return NextResponse.json([]);
    }
    
    // Get all rides from database
    const allRides = await listRides();
    
    // Filter to only include rides with active tickets
    const ridesWithTickets = allRides.filter((ride) => 
      rideIdsWithTickets.includes(ride.id)
    );
    
    // Return simplified ride data
    const simplifiedRides = ridesWithTickets.map((ride) => ({
      id: ride.id,
      lineName: ride.lineName,
      originStopId: ride.originStopId,
      destinationStopId: ride.destinationStopId,
      departureTime: ride.departureTime,
      arrivalTime: ride.arrivalTime,
    }));

    return NextResponse.json(simplifiedRides);
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


