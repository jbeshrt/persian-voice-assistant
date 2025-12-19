# 🧪 Testing Guide - Persian Voice Payment Assistant

## ✅ Complete Deployment Checklist

### 1. Production Deployment Status
- ✅ Deployed to Cloudflare Pages
- ✅ Production URL: https://06cd1a34.persian-voice-assistant.pages.dev
- ✅ D1 Database created and schema applied
- ✅ ElevenLabs API key configured as secret
- ⚠️ **ACTION REQUIRED:** Configure D1 binding in dashboard

### 2. Configure D1 Database Binding

**IMPORTANT:** The D1 database needs to be manually bound in Cloudflare Dashboard.

**Steps:**
1. Visit: https://dash.cloudflare.com/
2. Go to **Workers & Pages** → **persian-voice-assistant**
3. Click **Settings** tab
4. Scroll to **Functions** section
5. Under **D1 database bindings**, click **Add binding**
6. Configure:
   - **Variable name:** `DB`
   - **D1 database:** Select `persian_payments` from dropdown
7. Click **Save**
8. Redeploy: `npm run deploy`

### 3. Testing Locally

```bash
# Terminal 1: Start local dev server
npm run dev

# Browser: Open http://127.0.0.1:8788
```

**Local Test Checklist:**
- [ ] Page loads with Persian UI (RTL direction)
- [ ] Click "شروع گفتگو" button
- [ ] Grant microphone permission
- [ ] Speak in Persian (Chrome/Edge recommended)
- [ ] Transcript appears in UI
- [ ] Assistant responds (text visible)
- [ ] Payment logged in console
- [ ] Payment appears in log section

### 4. Testing Production

```bash
# Open production URL in browser
# https://06cd1a34.persian-voice-assistant.pages.dev
```

**Production Test Checklist:**
- [ ] Page loads over HTTPS
- [ ] All styles and scripts load
- [ ] No console errors
- [ ] Speech recognition works
- [ ] TTS audio plays (if API key valid)
- [ ] Payments logged to D1
- [ ] View logs: `npm run tail`

### 5. Test Cases

#### Test Case 1: Basic Payment
**Say in Persian:**
```
"پرداخت آنلاین، شماره کارت یک دو سه چهار پنج شش، مبلغ پانصد هزار تومان"
```

**Expected Result:**
- ✅ Transcript captured
- ✅ Card number extracted (or mock used)
- ✅ Amount extracted (500,000)
- ✅ Confirmation spoken
- ✅ Payment logged to D1
- ✅ Visible in payment log section

#### Test Case 2: Simple Command
**Say in Persian:**
```
"پرداخت کارت"
```

**Expected Result:**
- ✅ Transcript captured
- ✅ Mock data used for testing
- ✅ Payment processed
- ✅ Logged to database

#### Test Case 3: API Endpoints

**Test ElevenLabs TTS:**
```bash
curl -X POST https://06cd1a34.persian-voice-assistant.pages.dev/api/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام، تست صدا"}' \
  --output test-audio.mp3
```

**Test Payment Logging:**
```bash
curl -X POST https://06cd1a34.persian-voice-assistant.pages.dev/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "****1234",
    "amount": 100000,
    "currency": "IRR",
    "transcript": "تست پرداخت",
    "sessionId": "test_session"
  }'
```

**Get Payment Logs:**
```bash
curl https://06cd1a34.persian-voice-assistant.pages.dev/api/payments
```

### 6. Verify D1 Database

**Local database:**
```bash
npx wrangler d1 execute persian_payments \
  --command "SELECT * FROM payments ORDER BY timestamp DESC LIMIT 5"
```

**Production database:**
```bash
npx wrangler d1 execute persian_payments --remote \
  --command "SELECT * FROM payments ORDER BY timestamp DESC LIMIT 5"
```

### 7. View Live Logs

**Terminal command:**
```bash
npm run tail
```

**Or in Cloudflare Dashboard:**
1. Go to **Workers & Pages** → **persian-voice-assistant**
2. Click **Logs** tab
3. View real-time requests and errors

### 8. Browser Compatibility

**Recommended:**
- ✅ Chrome 90+ (Best support)
- ✅ Edge 90+

**Limited Support:**
- ⚠️ Safari (Web Speech API limited)
- ⚠️ Firefox (Requires flag enabled)

**Mobile:**
- ✅ Chrome Android (Works well)
- ⚠️ Safari iOS (Limited)

### 9. Troubleshooting

#### Issue: "Speech recognition not supported"
**Solution:**
- Use Chrome or Edge browser
- Ensure HTTPS connection
- Check browser console for errors

#### Issue: ElevenLabs API returns 403
**Solution:**
- Verify API key is valid
- Check ElevenLabs account status
- Verify quota not exceeded
- Test API key directly:
  ```bash
  curl https://api.elevenlabs.io/v1/user \
    -H "xi-api-key: YOUR_KEY"
  ```

#### Issue: Payments not saving to D1
**Solution:**
- Configure D1 binding in dashboard (see step 2)
- Verify binding name is exactly `DB`
- Check logs: `npm run tail`
- Test database connection:
  ```bash
  npx wrangler d1 execute persian_payments --remote \
    --command "SELECT COUNT(*) FROM payments"
  ```

#### Issue: No audio playback
**Solution:**
- Check browser autoplay policy
- User must interact with page first (click button)
- Verify ElevenLabs API response
- Check browser console for errors

### 10. Performance Monitoring

**Metrics to monitor:**
- Response times (should be < 2s for TTS)
- D1 write latency (< 100ms)
- Pages Function execution time
- Error rates

**Cloudflare Analytics:**
1. Dashboard → **persian-voice-assistant**
2. Click **Analytics** tab
3. View requests, bandwidth, errors

### 11. Security Checklist

- [x] API keys stored as secrets (not in code)
- [x] Card numbers masked in storage
- [x] HTTPS enforced
- [x] CORS configured
- [x] No sensitive data in client-side code
- [x] Environment variables in .dev.vars (gitignored)

### 12. Final Verification

**Run all tests:**
```bash
# 1. Local development works
npm run dev

# 2. Production deployment successful
npm run deploy

# 3. Database accessible
npm run db:migrate:remote

# 4. Secrets configured
npx wrangler pages secret list --project-name persian-voice-assistant

# 5. Live logs showing
npm run tail
```

## 🎉 Success Criteria

Your SaaS is ready when:
- ✅ Production URL loads without errors
- ✅ Persian speech recognition works
- ✅ TTS audio plays (voice response)
- ✅ Payments logged to D1 database
- ✅ Console logs visible
- ✅ All API endpoints respond correctly
- ✅ No errors in production logs

## 📊 Next Steps After Testing

1. **Monitor Usage:**
   - Check Cloudflare Analytics daily
   - Monitor ElevenLabs quota
   - Review D1 database growth

2. **Improve Features:**
   - Add transaction history page
   - Implement user authentication
   - Add payment confirmation emails
   - Integrate real payment gateways

3. **Scale:**
   - Add more voice commands
   - Support multiple languages
   - Implement conversation context
   - Add payment analytics dashboard

4. **Production Hardening:**
   - Add rate limiting
   - Implement retry logic
   - Add error tracking (Sentry)
   - Set up monitoring alerts

---

**Your Persian Voice Payment Assistant is deployed and ready! 🚀**

**Production URL:** https://06cd1a34.persian-voice-assistant.pages.dev
