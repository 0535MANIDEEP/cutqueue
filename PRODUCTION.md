# QueueForge Production Setup Guide

## Step 1: Deploy to Vercel

### 1.1 Push to GitHub
```bash
git push origin master
```

### 1.2 Connect to Vercel
1. Go to https://vercel.com
2. Import your GitHub repo
3. Select "Next.js" framework
4. Click "Deploy"

### 1.3 Set Environment Variables
Go to Vercel → Settings → Environment Variables

Add these:
```
DATABASE_URL=postgresql://postgres.nymxidfkxtbwpehmpcdq:HELLO%21mani10@aws-0-ca-central-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=7fB/DYhgGuaZbn46owoezHM8dk2E2EMwHfK2hvPqHW4=
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 1.4 Get Your Vercel URL
After deploy, Vercel gives you a URL like: `cutqueue-abc123.vercel.app`

Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL with this URL.

---

## Step 2: Set Up Database

### 2.1 Deploy Schema
```bash
npx prisma db push
```

### 2.2 Seed Data (Optional)
```bash
npx prisma db seed
```

### 2.3 Verify Tables
Go to Supabase Dashboard → Table Editor
You should see: User, Business, Service, Queue, Booking, etc.

---

## Step 3: Create First Admin User

### 3.1 Sign Up
1. Go to your Vercel URL
2. Click "Sign Up"
3. Create account with your email

### 3.2 Make Yourself Admin
Go to Supabase Dashboard → SQL Editor
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 3.3 Verify
Refresh the page. You should see the Admin dashboard.

---

## Step 4: Create a Test Business

### 4.1 Sign Up as Business Owner
1. Sign out
2. Sign up with a different email
3. Complete onboarding
4. Add services

### 4.2 Test the Flow
1. Go to `/book`
2. Book an appointment
3. Go to `/queue/join`
4. Join the queue
5. Go to `/dashboard/owner`
6. See the queue and bookings

---

## Step 5: Make It Real-Time

### 5.1 Add Polling (Simplest)
Add this to your dashboard pages to auto-refresh:

```typescript
// Add to owner dashboard
useEffect(() => {
  const interval = setInterval(() => {
    fetchData(businessId)
  }, 5000) // Refresh every 5 seconds
  return () => clearInterval(interval)
}, [businessId])
```

### 5.2 Add WebSocket (Advanced)
For true real-time, use Supabase Realtime:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to queue changes
supabase
  .channel('queue')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'Queue' }, payload => {
    // Update UI when queue changes
    fetchQueue()
  })
  .subscribe()
```

---

## Step 6: Add WhatsApp Notifications

### 6.1 Option A: WhatsApp Business App (Free)
1. Download WhatsApp Business on your phone
2. Create a business profile
3. When customer joins queue, send them a message manually

### 6.2 Option B: WhatsApp Business API (Paid)
1. Sign up at https://business.whatsapp.com
2. Get API key
3. Set up webhook
4. Send automated messages

---

## Step 7: Collect Payments (UPI)

### 7.1 Create UPI QR Code
1. Open PhonePe/Business app
2. Create a QR code for your shop
3. Print it and put it at the counter

### 7.2 Manual Collection
1. Customer pays via UPI
2. They show you the screenshot
3. You confirm the booking

### 7.3 Automated (Later)
1. Integrate Razorpay
2. Customer pays during booking
3. Auto-confirms booking

---

## Step 8: Monitoring

### 8.1 Uptime Monitoring
1. Sign up at https://betterstack.com (free tier)
2. Add your Vercel URL
3. Get alerts when site is down

### 8.2 Error Tracking
1. Sign up at https://sentry.io (free tier)
2. Add to your Next.js app
3. Get alerts for errors

### 8.3 Database Monitoring
1. Go to Supabase Dashboard
2. Check "Database" tab
3. Monitor queries and performance

---

## Step 9: Backups

### 9.1 Database Backup
```bash
# Run daily
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 9.2 GitHub Actions Backup
Create `.github/workflows/backup.yml`:
```yaml
name: Daily Backup
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          pg_dump $DATABASE_URL > backup.sql
          # Upload to cloud storage
```

---

## Step 10: Launch Checklist

### Before Launch
- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] Auth working (login/signup)
- [ ] Queue management working
- [ ] Booking system working
- [ ] Owner dashboard working
- [ ] Customer dashboard working
- [ ] QR code join working
- [ ] Mobile responsive
- [ ] Error handling in place

### Day 1
- [ ] Create test business
- [ ] Add 5 services
- [ ] Test complete flow
- [ ] Set up monitoring
- [ ] Print QR codes

### Week 1
- [ ] Get 3-5 real shops
- [ ] Train owners on how to use
- [ ] Collect feedback
- [ ] Fix any issues

### Month 1
- [ ] Get 10+ shops
- [ ] Start collecting subscriptions
- [ ] Add WhatsApp notifications
- [ ] Improve based on feedback

---

## Troubleshooting

### Problem: Site is slow
**Solution:**
- Check Vercel Function logs
- Optimize database queries
- Add caching

### Problem: Auth not working
**Solution:**
- Check NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Clear browser cookies

### Problem: Database errors
**Solution:**
- Check DATABASE_URL is correct
- Check Supabase is not paused
- Run `npx prisma db push`

### Problem: Queue not updating
**Solution:**
- Add polling interval
- Check WebSocket connection
- Refresh page manually

### Problem: Mobile not working
**Solution:**
- Test on real device
- Check responsive CSS
- Fix any layout issues

---

## Cost Breakdown

### Free Tier (Start Here)
- Vercel Free: $0
- Supabase Free: $0
- GitHub Free: $0
- **Total: $0/month**

### When You Have 10+ Shops
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Domain: $12/year
- **Total: ~₹4,000/month**

### When You Have 50+ Shops
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- WhatsApp API: ₹1,000/month
- Monitoring: $10/month
- **Total: ~₹8,000/month**

---

## Key Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Uptime | 99.9% | BetterStack |
| Response time | <200ms | Vercel Analytics |
| Daily active users | Growing | Supabase queries |
| Queue completions | 50+/day | Database count |
| Booking rate | 20%+ | Bookings / Visitors |
| Error rate | <1% | Sentry |

---

## Support

### If Something Breaks
1. Check Vercel logs
2. Check Supabase logs
3. Check browser console
4. Search error on Google
5. Ask on Stack Overflow

### If You Need Help
1. Read the code
2. Check Next.js docs
3. Check Supabase docs
4. Hire a freelancer

---

## Next Steps

### Week 1-2: Validate
- Get 5 shops to test
- Collect feedback
- Fix critical issues

### Month 1: Launch
- Get 10 paying shops
- Start collecting revenue
- Add WhatsApp notifications

### Month 2-3: Grow
- Add more features
- Scale to 50 shops
- Hire support

### Month 6+: Scale
- Add mobile app
- Expand to new cities
- Raise funding

---

**Remember: Start simple, iterate fast, listen to users.**
