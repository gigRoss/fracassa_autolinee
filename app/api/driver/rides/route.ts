import { NextRequest, NextResponse } from 'next/server';
import { listRides } from '@/app/lib/ridesStore';

export async function GET(req: NextRequest) {
  try {
    // For now, allow access without auth (will add driver auth later)
    const allRides = await listRides();
    // Filter out archived rides
    const visibleRides = allRides.filter((r) => !r.archived);
    
    // Return simplified ride data
    const simplifiedRides = visibleRides.map((ride) => ({
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


