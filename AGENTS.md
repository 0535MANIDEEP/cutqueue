# QueueForge — Agent Configuration

## Project Overview
QueueForge is a queue management SaaS platform for businesses where people wait (barbershops, salons, clinics, auto shops). India-first strategy with ₹ pricing.

**Tech Stack:** Next.js 16 (App Router) | TypeScript | Tailwind CSS | PostgreSQL (Supabase) | Prisma 7 | NextAuth.js v5 | Vercel

---

## MCP Server Inventory

### Connected (Active)
| Server | Type | Purpose | Status |
|--------|------|---------|--------|
| **supabase** | Remote | DB queries, migrations, RLS policies | ✅ Active |
| **github** | Remote | PRs, issues, code search, repo management | ✅ Active |
| **context7** | Local | Library/framework documentation lookup | ✅ Active |
| **playwright** | Local | Browser testing, UI verification | ✅ Active |
| **memory** | Built-in | Decision logging, knowledge graph | ✅ Active |

### Recommended (Add When Needed)
| Server | Type | Purpose | Setup |
|--------|------|---------|-------|
| **vercel** | Remote | Deployment, env vars, domains | Remote MCP |
| **resend** | Local | Email management | `npx @resend/mcp` |
| **sentry** | Local | Error tracking | `@sentry/mcp-server` |
| **n8n** | Local | Workflow automation | Self-hosted |
| **figma** | Remote | Design integration | Remote MCP |

---

## Model Configuration
- **Big model:** `openai/gpt-4o` (complex tasks, architecture decisions)
- **Small model:** `openai/gpt-4o-mini` (simple edits, quick responses)

---

## Environment Variables (Required)
```
DATABASE_URL          # Supabase PostgreSQL connection
DIRECT_URL            # Supabase direct connection (for Prisma)
NEXTAUTH_SECRET       # Auth session encryption
NEXTAUTH_URL          # App URL (https://cutqueue-amber.vercel.app)
NEXT_PUBLIC_APP_URL   # Public app URL
NEXT_PUBLIC_APP_NAME  # "QueueForge"
CRON_SECRET           # Vercel cron job authentication
OPENAI_API_KEY        # LLM provider key
```

## Environment Variables (Optional)
```
RESEND_API_KEY        # Email service (100 free/day)
GOOGLE_CLIENT_ID      # Google OAuth
GOOGLE_CLIENT_SECRET  # Google OAuth
UPI_ID                # Manual payment collection
```

---

## Project Structure
```
cutqueue/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Sign in/up/forgot-password
│   │   ├── admin/        # Admin dashboard
│   │   ├── dashboard/    # Owner + customer dashboards
│   │   ├── book/         # Customer booking flow
│   │   ├── queue/        # Queue management
│   │   └── onboarding/   # Business setup wizard
│   ├── components/       # Reusable UI components
│   │   └── ui/           # Button, Card, Input, etc.
│   ├── lib/              # Utilities, auth, templates
│   └── types/            # TypeScript declarations
├── prisma/               # Database schema
├── public/               # Static assets
└── opencode.json         # OpenCode configuration
```

---

## Code Conventions
- **Language:** TypeScript (never plain JS)
- **Styling:** Tailwind CSS with custom theme (#0A0F0D dark, #E8B547 gold accent)
- **Components:** Reusable `src/components/ui/` library (Button, Card, Input, Select, etc.)
- **API Routes:** RESTful with proper error handling and rate limiting
- **Auth:** NextAuth.js v5 with JWT sessions, role-based access (CUSTOMER, STAFF, BUSINESS_OWNER, ADMIN)
- **Database:** Prisma 7 with Supabase PostgreSQL, RLS policies on all tables
- **Currency:** Always ₹ (INR), never $

---

## Testing
- **UI Testing:** Playwright browser automation
- **API Testing:** Manual + Playwright
- **Run tests:** `npx playwright test` or manual via OpenCode

---

## Deployment
- **Platform:** Vercel (auto-deploys from `master` branch)
- **Production URL:** https://cutqueue-amber.vercel.app
- **Database:** Supabase (ca-central-1 region)
- **Crons:** Daily keep-alive for Supabase (free tier pauses after 7 days)

---

## Security Rules
1. Never commit secrets to git
2. Use environment variables for all credentials
3. Rate limit all API endpoints
4. RLS policies on every table
5. Input validation on all user-facing endpoints

---

## Decision Log
- **Architecture:** 7 principles (Modularity, Scalability, Reliability, Flexibility, Security, Simplicity, Testability)
- **Pricing:** ₹499/₹999/₹1,999 monthly tiers
- **Payments:** Manual UPI (QR code) → admin activation
- **Free-only constraint:** Zero-cost tools for all infrastructure
- **India-first:** Barbershops/salons as primary market
