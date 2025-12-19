// Payment Logging API - Pages Function
// This function logs payment transactions to D1 database
// Endpoint: POST /api/payments

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get payment data from request
        const paymentData = await request.json();
        const { token, cardNumber, amount, currency, transcript, sessionId } = paymentData;

        // Validate required fields
        if (!token || token.length !== 16) {
            return new Response(
                JSON.stringify({ error: 'Valid 16-character token is required' }),
                { 
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        if (!cardNumber || !amount) {
            return new Response(
                JSON.stringify({ error: 'Card number and amount are required' }),
                { 
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // Get or create user by token
        let user = await env.DB.prepare(
            'SELECT id FROM users WHERE token = ?'
        ).bind(token).first();

        if (!user) {
            // Create new user if doesn't exist
            const newUser = await env.DB.prepare(
                'INSERT INTO users (token) VALUES (?) RETURNING id'
            ).bind(token).first();
            user = newUser;
        }

        console.log('Logging payment for user:', user.id, {
            card: cardNumber,
            amount,
            currency: currency || 'IRR',
            session: sessionId
        });

        // Insert into D1 database
        const result = await env.DB.prepare(
            `INSERT INTO payments 
            (user_id, card_number, amount, currency, payment_type, voice_transcript, session_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
            user.id,
            cardNumber,
            amount,
            currency || 'IRR',
            'online',
            transcript || '',
            sessionId || '',
            'logged'
        )
        .run();

        // Log to console for visibility (as requested)
        console.log('✅ Payment Logged Successfully:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`💳 Card: ${cardNumber}`);
        console.log(`💰 Amount: ${amount} ${currency || 'IRR'}`);
        console.log(`📝 Transcript: ${transcript || 'N/A'}`);
        console.log(`🔑 Session: ${sessionId || 'N/A'}`);
        console.log(`⏰ Time: ${new Date().toISOString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Payment logged successfully',
                paymentId: result.meta.last_row_id,
                timestamp: new Date().toISOString()
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('❌ Error logging payment:', error);
        console.error('Error details:', error.message, error.stack);
        
        return new Response(
            JSON.stringify({ 
                error: 'Failed to log payment',
                details: error.message 
            }),
            { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}

// GET endpoint to retrieve payment logs
export async function onRequestGet(context) {
    const { env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        // Get latest 50 payments
        const { results } = await env.DB.prepare(
            `SELECT * FROM payments ORDER BY timestamp DESC LIMIT 50`
        ).all();

        return new Response(
            JSON.stringify({
                success: true,
                count: results.length,
                payments: results
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error retrieving payments:', error);
        
        return new Response(
            JSON.stringify({ 
                error: 'Failed to retrieve payments',
                details: error.message 
            }),
            { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
}
