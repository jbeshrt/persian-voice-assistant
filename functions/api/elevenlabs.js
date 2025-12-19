// ElevenLabs TTS API Proxy - Pages Function
// This function securely proxies requests to ElevenLabs API
// Endpoint: POST /api/elevenlabs

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get text from request
        const { text } = await request.json();

        if (!text) {
            return new Response(
                JSON.stringify({ error: 'Text is required' }),
                { 
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        console.log('=== TTS REQUEST STARTED ===');
        console.log('Text:', text.substring(0, 50) + '...');

        // ElevenLabs API configuration
        const API_KEY = env.ELEVENLABS_API_KEY || 'sk_dd205ee3e9c8d886817abaada6bb67c25464c03b8496826f';
        const VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Jessica voice (multilingual - Persian support)
        const MODEL_ID = 'eleven_turbo_v2_5'; // Supports Persian with language_code
        
        // Cloudflare AI Gateway configuration
        const ACCOUNT_ID = '5dfc6fee3a7d9541e75526075602906a';
        const GATEWAY_ID = 'eleven-labs';

        console.log('✅ API key configured, length:', API_KEY.length);
        console.log('API key preview:', API_KEY.substring(0, 10) + '...');
        console.log('Using voice ID:', VOICE_ID);
        console.log('Using model:', MODEL_ID);
        console.log('Using AI Gateway:', GATEWAY_ID);

        // Call ElevenLabs API via Cloudflare AI Gateway with optimized Persian settings
        const elevenLabsResponse = await fetch(
            `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_ID}/elevenlabs/v1/text-to-speech/${VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model_id: MODEL_ID,
                    language_code: 'fa',
                    voice_settings: {
                        stability: 0.65,
                        similarity_boost: 0.85,
                        style: 0.3,
                        use_speaker_boost: true
                    }
                })
            }
        );

        console.log('ElevenLabs API response status:', elevenLabsResponse.status);
        console.log('ElevenLabs API response headers:', Object.fromEntries(elevenLabsResponse.headers.entries()));

        if (!elevenLabsResponse.ok) {
            const errorText = await elevenLabsResponse.text();
            console.error('ElevenLabs API error:', errorText);
            throw new Error(`ElevenLabs API failed: ${elevenLabsResponse.status}`);
        }

        console.log('Successfully received audio from ElevenLabs, streaming to client...');

        // Return audio stream
        return new Response(elevenLabsResponse.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=3600',
            }
        });

    } catch (error) {
        console.error('Error in ElevenLabs proxy:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to generate speech',
                details: error.message 
            }),
            { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}
