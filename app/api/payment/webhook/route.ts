import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createTicket, CreateTicketData } from '@/app/lib/ticketUtils';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[WEBHOOK] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[WEBHOOK] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Log successful payment (without sensitive data)
        console.log('[WEBHOOK] Payment succeeded:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
          rideId: session.metadata?.rideId,
          userName: session.metadata?.userName,
          passengers: session.metadata?.passengers,
          timestamp: new Date().toISOString(),
        });

        // Generate ticket after successful payment
        try {
          // Extract metadata
          const metadata = session.metadata;
          
          if (!metadata || !metadata.rideId || !metadata.passengerName || 
              !metadata.passengerSurname || !metadata.userEmail || 
              !metadata.departureTime || !metadata.originStopId || 
              !metadata.destinationStopId) {
            console.error('[WEBHOOK] Missing metadata for ticket generation:', metadata);
            break;
          }

          // Use departure date chosen by user, or fall back to today if not provided
          let departureDate: string;
          if (metadata.departureDate && metadata.departureDate.trim() !== '' && metadata.departureDate !== 'null' && metadata.departureDate !== 'undefined') {
            departureDate = metadata.departureDate.split('T')[0];
            console.log('[WEBHOOK] Using user-selected departure date:', departureDate);
          } else {
            // Fallback to today's date in YYYY-MM-DD format
            const today = new Date();
            departureDate = today.toISOString().split('T')[0];
            console.log('[WEBHOOK] No departure date in metadata, using today:', departureDate);
          }

          // Prepare ticket data
          const ticketData: CreateTicketData = {
            passengerName: metadata.passengerName,
            passengerSurname: metadata.passengerSurname,
            passengerEmail: metadata.userEmail,
            rideId: metadata.rideId,
            departureDate: departureDate,
            departureTime: metadata.departureTime,
            originStopId: metadata.originStopId,
            destinationStopId: metadata.destinationStopId,
            amountPaid: session.amount_total || 0,
            passengerCount: parseInt(metadata.passengers || '1'),
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string || undefined,
            paymentStatus: 'completed',
          };

          // Create ticket
          const ticket = await createTicket(ticketData);

          console.log('[WEBHOOK] Ticket created successfully:', {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            sessionId: session.id,
            timestamp: new Date().toISOString(),
          });

          // TODO: Future enhancements:
          // 1. Send ticket via email
          // 2. Send confirmation email
          // 3. Update ride availability
        } catch (error) {
          console.error('[WEBHOOK] Error creating ticket:', error);
          // Don't fail the webhook - log the error and handle manually if needed
        }
        
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[WEBHOOK] Async payment succeeded:', {
          sessionId: session.id,
          rideId: session.metadata?.rideId,
          timestamp: new Date().toISOString(),
        });
        
        // Handle async payment success (e.g., for bank transfers)
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[WEBHOOK] Async payment failed:', {
          sessionId: session.id,
          rideId: session.metadata?.rideId,
          timestamp: new Date().toISOString(),
        });
        
        // Handle async payment failure
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[WEBHOOK] Checkout session expired:', {
          sessionId: session.id,
          rideId: session.metadata?.rideId,
          timestamp: new Date().toISOString(),
        });
        
        // Handle session expiration
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('[WEBHOOK] Payment intent succeeded:', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          timestamp: new Date().toISOString(),
        });
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('[WEBHOOK] Payment intent failed:', {
          paymentIntentId: paymentIntent.id,
          lastError: paymentIntent.last_payment_error?.message,
          timestamp: new Date().toISOString(),
        });
        
        break;
      }

      default:
        console.log('[WEBHOOK] Unhandled event type:', event.type);
    }

    // Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook routes
export const config = {
  api: {
    bodyParser: false,
  },
};

