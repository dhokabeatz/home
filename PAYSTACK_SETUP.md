# Paystack Payment Integration Setup Guide

This guide will help you set up Paystack payment integration for your portfolio project's premium features.

## Prerequisites

- A Paystack account (sign up at https://paystack.com/)
- Access to your Paystack dashboard

## Step 1: Create a Paystack Account

1. Visit https://paystack.com/ and click "Get Started"
2. Fill in your business information
3. Verify your email address
4. Complete your business verification (may take a few days)

## Step 2: Get Your API Keys

1. Log into your Paystack dashboard
2. Navigate to Settings → API Keys
3. Copy your:
   - **Public Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)

## Step 3: Update Environment Variables

In your backend `.env` file, update these values:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

**Important Security Notes:**

- Never commit your secret key to version control
- Use test keys during development
- Switch to live keys only when ready for production
- Keep your secret key confidential

## Step 4: Test the Integration

1. Start your backend server:

   ```bash
   cd backend
   npm run start:dev
   ```

2. Start your frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to your portfolio and try purchasing a premium project

## Step 5: Testing Payments

Paystack provides test card numbers for testing:

### Test Card Numbers:

- **Successful payment:** 4084084084084081
- **Declined payment:** 4084084084084081 (use CVV 408)
- **Insufficient funds:** 4084084084084081 (use CVV 110)

### Test Details:

- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3-digit number (unless testing specific scenarios)
- **PIN:** 1234 (for cards that require PIN)

## Step 6: Production Deployment

When ready for production:

1. Complete your Paystack business verification
2. Switch to live API keys (starts with `pk_live_` and `sk_live_`)
3. Update your environment variables with live keys
4. Test thoroughly with small amounts before going live

## Webhook Configuration (Optional)

For additional security and order tracking, you can set up webhooks:

1. In Paystack dashboard, go to Settings → Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select relevant events (payment.success, payment.failed)
4. Add webhook secret to your environment variables

## Troubleshooting

### Common Issues:

1. **"Invalid public key" error:**
   - Ensure you're using the correct format (pk*test*...)
   - Verify the key is copied completely

2. **Payment initialization fails:**
   - Check your secret key is correct
   - Ensure your server can reach Paystack's API
   - Check network/firewall restrictions

3. **CORS errors:**
   - Paystack scripts should be loaded from their CDN
   - Ensure your domain is allowed in Paystack settings

### Support:

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Test API in Postman: https://documenter.getpostman.com/view/93508/paystack-api/2TuTKW

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always validate payments** on your backend
3. **Use HTTPS** in production
4. **Implement proper error handling**
5. **Log transactions** for audit purposes
6. **Set up monitoring** for failed payments

## Features Implemented

✅ Payment initialization
✅ Payment verification
✅ Transaction logging
✅ Customer purchase tracking
✅ Project access control
✅ Payment modal UI
✅ Success/failure handling

## Next Steps

Consider implementing:

- [ ] Email receipts
- [ ] Refund functionality
- [ ] Subscription billing
- [ ] Multiple payment methods
- [ ] Payment analytics dashboard
