import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    'Stripe secret key missing. Please set STRIPE_SECRET_KEY in your environment variables.'
  );
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
});

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit: max 5 attempts per minute per IP
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra un minuto.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { rideId, userData, amount, rideData } = body;

    // Validate required fields
    if (!rideId || !userData || !amount) {
      return NextResponse.json(
        { error: 'Dati mancanti: rideId, userData, and amount sono richiesti' },
        { status: 400 }
      );
    }

    // Validate userData fields
    if (!userData.nome || !userData.cognome || !userData.email || !userData.passeggeri) {
      return NextResponse.json(
        { error: 'Dati utente incompleti' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Parse amount from price string (e.g., "€2,50" -> 250 cents)
    let amountInCents = 0;
    if (typeof amount === 'string') {
      // Remove currency symbols and convert comma to dot
      const numericAmount = amount.replace(/[€$]/g, '').replace(',', '.');
      amountInCents = Math.round(parseFloat(numericAmount) * 100);
    } else if (typeof amount === 'number') {
      amountInCents = Math.round(amount * 100);
    }

    // Validate amount
    if (!amountInCents || amountInCents < 50) {
      return NextResponse.json(
        { error: 'Importo non valido' },
        { status: 400 }
      );
    }

    // Multiply by number of passengers
    const passengers = parseInt(userData.passeggeri) || 1;
    const totalAmount = amountInCents * passengers;

    // Prepare metadata for ticket creation (Stripe metadata has max 500 chars per value)
    // We'll include ride data for ticket generation
    const metadata: Record<string, string> = {
      rideId,
      userName: `${userData.nome} ${userData.cognome}`,
      userEmail: userData.email,
      passengers: passengers.toString(),
      passengerName: userData.nome,
      passengerSurname: userData.cognome,
    };

    // Add ride data if provided
    if (rideData) {
      metadata.departureTime = rideData.departureTime || '';
      metadata.arrivalTime = rideData.arrivalTime || '';
      metadata.originStopId = rideData.originStop?.id || '';
      metadata.originStopName = rideData.originStop?.name || '';
      metadata.destinationStopId = rideData.destinationStop?.id || '';
      metadata.destinationStopName = rideData.destinationStop?.name || '';
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Biglietto Autobus',
              description: `Corsa ID: ${rideId} - ${passengers} passeggero/i`,
            },
            unit_amount: amountInCents,
          },
          quantity: passengers,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/buy/cancel`,
      customer_email: userData.email,
      metadata,
    });

    // Log transaction for audit (without sensitive data)
    console.log('[PAYMENT] Checkout session created:', {
      sessionId: session.id,
      rideId,
      amount: totalAmount,
      passengers,
      timestamp: new Date().toISOString(),
      ip,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[PAYMENT] Error creating checkout session:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Errore durante la creazione del pagamento. Riprova.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

