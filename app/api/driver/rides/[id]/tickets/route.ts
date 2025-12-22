import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingTicketsByRideId, getTicketsByRideId } from '@/app/lib/ticketUtils';

type Params = { id: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: rideId } = await params;
    
    if (!rideId) {
      return NextResponse.json(
        { error: 'ID corsa obbligatorio' },
        { status: 400 }
      );
    }

    // Check if a specific date is requested
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let tickets;
    if (date) {
      // Get tickets for specific date
      tickets = await getTicketsByRideId(rideId, date);
    } else {
      // Get upcoming tickets (today and future)
      tickets = await getUpcomingTicketsByRideId(rideId);
    }

    // Transform tickets to driver-friendly format
    const driverTickets = tickets.map((ticket) => ({
      id: ticket.id,
      name: `${ticket.passengerName} ${ticket.passengerSurname}`,
      ticketCode: ticket.ticketNumber,
      departureDate: ticket.departureDate,
      departureTime: ticket.departureTime,
      passengerCount: ticket.passengerCount,
    }));

    return NextResponse.json(driverTickets);
  } catch (error) {
    console.error('Error fetching driver tickets:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
