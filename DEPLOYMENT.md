# Deployment Guide - javari Logo Studio

This guide will walk you through deploying javari Logo Studio to production.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Supabase project created
- [ ] Stripe account (optional, for payments)
- [ ] Vercel or Netlify account

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
git init
git add -A
git commit -m "Initial commit: javari Logo Studio"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com/new)
2. Create a new repository named `javari-logo-studio`
3. Don't initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/javari-logo-studio.git
git push -u origin main
```

## Step 2: Supabase Setup

Your Supabase database should already have all necessary tables and RLS policies. Verify in your Supabase dashboard:

### Required Tables
- users
- wallets
- ledger_entries
- projects
- revisions
- assets
- orders
- subscriptions
- templates
- shares

### Get Your Credentials

From your Supabase dashboard:
1. Go to Settings → API
2. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Step 3: Stripe Setup (Optional)

### 3.1 Create Products

In your Stripe Dashboard, create these products:

**Credit Packs:**
- 200 Credits - $9 USD
- 500 Credits - $19 USD
- 1000 Credits - $35 USD

**Subscription Plans:**
- Starter Plan - $12/month (300 credits/month)
- Pro Plan - $29/month (1000 credits/month)
- Studio Plan - $79/month (4000 credits/month)

### 3.2 Setup Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret

### 3.3 Get Your Keys

From Stripe Dashboard → Developers → API keys:
- Publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
- Secret key (STRIPE_SECRET_KEY)
- Webhook secret (STRIPE_WEBHOOK_SECRET)

## Step 4: Deploy to Vercel (Recommended)

### 4.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Framework Preset: Next.js (auto-detected)

### 4.2 Configure Environment Variables

Add these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4.3 Deploy

Click "Deploy" and wait for the build to complete.

### 4.4 Update Stripe Webhook URL

Once deployed, update your Stripe webhook endpoint URL to:
```
https://your-app.vercel.app/api/stripe/webhook
```

## Step 5: Deploy to Netlify (Alternative)

### 5.1 Import Project

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository

### 5.2 Configure Build Settings

- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: (leave empty, using API routes)

### 5.3 Configure Environment Variables

Go to Site settings → Environment variables and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 5.4 Deploy

Click "Deploy site" and wait for build completion.

### 5.5 Update Stripe Webhook URL

Update your Stripe webhook endpoint URL to:
```
https://your-app.netlify.app/api/stripe/webhook
```

## Step 6: Post-Deployment Verification

### 6.1 Test Authentication

1. Visit your deployed site
2. Click "Sign Up"
3. Create a test account
4. Verify you receive 50 welcome credits

### 6.2 Test Logo Generation

1. Go to Projects page
2. Click "Generate with AI"
3. Enter a logo description
4. Verify credits are deducted
5. Verify logos are generated

### 6.3 Test Stripe (if configured)

1. Go to Billing page
2. Try purchasing a credit pack
3. Use Stripe test card: 4242 4242 4242 4242
4. Verify credits are added to wallet
5. Check order appears in Stripe Dashboard

## Step 7: Enable GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that will automatically:
- Run TypeScript type checking
- Run ESLint
- Build the project

### Setup GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets → Actions
2. Add secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Now every push will trigger CI checks!

## Step 8: Custom Domain (Optional)

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### For Netlify:
1. Go to Domain settings
2. Add custom domain
3. Configure DNS or use Netlify DNS

## Troubleshooting

### Build Fails

**Issue:** TypeScript errors
- Run `npm run typecheck` locally
- Fix any type errors
- Commit and push

**Issue:** Missing environment variables
- Double-check all env vars are set in deployment platform
- Ensure no typos in variable names

### Authentication Not Working

**Issue:** "Unauthorized" errors
- Verify Supabase URL and anon key are correct
- Check Supabase RLS policies are enabled
- Verify cookies are being set (check browser dev tools)

### Stripe Webhooks Failing

**Issue:** Webhook events not processing
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook logs in Stripe Dashboard
- Check deployment logs for errors

### Database Errors

**Issue:** RLS policy errors
- Verify all RLS policies exist in Supabase
- Check user is authenticated before making queries
- Review Supabase logs for specific errors

## Monitoring & Maintenance

### Check Application Health

1. **Vercel:** Dashboard → Analytics
2. **Netlify:** Dashboard → Analytics
3. **Supabase:** Dashboard → Database → Logs
4. **Stripe:** Dashboard → Webhooks → Events log

### Regular Maintenance

- Monitor error rates
- Check database performance
- Review failed webhook events
- Monitor credit usage patterns
- Update dependencies regularly

## Support

If you encounter issues:
1. Check deployment logs
2. Review error messages
3. Verify environment variables
4. Check Supabase RLS policies
5. Test locally with production env vars

## Next Steps

After successful deployment:
- [ ] Add custom domain
- [ ] Configure email templates in Supabase
- [ ] Set up monitoring/alerts
- [ ] Create admin user for management
- [ ] Test all user flows
- [ ] Monitor initial user signups
- [ ] Set up backup strategy

## Production Checklist

Before going live:
- [ ] All environment variables set correctly
- [ ] Stripe in live mode (not test mode)
- [ ] Database backups enabled in Supabase
- [ ] RLS policies tested and verified
- [ ] Authentication flows tested
- [ ] Payment flows tested
- [ ] Error monitoring configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Terms of service and privacy policy added

---

**Congratulations!** Your javari Logo Studio is now deployed and ready for users.
