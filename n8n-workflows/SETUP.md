# CutQueue + n8n Automation Setup Guide

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Twilio (SMS)   │────▶│   n8n (Oracle)    │────▶│   CutQueue API   │
│   Phone Calls    │     │   Workflows       │     │   Vercel         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Gemini Flash     │
                        │  (Free LLM)       │
                        └──────────────────┘
```

## Cost: $0/month

| Component | Cost | Provider |
|-----------|------|----------|
| n8n | $0 | Self-hosted on Oracle VPS |
| LLM | $0 | Google Gemini Flash (free tier) |
| SMS | ~$0.0079/msg | Twilio (pay per use) |
| Vercel | $0 | Free tier |
| Supabase | $0 | Free tier |

## Step 1: Install n8n on Oracle VPS

```bash
# SSH into your Oracle VPS
ssh ubuntu@YOUR_VPS_IP

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Create n8n directory
mkdir -p ~/n8n && cd ~/n8n

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=YOUR_PASSWORD
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com
      - GENERIC_TIMEZONE=America/New_York
      - CUTQUEUE_API_KEY=YOUR_CUTQUEUE_API_KEY
      - TWILIO_ACCOUNT_SID=YOUR_TWILIO_SID
      - TWILIO_AUTH_TOKEN=YOUR_TWILIO_TOKEN
      - TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
      - GEMINI_API_KEY=YOUR_GEMINI_KEY
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
EOF

# Start n8n
docker-compose up -d

# Check status
docker-compose ps
```

## Step 2: Install Caddy (SSL)

```bash
# Install Caddy
sudo apt install -y caddy

# Configure
sudo tee /etc/caddy/Caddyfile << 'EOF'
n8n.yourdomain.com {
    reverse_proxy localhost:5678
}
EOF

# Restart Caddy
sudo systemctl restart caddy
```

## Step 3: Get Free API Keys

### Twilio (SMS)
1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial gives $15 credit)
3. Get Account SID, Auth Token, and Phone Number
4. ~2000 SMS messages with $15 credit

### Google Gemini (LLM)
1. Go to https://aistudio.google.com/apikey
2. Create API key
3. Free tier: 1500 RPM

### CutQueue API Key
```bash
# Generate a random key
openssl rand -hex 32
```

## Step 4: Import Workflows

1. Open n8n at https://n8n.yourdomain.com
2. Click "Import from File"
3. Import these files:
   - `call-assist.json`
   - `auto-booking.json`
   - `queue-notification.json`
4. Activate each workflow

## Step 5: Configure Twilio Webhook

In Twilio console:
1. Go to Phone Numbers → Your Number
2. Set "A Message Comes In" webhook to:
   ```
   https://n8n.yourdomain.com/webhook/call-assist
   ```
3. Set method to POST

## Workflows

### 1. Call Assist
- Customer texts your Twilio number
- AI checks shop availability
- Responds with services and times
- Offers to book or join queue

### 2. Auto Booking
- Customer sends booking request
- AI extracts details (name, phone, service, time)
- Checks availability
- Creates booking
- Sends confirmation SMS

### 3. Queue Notifications
- When barber calls next customer
- Sends SMS: "Your turn is now!"
- Updates customer in real-time

## Testing

```bash
# Test call assist
curl -X POST https://n8n.yourdomain.com/webhook/call-assist \
  -H "Content-Type: application/json" \
  -d '{"From": "+15551234567", "Body": "Hi, what services do you offer?"}'

# Test booking
curl -X POST https://n8n.yourdomain.com/webhook/auto-booking \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi, I want to book a haircut for tomorrow at 2pm. My name is John and phone is 555-123-4567"}'

# Test queue notification
curl -X POST https://n8n.yourdomain.com/webhook/queue-notify \
  -H "Content-Type: application/json" \
  -d '{"action": "call", "customerName": "John", "ticketNumber": 5, "customerPhone": "+15551234567"}'
```

## Monitoring

```bash
# Check n8n logs
docker-compose logs -f n8n

# Check executions in n8n UI
# https://n8n.yourdomain.com/executions
```

## Backup

```bash
# Backup n8n data
docker-compose exec n8n n8n export:workflow --all --output=/home/node/.n8n/backup.json
docker cp n8n_n8n_data:/home/node/.n8n/backup.json ./n8n-backup-$(date +%Y%m%d).json
```
