# Open Source Alternatives for QueueForge

## Current Stack Analysis

| Service | Current | Cost | Open Source Alternative |
|---------|---------|------|------------------------|
| Database | Supabase (PostgreSQL) | Free tier to $25/mo | Self-hosted PostgreSQL (Docker/Ubuntu) |
| Auth | Supabase Auth / NextAuth.js | Free | NextAuth.js (already using) + custom providers |
| Email | Resend | 100/day free to $20/mo | Postal, Mailu, Mailcow, Haraka (self-hosted SMTP) |
| SMS | Twilio | $0.0079/msg | Gammu, Kannel, Ozeki NG, PlaySMS (with GSM modem) |
| Hosting | Vercel | Free tier to $20/mo | Coolify, Dokku, CapRover, Portainer (self-hosted) |
| Automation | n8n Cloud | $20/mo | n8n Self-hosted (already planned on Oracle Cloud) |
| File Storage | Supabase Storage | Free tier to $25/mo | MinIO, SeaweedFS, Garage (S3-compatible) |
| Realtime | Supabase Realtime | Free tier | Socket.io, Centrifugo, Ably (self-hosted) |
| Edge Functions | Supabase Edge Functions | Free tier | Deno Deploy (free), Cloudflare Workers (free) |
| Analytics | Supabase Analytics | Free tier | Plausible (self-hosted), Umami, Matomo |

## Recommended Open Source Stack

### 1. Database: PostgreSQL (Self-hosted)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: queueforge
      POSTGRES_USER: queueforge
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
volumes:
  postgres_data:
```

### 2. Email: Postal (Self-hosted)
```yaml
services:
  postal:
    image: ghcr.io/postalhq/postal:latest
    environment:
      POSTAL_DATABASE_HOST: postgres
      POSTAL_DATABASE_NAME: postal
      POSTAL_DATABASE_USERNAME: postal
      POSTAL_DATABASE_PASSWORD: ${POSTAL_DB_PASSWORD}
      POSTAL_RABBITMQ_HOST: rabbitmq
      POSTAL_WEB_HOST: mail.yourdomain.com
      POSTAL_WEB_PORT: 443
      POSTAL_SMTP_HOST: smtp.yourdomain.com
      POSTAL_SMTP_PORT: 25
```

### 3. SMS: Gammu + GSM Modem or Free SMS APIs
```bash
# Option A: Hardware GSM modem (one-time cost ~$50)
# gammu-smsdrc config for USB modem

# Option B: Free SMS APIs (limited)
# - TextBelt (1 free/day)
# - Semaphore (Philippines)
# - FreeSMS8 (limited countries)
```

### 4. Hosting: Coolify (Self-hosted PaaS)
```bash
# Install on any VPS (Oracle Cloud Free Tier, Hetzner, DigitalOcean)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
# Manages: Docker, Databases, SSL, Backups, Monitoring
```

### 5. File Storage: MinIO (S3-compatible)
```yaml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
```

### 6. Realtime: Socket.io + Redis
```javascript
// socket.io server
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://redis:6379' });
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
  cors: { origin: process.env.NEXT_PUBLIC_APP_URL }
});

io.adapter(createAdapter(pubClient, subClient));
```

### 7. Analytics: Umami (Self-hosted)
```yaml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    environment:
      DATABASE_URL: postgresql://umami:password@postgres:5432/umami
      HASH_SALT: ${HASH_SALT}
    ports:
      - "3000:3000"
