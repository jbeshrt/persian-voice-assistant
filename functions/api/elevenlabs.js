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

        console.log('TTS Request for text:', text.substring(0, 50) + '...');

        // ElevenLabs API configuration
        const VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Jessica voice (multilingual - Persian support)
        const MODEL_ID = 'eleven_multilingual_v2'; // Supports Persian

        console.log('Using voice ID:', VOICE_ID);
        console.log('Using model:', MODEL_ID);

        // Call ElevenLabs API
        const elevenLabsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model_id: MODEL_ID,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.0,
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
