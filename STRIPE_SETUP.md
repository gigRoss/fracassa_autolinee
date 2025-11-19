# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for Story 7.1.3.

## Prerequisites

- Stripe account (create one at [stripe.com](https://stripe.com))
- Node.js and npm installed
- Access to the project's `.env` file

## Setup Steps

### 1. Install Dependencies (Already Done)

The following packages have been installed:
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe library

### 2. Get Your Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click on "Developers" in the left sidebar
3. Click on "API keys"
4. Copy your **Publishable key** and **Secret key**

⚠️ **Important:** Use test mode keys (starting with `pk_test_` and `sk_test_`) for development.

### 3. Configure Environment Variables

Create or update your `.env` file in the project root with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Set Up Stripe Webhook (for production)

Webhooks allow Stripe to notify your application about payment events.

#### For Local Development (using Stripe CLI):

1. Install Stripe CLI: [Installation Guide](https://stripe.com/docs/stripe-cli)
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env` file

#### For Production (Vercel/deployed app):

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/payment/webhook`
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your environment variables

## Payment Flow

The payment integration follows this flow:

```
1. User enters personal data on /buy page
   ↓
2. User reviews ride details on /buy/confirm page
   ↓
3. User selects Stripe payment on /buy/payment page
   ↓
4. System creates Stripe Checkout Session via API
   ↓
5. User is redirected to Stripe Checkout
   ↓
6. User completes payment on Stripe
   ↓
7. User is redirected back to:
   - /buy/success (if payment succeeded)
   - /buy/payment (if payment was cancelled)
```

## Files Created

### Pages:
- `/app/(mobile)/buy/confirm/page.tsx` - Ride details confirmation page
- `/app/(mobile)/buy/payment/page.tsx` - Payment method selection page
- `/app/(mobile)/buy/success/page.tsx` - Payment success page
- `/app/(mobile)/buy/cancel/page.tsx` - Payment cancelled/failed page

### API Routes:
- `/app/api/payment/create-intent/route.ts` - Creates Stripe Checkout Session
- `/app/api/payment/webhook/route.ts` - Handles Stripe webhook events

## Security Features Implemented

✅ **Rate Limiting:** Max 5 payment attempts per minute per IP  
✅ **Input Validation:** Server-side validation of all payment data  
✅ **Email Validation:** Regex-based email validation  
✅ **Amount Validation:** Ensures valid payment amounts  
✅ **Webhook Signature Verification:** Verifies authenticity of Stripe events  
✅ **PCI Compliance:** No card data stored on server (handled by Stripe)  
✅ **Secure Logging:** Sensitive data excluded from logs  

## Testing

### Test Card Numbers

Use these test cards in Stripe test mode:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Payment succeeds |
| 4000 0025 0000 3155 | Requires 3D Secure authentication |
| 4000 0000 0000 9995 | Payment declined (insufficient funds) |

**Expiry Date:** Any future date (e.g., 12/34)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

### Testing the Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the search page and select a ride

3. Click "Acquista" to start the purchase flow

4. Fill in your personal details on the `/buy` page

5. Review your ride details on the `/buy/confirm` page

6. Select Stripe payment on the `/buy/payment` page

7. Use a test card number to complete the payment

8. Verify you're redirected to the success page

### Webhook Testing

If using Stripe CLI for local development:

```bash
# In one terminal, run your dev server
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/payment/webhook

# Trigger a test webhook event
stripe trigger checkout.session.completed
```

## Troubleshooting

### Common Issues

**Issue:** "Stripe non inizializzato" error  
**Solution:** Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly

**Issue:** Payment fails silently  
**Solution:** Check browser console for errors and verify `STRIPE_SECRET_KEY` is correct

**Issue:** Webhook events not received  
**Solution:** Verify webhook endpoint is accessible and `STRIPE_WEBHOOK_SECRET` is correct

**Issue:** Rate limit error  
**Solution:** Wait 1 minute before trying again or restart the server to clear rate limit cache

## Production Checklist

Before deploying to production:

- [ ] Replace test keys with live keys (`pk_live_` and `sk_live_`)
- [ ] Set up production webhook endpoint
- [ ] Test payment flow with real cards (use small amounts)
- [ ] Verify webhook events are received correctly
- [ ] Test error handling (declined cards, expired sessions)
- [ ] Verify email confirmations are sent (when implemented)
- [ ] Review Stripe Dashboard for successful test transactions
- [ ] Enable Strong Customer Authentication (SCA) in Stripe settings
- [ ] Configure proper logging and monitoring

## Future Enhancements

The current implementation provides a solid foundation for:

1. **Ticket Generation (Story 7.1.4):** Generate QR code tickets after successful payment
2. **Email Confirmations:** Send ticket and receipt via email
3. **Payment History:** Store payment records in database
4. **Refunds:** Implement refund functionality through Stripe
5. **Multiple Payment Methods:** Add more payment options (Apple Pay, Google Pay, etc.)
6. **Subscription Support:** For monthly pass tickets
7. **Currency Conversion:** Support multiple currencies

## Support

For Stripe-specific questions, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com/)

For application-specific issues, check the application logs or contact the development team.

