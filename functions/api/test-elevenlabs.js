// ElevenLabs API Connection Test - Pages Function
// This function tests the ElevenLabs API connection and API key validity
// Endpoint: GET /api/test-elevenlabs

export async function onRequestGet(context) {
    const { env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        console.log('=== ELEVENLABS API TEST STARTED ===');
        
        // ElevenLabs API Key
        const API_KEY = env.ELEVENLABS_API_KEY || 'sk_dd205ee3e9c8d886817abaada6bb67c25464c03b8496826f';
        
        // Cloudflare AI Gateway configuration
        const ACCOUNT_ID = '5dfc6fee3a7d9541e75526075602906a';
        const GATEWAY_ID = 'eleven-labs';

        console.log('✅ API key configured');
        console.log('API key length:', API_KEY.length);
        console.log('API key first 10 chars:', API_KEY.substring(0, 10) + '...');
        console.log('Using AI Gateway:', GATEWAY_ID);

        // Test 1: Get voices list via AI Gateway
        console.log('Test 1: Fetching voices list via AI Gateway...');
        const voicesResponse = await fetch(`https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_ID}/elevenlabs/v1/voices`, {
            method: 'GET',
            headers: {
                'xi-api-key': API_KEY,
            }
        });

        console.log('Voices API response status:', voicesResponse.status);

        if (!voicesResponse.ok) {
            const errorText = await voicesResponse.text();
            console.error('❌ Voices API failed:', errorText);
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'Failed to fetch voices',
                    status: voicesResponse.status,
                    details: errorText
                }),
                { 
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        const voicesData = await voicesResponse.json();
        console.log('✅ Voices retrieved:', voicesData.voices?.length || 0, 'voices');

        // Find Jessica voice
        const jessicaVoice = voicesData.voices?.find(v => v.voice_id === 'cgSgspJ2msm6clMCkdW9');
        console.log('Jessica voice found:', !!jessicaVoice);

        // Test 2: Generate test audio via AI Gateway
        console.log('Test 2: Generating test audio via AI Gateway...');
        const testText = 'سلام، تست صدا';
        const ttsResponse = await fetch(
            `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_ID}/elevenlabs/v1/text-to-speech/cgSgspJ2msm6clMCkdW9`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: testText,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            }
        );

        console.log('TTS API response status:', ttsResponse.status);
        console.log('TTS API response headers:', Object.fromEntries(ttsResponse.headers.entries()));

        if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            console.error('❌ TTS API failed:', errorText);
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'Text-to-speech generation failed',
                    status: ttsResponse.status,
                    details: errorText
                }),
                { 
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        const audioSize = parseInt(ttsResponse.headers.get('content-length') || '0');
        console.log('✅ Audio generated, size:', audioSize, 'bytes');

        console.log('=== ALL TESTS PASSED ===');

        return new Response(
            JSON.stringify({ 
                success: true,
                message: 'All ElevenLabs API tests passed',
                tests: {
                    apiKeyPresent: true,
                    apiKeyLength: API_KEY.length,
                    voicesAccessible: true,
                    voiceCount: voicesData.voices?.length || 0,
                    jessicaVoiceFound: !!jessicaVoice,
                    ttsWorking: true,
                    testAudioSize: audioSize
                }
            }),
            { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('=== TEST FAILED ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Test failed with exception',
                details: error.message,
                stack: error.stack
            }),
            { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}
