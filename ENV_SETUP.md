# Environment variables for Cloudflare Pages
# Note: This file structure is for reference only
# Actual environment variables must be set in Cloudflare Dashboard

## How to set environment variables in Cloudflare Pages:

1. Go to: https://dash.cloudflare.com/
2. Navigate to: Workers & Pages → persian-voice-assistant
3. Click: Settings → Environment variables
4. Add variable:
   - Variable name: ELEVENLABS_API_KEY
   - Value: 8abfad1cef358f6947d2bdad10befcd5643189edc78b56780f99874503e29a98
   - Environment: Production (and Preview if needed)
5. Click Save
6. Redeploy the application

Note: Secrets (set via `wrangler pages secret put`) are different from environment variables.
For Pages Functions to access values, they must be set as Environment Variables in the dashboard.
