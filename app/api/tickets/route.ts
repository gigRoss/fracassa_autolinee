import { NextRequest, NextResponse } from 'next/server';
import { createTicket, CreateTicketData } from '@/app/lib/ticketUtils';

/**
 * POST /api/tickets
 * Create a new ticket with unique ticket number
 * 
 * Story 7.1.4 - Ticket Generation and Unique Number Assignment
 * 
 * This endpoint should only be called after payment confirmation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'passengerName',
      'passengerSurname',
      'passengerEmail',
      'rideId',
      'departureDate',
      'departureTime',
      'originStopId',
      'destinationStopId',
      'amountPaid',
      'passengerCount',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo mancante: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.passengerEmail)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.departureDate)) {
      return NextResponse.json(
        { error: 'Formato data non valido (richiesto: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(body.departureTime)) {
      return NextResponse.json(
        { error: 'Formato orario non valido (richiesto: HH:MM)' },
        { status: 400 }
      );
    }

    // Validate amount (must be positive)
    const amountPaid = parseInt(body.amountPaid);
    if (isNaN(amountPaid) || amountPaid < 0) {
      return NextResponse.json(
        { error: 'Importo non valido' },
        { status: 400 }
      );
    }

    // Validate passenger count (must be positive integer)
    const passengerCount = parseInt(body.passengerCount);
    if (isNaN(passengerCount) || passengerCount < 1) {
      return NextResponse.json(
        { error: 'Numero passeggeri non valido' },
        { status: 400 }
      );
    }

    // Create ticket data
    const ticketData: CreateTicketData = {
      passengerName: body.passengerName.trim(),
      passengerSurname: body.passengerSurname.trim(),
      passengerEmail: body.passengerEmail.trim().toLowerCase(),
      rideId: body.rideId,
      departureDate: body.departureDate,
      departureTime: body.departureTime,
      originStopId: body.originStopId,
      destinationStopId: body.destinationStopId,
      amountPaid,
      passengerCount,
      stripePaymentIntentId: body.stripePaymentIntentId,
      stripeSessionId: body.stripeSessionId,
      paymentStatus: body.paymentStatus || 'completed',
    };

    // Create ticket with atomic transaction
    const ticket = await createTicket(ticketData);

    // Log ticket creation for audit
    console.log('[TICKET] Ticket created:', {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      rideId: ticket.rideId,
      email: ticket.passengerEmail,
      amount: ticket.amountPaid,
      passengers: ticket.passengerCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          passengerName: ticket.passengerName,
          passengerSurname: ticket.passengerSurname,
          passengerEmail: ticket.passengerEmail,
          departureDate: ticket.departureDate,
          departureTime: ticket.departureTime,
          passengerCount: ticket.passengerCount,
          amountPaid: ticket.amountPaid,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[TICKET] Error creating ticket:', error);

    // Handle specific errors
    if (error instanceof Error) {
      // Check for unique constraint violation
      if (error.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { error: 'Errore di unicità. Riprova.' },
          { status: 409 }
        );
      }

      // Check for foreign key constraint violation
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        return NextResponse.json(
          { error: 'Dati di riferimento non validi (corsa o fermata non esistente)' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Errore interno del server durante la creazione del biglietto' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tickets?email=xxx
 * Retrieve tickets by email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const ticketNumber = searchParams.get('ticketNumber');
    const sessionId = searchParams.get('sessionId');

    if (email) {
      // Get tickets by email
      const { getTicketsByEmail } = await import('@/app/lib/ticketUtils');
      const tickets = await getTicketsByEmail(email);

      return NextResponse.json({
        success: true,
        tickets,
      });
    } else if (ticketNumber) {
      // Get ticket by ticket number
      const { getTicketByNumber } = await import('@/app/lib/ticketUtils');
      const ticket = await getTicketByNumber(ticketNumber);

      if (!ticket) {
        return NextResponse.json(
          { error: 'Biglietto non trovato' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ticket,
      });
    } else if (sessionId) {
      // Get ticket by Stripe session ID
      const { getTicketBySessionId } = await import('@/app/lib/ticketUtils');
      const ticket = await getTicketBySessionId(sessionId);

      if (!ticket) {
        return NextResponse.json(
          { error: 'Biglietto non trovato' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ticket,
      });
    } else {
      return NextResponse.json(
        { error: 'Parametro email, ticketNumber o sessionId richiesto' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[TICKET] Error retrieving tickets:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}



