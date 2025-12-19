# AI Gateway Setup for Persian Voice Assistant

## Why AI Gateway?
Cloudflare AI Gateway helps avoid ElevenLabs free tier abuse detection when using serverless functions. It provides:
- Caching to reduce API calls
- Analytics and monitoring
- Protection from IP-based blocking

## Setup Steps

### 1. Create AI Gateway in Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/5dfc6fee3a7d9541e75526075602906a/ai/ai-gateway
2. Click **"Create Gateway"**
3. Enter gateway name: `persian-voice-gateway`
4. Click **"Create"**

### 2. Configuration Details

- **Account ID**: `5dfc6fee3a7d9541e75526075602906a`
- **Gateway Name**: `persian-voice-gateway`
- **ElevenLabs API Key**: `sk_dd205ee3e9c8d886817abaada6bb67c25464c03b8496826f`

### 3. Gateway Endpoint

The code will use this endpoint format:
```
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/elevenlabs/v1/text-to-speech/{voice_id}
```

Full URL:
```
https://gateway.ai.cloudflare.com/v1/5dfc6fee3a7d9541e75526075602906a/persian-voice-gateway/elevenlabs/v1/text-to-speech/cgSgspJ2msm6clMCkdW9
```

### 4. Benefits

- ✅ Bypasses Cloudflare IP blocking by ElevenLabs
- ✅ Adds caching layer (reduces API calls)
- ✅ Provides analytics dashboard
- ✅ Rate limiting and cost controls

### 5. After Creation

Once the gateway is created in the dashboard, the application will automatically use it. No code changes needed - already configured in:
- `functions/api/elevenlabs.js`
- `functions/api/test-elevenlabs.js`

## Testing

After gateway creation:
1. Deploy the app: `npm run deploy`
2. Test API connection: Visit `/api/test-elevenlabs`
3. Test audio playback: Click 🧪 تست صدا button

## Monitoring

View gateway analytics at:
https://dash.cloudflare.com/5dfc6fee3a7d9541e75526075602906a/ai/ai-gateway/persian-voice-gateway
