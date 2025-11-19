# Quick Start Guide - Testing Stripe Payment Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Get Stripe Test Keys

1. Go to https://dashboard.stripe.com/register
2. Create a free account (or login)
3. Stay in **Test Mode** (toggle in top right)
4. Go to **Developers > API keys**
5. Copy both keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - click "Reveal test key"

### Step 2: Configure Environment Variables

Create a `.env` file in the project root (if it doesn't exist):

```bash
# In your project root
touch .env
```

Add these lines to `.env`:

```env
# Your existing database config
TURSO_DATABASE_URL=your_existing_value
TURSO_AUTH_TOKEN=your_existing_value

# Add these NEW Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_placeholder
```

Replace `YOUR_KEY_HERE` with the actual keys from Step 1.

### Step 3: Start the Development Server

```bash
npm run dev
```

Your app should start at http://localhost:3000

### Step 4: Test the Payment Flow

1. **Navigate to Search Page:**
   - Go to http://localhost:3000/search
   - Select origin and destination
   - Click "Cerca" to search for rides

2. **Select a Ride:**
   - Click "Acquista" on any ride in the results

3. **Enter Your Details:**
   - Fill in: Nome, Cognome, Email
   - Select number of passengers
   - Click "Continua"

4. **Review Your Order:**
   - Verify ride details are correct
   - Check your passenger information
   - Click "Conferma e paga"

5. **Select Payment Method:**
   - Click on the Stripe payment option
   - You'll be redirected to Stripe Checkout

6. **Complete Payment:**
   Use these **test card numbers**:
   
   ✅ **Successful Payment:**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34 (any future date)
   CVC: 123 (any 3 digits)
   ZIP: 12345 (any 5 digits)
   ```

   🔐 **With 3D Secure (SCA):**
   ```
   Card Number: 4000 0025 0000 3155
   Expiry: 12/34
   CVC: 123
   (You'll see an authentication challenge)
   ```

   ❌ **Declined Card:**
   ```
   Card Number: 4000 0000 0000 9995
   Expiry: 12/34
   CVC: 123
   ```

7. **Success!**
   - You should be redirected to the success page
   - Check your email for Stripe receipt (if you used a real email)

## 🎥 Visual Flow

```
Home → Search → Results → Buy → Confirm → Payment → Stripe → Success!
                   ↓        ↓       ↓         ↓        ↓
                  Pick    Enter   Review   Select   Pay    🎉
                  Ride    Info    Order    Stripe   Card
```

## 🐛 Troubleshooting

### Error: "Stripe non inizializzato"
**Fix:** Check that your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env`

### Error: "Missing required parameters"
**Fix:** Make sure you selected a ride from search results

### Payment page just shows loading
**Fix:** Check browser console for errors. Verify `STRIPE_SECRET_KEY` is correct.

### Can't see test mode toggle in Stripe Dashboard
**Fix:** You're in live mode. Click the toggle in the top-right to switch to test mode.

### Webhook errors (you can ignore these for now)
Webhooks are for production. They won't work locally without Stripe CLI, but payments will still work!

## 📱 Mobile Testing

To test on your phone:

1. Get your computer's local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. Update your `next.config.ts` if needed to allow your IP

3. On your phone, go to:
   ```
   http://YOUR_IP:3000/search
   ```

## ✅ What to Test

- [ ] Can enter user details
- [ ] Form validation works (try invalid email)
- [ ] Can review order details
- [ ] Stripe checkout opens
- [ ] Can complete payment with test card
- [ ] Success page displays
- [ ] Can cancel payment and see cancel page
- [ ] Back button works on all pages
- [ ] Close button returns to search

## 🎯 Next Steps

Once basic testing works:

1. **Test Different Scenarios:**
   - Different number of passengers
   - Different rides/routes
   - Cancel payment midway
   - Use declined card

2. **Check Stripe Dashboard:**
   - Go to https://dashboard.stripe.com
   - Click "Payments" to see test transactions
   - Verify amounts and metadata are correct

3. **Set Up Webhooks (Optional for Development):**
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/payment/webhook`
   - Copy the webhook secret to your `.env`

4. **Ready for Production?**
   - See `STRIPE_SETUP.md` for production deployment checklist
   - Replace test keys with live keys
   - Set up production webhook endpoint

## 🆘 Need Help?

1. **Check the logs:**
   ```bash
   # Server logs in terminal where you ran npm run dev
   # Browser logs in Developer Tools (F12) > Console
   ```

2. **Verify environment variables:**
   ```bash
   # Make sure .env file exists and has correct values
   cat .env
   ```

3. **Restart the server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

## 🎉 Success Criteria

You've successfully tested when you:

✅ Complete a full payment with test card  
✅ See success page with transaction ID  
✅ Payment appears in Stripe Dashboard  
✅ Can navigate back and try again  

**Congratulations! Your payment system is working! 🎊**

---

**For detailed setup instructions, see:** `STRIPE_SETUP.md`  
**For implementation details, see:** `docs/stories/stories_7/7.1/7.1.3.implementation.md`

