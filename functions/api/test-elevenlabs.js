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
        
        // Check if API key exists
        if (!env.ELEVENLABS_API_KEY) {
            console.error('❌ ELEVENLABS_API_KEY is not set in environment');
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'API key not configured',
                    details: 'ELEVENLABS_API_KEY environment variable is missing'
                }),
                { 
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        console.log('✅ API key exists in environment');
        console.log('API key length:', env.ELEVENLABS_API_KEY.length);
        console.log('API key first 10 chars:', env.ELEVENLABS_API_KEY.substring(0, 10) + '...');

        // Test 1: Get user info (verify API key)
        console.log('Test 1: Checking user info...');
        const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
            method: 'GET',
            headers: {
                'xi-api-key': env.ELEVENLABS_API_KEY,
            }
        });

        console.log('User API response status:', userResponse.status);

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('❌ User API failed:', errorText);
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'API key authentication failed',
                    status: userResponse.status,
                    details: errorText
                }),
                { 
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        const userData = await userResponse.json();
        console.log('✅ User data retrieved:', userData);

        // Test 2: Get voices list
        console.log('Test 2: Fetching voices list...');
        const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': env.ELEVENLABS_API_KEY,
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

        // Test 3: Generate a tiny test audio
        console.log('Test 3: Generating test audio...');
        const testText = 'Hello test';
        const ttsResponse = await fetch(
            'https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9',
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': env.ELEVENLABS_API_KEY,
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
                    apiKeyLength: env.ELEVENLABS_API_KEY.length,
                    userAuthenticated: true,
                    voicesAccessible: true,
                    voiceCount: voicesData.voices?.length || 0,
                    jessicaVoiceFound: !!jessicaVoice,
                    ttsWorking: true,
                    testAudioSize: audioSize
                },
                userData: {
                    subscription: userData.subscription,
                    character_count: userData.character_count,
                    character_limit: userData.character_limit
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
