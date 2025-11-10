import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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

        // TODO: In the future, you might want to:
        // 1. Generate and send ticket to customer email
        // 2. Update database with ticket information
        // 3. Send confirmation email
        // 4. Update ride availability
        
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

