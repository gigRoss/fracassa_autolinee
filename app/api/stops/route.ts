import { NextResponse } from 'next/server';
import { listStops } from '@/app/lib/stopsStore';

export async function GET() {
  try {
    const stops = await listStops();
    return NextResponse.json(stops);
  } catch (error) {
    console.error('Error fetching stops:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}


