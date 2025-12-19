# 🎤 Persian Voice Payment Assistant - SaaS on Cloudflare

A complete Persian voice-activated payment assistant powered by Cloudflare Pages, ElevenLabs TTS, and Web Speech API.

## 🌐 Live Demo
**Production URL:** https://06cd1a34.persian-voice-assistant.pages.dev

## ✨ Features

- 🎙️ **Persian Speech Recognition** - Uses browser Web Speech API (fa-IR locale)
- 🔊 **Text-to-Speech** - ElevenLabs API with multilingual Persian support
- 💳 **Payment Processing** - Voice-based card information collection
- 📊 **D1 Database Logging** - Secure payment transaction storage
- 🌍 **Cloudflare Pages** - Deployed globally at the edge
- 🔒 **Secure API Proxy** - ElevenLabs API key hidden via Pages Functions

## 🏗️ Architecture

```
Browser (Web Speech API fa-IR)
    ↓
Cloudflare Pages (Frontend)
    ↓
Pages Functions (Backend API)
    ├── /api/elevenlabs → ElevenLabs TTS
    └── /api/payments → D1 Database
```

## 📋 Prerequisites

- Node.js 18+ installed
- Cloudflare account (already logged in)
- Wrangler CLI configured
- ElevenLabs API key (already set)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development
```bash
# Run local dev server with D1 binding
npm run dev

# Open http://127.0.0.1:8788 in Chrome/Edge
```

### 3. Deploy to Production
```bash
# Deploy to Cloudflare Pages
npm run deploy
```

## ⚙️ Configuration

### D1 Database Binding (IMPORTANT!)

The D1 database binding needs to be configured in Cloudflare Dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **persian-voice-assistant**
3. Click **Settings** → **Functions**
4. Under **D1 database bindings**, click **Add binding**
5. Set:
   - Variable name: `DB`
   - D1 database: `persian_payments`
6. Click **Save**
7. Redeploy the app: `npm run deploy`

### Environment Variables

Already configured:
- `ELEVENLABS_API_KEY` - Set via `wrangler pages secret put`

### Database Schema

The D1 database schema is automatically applied:
- Table: `payments`
- Columns: id, timestamp, card_number, amount, currency, payment_type, voice_transcript, session_id, status, metadata

## 📁 Project Structure

```
persian-voice-assistant/
├── public/                     # Frontend static files
│   ├── index.html             # Main UI (RTL Persian)
│   ├── script.js              # Web Speech API + logic
│   └── style.css              # Beautiful dark theme
├── functions/api/             # Cloudflare Pages Functions
│   ├── elevenlabs.js          # TTS API proxy
│   └── payments.js            # Payment logging
├── schema.sql                 # D1 database schema
├── wrangler.toml              # Cloudflare config
├── .dev.vars                  # Local env variables
└── package.json               # Dependencies & scripts
```

## 🎯 How to Use

1. **Open the app** in Chrome or Edge (best browser support)
2. **Click "شروع گفتگو"** (Start Conversation)
3. **Grant microphone permission**
4. **Speak in Persian**, for example:
   - "پرداخت آنلاین، شماره کارت ۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶، مبلغ پانصد هزار تومان"
5. **Listen to assistant** confirm the payment via voice
6. **View logs** in the payment log section

## 🛠️ Available Scripts

```bash
npm run dev              # Local development server
npm run deploy           # Deploy to Cloudflare Pages
npm run db:create        # Create D1 database
npm run db:migrate       # Apply schema (local)
npm run db:migrate:remote # Apply schema (production)
npm run tail             # View production logs
```

## 🔍 Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Open browser to http://127.0.0.1:8788
# Test Persian speech recognition
# Check console logs for payments
```

### Production Testing
```bash
# View live logs
npm run tail

# Or check Cloudflare Dashboard:
# Workers & Pages → persian-voice-assistant → Logs
```

## 📊 Database Queries

```bash
# View all payments (local)
npx wrangler d1 execute persian_payments --command "SELECT * FROM payments"

# View all payments (production)
npx wrangler d1 execute persian_payments --remote --command "SELECT * FROM payments ORDER BY timestamp DESC LIMIT 10"
```

## 🌍 Deployment Status

- **Production URL:** https://06cd1a34.persian-voice-assistant.pages.dev
- **D1 Database:** `persian_payments` (d1c558d5-c0d8-41f0-8b1c-7411b72c7d35)
- **Region:** Western Europe (WEUR)
- **Status:** ✅ Deployed

## 🔧 Troubleshooting

### Speech Recognition Not Working
- Use Chrome or Edge browser
- Ensure HTTPS (required for Web Speech API)
- Grant microphone permissions
- Check browser console for errors

### ElevenLabs TTS Fails
- Verify API key is set: `npx wrangler pages secret list --project-name persian-voice-assistant`
- Check ElevenLabs API quota/limits
- View production logs: `npm run tail`

### D1 Database Not Connected
- Configure D1 binding in Cloudflare Dashboard (see Configuration section)
- Verify database ID in wrangler.toml matches your database
- Check binding name is `DB` (case-sensitive)

### Payment Logs Not Showing
- Open browser DevTools → Console tab
- Check for API errors
- Verify D1 binding is configured
- Run: `npm run tail` to see server logs

## 📝 API Endpoints

### POST /api/elevenlabs
Converts Persian text to speech using ElevenLabs API.

**Request:**
```json
{
  "text": "سلام! پرداخت شما ثبت شد."
}
```

**Response:** Audio stream (audio/mpeg)

### POST /api/payments
Logs payment transaction to D1 database.

**Request:**
```json
{
  "cardNumber": "****1234",
  "amount": 500000,
  "currency": "IRR",
  "transcript": "پرداخت آنلاین...",
  "sessionId": "session_123"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": 1,
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

### GET /api/payments
Retrieves recent payment logs.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "payments": [...]
}
```

## 🎨 Features Implemented

✅ Persian Web Speech API (fa-IR)  
✅ ElevenLabs multilingual TTS  
✅ Payment card info extraction  
✅ D1 database storage  
✅ CLI console logging  
✅ Beautiful RTL UI  
✅ Cloudflare Pages deployment  
✅ Secure API key management  
✅ Real-time voice feedback  
✅ Session tracking  
✅ Production-ready SaaS  

## 🔐 Security

- API keys stored as Cloudflare secrets (not in code)
- Card numbers masked (only last 4 digits stored)
- CORS configured for API endpoints
- HTTPS enforced on production

## 📈 Scalability

- **Cloudflare Pages:** Unlimited requests (free tier)
- **Pages Functions:** 100K requests/day (free tier)
- **D1 Database:** 5M reads, 100K writes/day (free tier)
- **Global CDN:** Served from 300+ locations worldwide

## 💰 Cost

- Cloudflare: **$0/month** (free tier)
- ElevenLabs: ~$22/month (50K characters for TTS)

## 🚀 Next Steps

1. Configure D1 binding in Cloudflare Dashboard
2. Test on production URL
3. Monitor logs: `npm run tail`
4. Add more payment methods
5. Implement transaction history UI
6. Add authentication
7. Integrate real payment gateways

## 📞 Support

For issues or questions:
- Check Cloudflare Dashboard logs
- Run `npm run tail` for real-time logs
- Review browser console for frontend errors

---

**Built with ❤️ using Cloudflare Pages, ElevenLabs, and Web Speech API**
