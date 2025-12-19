// User Management API - Token-based authentication
// GET /api/user?token=<16-char-token>
// Returns user data and transaction history

export async function onRequestGet(context) {
    const { request, env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');

        if (!token || token.length !== 16) {
            return new Response(
                JSON.stringify({ 
                    error: 'Invalid token',
                    details: 'Token must be exactly 16 characters'
                }),
                { 
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // Check if user exists
        let user = await env.DB.prepare(
            'SELECT id, token, created_at, last_active FROM users WHERE token = ?'
        ).bind(token).first();

        // If user doesn't exist, create new user
        if (!user) {
            console.log('Creating new user with token:', token.substring(0, 4) + '...');
            
            const result = await env.DB.prepare(
                'INSERT INTO users (token) VALUES (?) RETURNING id, token, created_at, last_active'
            ).bind(token).first();

            user = result;
        } else {
            // Update last active timestamp
            await env.DB.prepare(
                'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?'
            ).bind(user.id).run();
        }

        // Get user's transaction history
        const transactions = await env.DB.prepare(
            `SELECT id, timestamp, card_number, amount, currency, payment_type, 
                    voice_transcript, status 
             FROM payments 
             WHERE user_id = ? 
             ORDER BY timestamp DESC 
             LIMIT 50`
        ).bind(user.id).all();

        return new Response(
            JSON.stringify({
                success: true,
                user: {
                    id: user.id,
                    token: user.token,
                    created_at: user.created_at,
                    last_active: user.last_active
                },
                transactions: transactions.results || [],
                transaction_count: transactions.results?.length || 0
            }),
            { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error in user API:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to process user request',
                details: error.message 
            }),
            { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}
