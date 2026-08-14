# javari Logo Studio - Quick Start Guide

Get your Logo Studio up and running in minutes!

## 🚀 One-Command Deploy

### Option 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### Option 2: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Add environment variables in Netlify dashboard
```

## 📋 Required Environment Variables

Copy these to your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional (for payments):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## ✅ What's Already Done

Your project includes:

✅ **Database Schema**
- All 10 tables created with proper RLS policies
- Users, wallets, projects, revisions, assets, etc.
- Secure row-level security on all tables

✅ **Authentication**
- Sign up / Sign in pages
- Supabase Auth integration
- Protected routes with auth guards
- 50 free credits on signup

✅ **Core Features**
- AI logo generation with credit system
- Project management (create, edit, delete)
- Wallet & credit tracking
- Real-time balance updates

✅ **Payment Integration**
- Stripe checkout for credit packs
- Webhook handlers for payment events
- Subscription management ready

✅ **Deployment Ready**
- Production build configured
- CI/CD workflow (.github/workflows/ci.yml)
- Deployment configs (netlify.toml, vercel.json)

## 🎯 Quick Test After Deploy

1. **Visit your site** → Should see landing page
2. **Sign Up** → Create account, should get 50 credits
3. **Generate Logo** → Describe a logo, costs 5 credits
4. **View Projects** → See your generated logos
5. **Check Billing** → View credit balance

## 📚 Documentation

- **README.md** - Full project documentation
- **DEPLOYMENT.md** - Detailed deployment guide
- **This file** - Quick start guide

## 🆘 Quick Troubleshooting

**Build fails?**
```bash
npm run typecheck  # Find type errors
npm run lint       # Find linting issues
npm run build      # Test build locally
```

**Module not found errors in dev?**
```bash
# Stop your dev server (Ctrl+C or Cmd+C)
# Then restart it:
npm run dev
```

**Auth not working?**
- Check Supabase URL and anon key are correct
- Verify Supabase project is active
- Check browser console for errors

**Logo generation fails with "Module not found: @supabase/ssr"?**
1. Stop the dev server
2. Run: `npm install`
3. Restart: `npm run dev`
4. If on deployment platform, trigger a new deploy

**Logo generation fails?**
- Check user is authenticated
- Verify wallet has sufficient credits
- Review API route logs

## 🔗 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # Check TypeScript
npm run lint         # Run ESLint

# Database
# All migrations already applied in Supabase

# Deployment
git push origin main # Triggers CI/CD if configured
vercel --prod        # Deploy to Vercel
netlify deploy --prod # Deploy to Netlify
```

## 🎉 What's Working Right Now

✅ User signup with 50 free credits
✅ AI logo generation (placeholder SVGs)
✅ Project creation and management
✅ Credit deduction system
✅ Wallet balance tracking
✅ Stripe checkout (when configured)
✅ Export to SVG
✅ Responsive UI with shadcn components

## 🚧 Ready for Enhancement

The following are stubbed and ready to be connected to real services:

- AI logo generation (currently returns placeholder SVGs)
- Advanced export formats (PNG, PDF at various sizes)
- Template library
- Mockup generation
- Brand kit PDF export

## 📞 Support

Need help? Check:
1. Browser console for client-side errors
2. Deployment platform logs for server errors
3. Supabase logs for database issues
4. Stripe dashboard for payment issues

---

**You're ready to deploy!** Choose Vercel or Netlify, add your environment variables, and go live. 🚀