```

## Migration Plan

### Phase 1: Database & Auth (Week 1)
- Spin up PostgreSQL on Oracle Cloud / Hetzner
- Run Prisma migrations: npx prisma migrate deploy
- Configure NextAuth.js with email/password + Google OAuth
- Test all API routes

### Phase 2: Email & SMS (Week 2)
- Deploy Postal for transactional emails
- Configure SMTP in NextAuth.js
- Set up SMS provider (Gammu + modem or free API)
- Test verification/reset flows

### Phase 3: Hosting & Services (Week 3)
- Deploy Coolify on Oracle Cloud Free Tier
- Deploy MinIO for file uploads
- Deploy Socket.io + Redis for realtime
- Deploy Umami for analytics

### Phase 4: Automation & Monitoring (Week 4)
- Deploy n8n on Coolify
- Migrate n8n workflows
- Set up monitoring (Uptime Kuma, Prometheus + Grafana)
- Configure backups

## Cost Comparison (Monthly)

| Component | Current (Paid) | Open Source (Self-hosted) |
|-----------|----------------|---------------------------|
| Database | $25 | $0 (Oracle Cloud Free) |
| Email | $20 | $0 (Postal on same VPS) |
| SMS | Variable | $0 (Gammu + modem) or $0 (free APIs) |
| Hosting | $20 | $0 (Coolify on same VPS) |
| Storage | $25 | $0 (MinIO on same VPS) |
| Realtime | Included | $0 (Socket.io on same VPS) |
| Analytics | Included | $0 (Umami on same VPS) |
| Total | ~$90+/mo | ~$0/mo (hardware only) |

## Oracle Cloud Free Tier Resources
- 2 AMD Compute VMs (1/8 OCPU, 1 GB RAM each)
- 4 Ampere A1 ARM VMs (4 OCPU, 24 GB RAM each) - Best for this stack
- 200 GB Block Storage
- 10 TB Network

Recommended: Use 1 Ampere A1 VM (4 OCPU, 24 GB RAM) for everything:
- PostgreSQL (2 GB)
- Redis (512 MB)
- Postal (1 GB)
- MinIO (1 GB)
- Coolify (1 GB)
- n8n (1 GB)
- Socket.io (512 MB)
- Umami (512 MB)
- Coolify overhead (1 GB)
Total: ~8 GB (plenty of headroom)

## Quick Start Commands

```bash
# 1. Provision Oracle Cloud Ampere A1 VM (4 OCPU, 24 GB)
# 2. SSH in and install Docker + Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 3. Access Coolify at https://your-ip:8000
# 4. Add resources via Coolify UI:
#    - PostgreSQL database
#    - Redis
#    - MinIO
#    - Postal
#    - n8n
#    - Umami
#    - Socket.io (custom Docker)
#    - Your Next.js app

# 5. Configure DNS + SSL (Coolify handles Let's Encrypt)
# 6. Update environment variables in Coolify
# 7. Deploy!
```

## Environment Variables for Self-hosted Stack

```env
# Database
DATABASE_URL="postgresql://queueforge:password@postgres:5432/queueforge"

# Email (Postal)
SMTP_HOST="postal"
SMTP_PORT=25
SMTP_USER="postal@yourdomain.com"
SMTP_PASSWORD="postal_password"

# SMS (Gammu or free API)
SMS_PROVIDER="gammu"  # or "textbelt"
GAMMU_DEVICE="/dev/ttyUSB0"

# File Storage (MinIO)
S3_ENDPOINT="http://minio:9000"
S3_ACCESS_KEY="minio_user"
S3_SECRET_KEY="minio_password"
S3_BUCKET="queueforge"
S3_REGION="us-east-1"

# Realtime (Socket.io)
SOCKET_IO_URL="http://socketio:3001"

# Analytics (Umami)
UMAMI_WEBSITE_ID="your-website-id"

# n8n
N8N_API_KEY="your-n8n-key"
N8N_WEBHOOK_URL="https://n8n.yourdomain.com"

# App
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generated-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Next Steps

1. Provision Oracle Cloud Ampere A1 VM (4 OCPU, 24 GB RAM)
2. Install Coolify for PaaS-like management
3. Deploy all services via Coolify UI
4. Migrate data from Supabase to self-hosted PostgreSQL
5. Update DNS to point to new VPS
6. Test all flows end-to-end
7. Cancel Supabase/Resend/Vercel subscriptions

The entire stack runs on $0/month after initial hardware setup!