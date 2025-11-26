import { NextRequest, NextResponse } from 'next/server';
import { listRides } from '@/app/lib/ridesStore';

export async function GET(req: NextRequest) {
  try {
    // For now, allow access without auth (will add driver auth later)
    // Get ALL rides from database (including archived)
    const allRides = await listRides();
    
    // Return simplified ride data for all rides
    const simplifiedRides = allRides.map((ride) => ({
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


