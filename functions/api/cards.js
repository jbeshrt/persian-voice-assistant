// Cards Management API
// GET /api/cards?token=xxx - Get user's cards
// POST /api/cards - Add new card
// DELETE /api/cards?token=xxx&id=xxx - Delete card

export async function onRequestGet(context) {
    const { request, env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
                JSON.stringify({ error: 'Invalid token' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE token = ?'
        ).bind(token).first();

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user's cards (mask sensitive data for display)
        const cards = await env.DB.prepare(
            `SELECT id, 
                    substr(card_number, -4) as last_four,
                    card_number,
                    expire_month, expire_year, card_name, is_default, created_at
             FROM cards WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`
        ).bind(user.id).all();

        return new Response(
            JSON.stringify({
                success: true,
                cards: cards.results || []
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error fetching cards:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const data = await request.json();
        const { token, cardNumber, cvv2, expireMonth, expireYear, cardName, setAsDefault } = data;

        console.log('Saving card for token:', token?.substring(0, 4) + '...');

        // Validate token
        if (!token || token.length !== 16) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate card data
        if (!cardNumber || !cvv2 || !expireMonth || !expireYear) {
            return new Response(
                JSON.stringify({ error: 'Missing required card information' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate card number (16 digits)
        if (!/^\d{16}$/.test(cardNumber)) {
            return new Response(
                JSON.stringify({ error: 'Card number must be 16 digits' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate CVV2 (3-4 digits)
        if (!/^\d{3,4}$/.test(cvv2)) {
            return new Response(
                JSON.stringify({ error: 'CVV2 must be 3 or 4 digits' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate expire month (01-12)
        if (!/^(0[1-9]|1[0-2])$/.test(expireMonth)) {
            return new Response(
                JSON.stringify({ error: 'Expire month must be 01-12' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate expire year (2 digits)
        if (!/^\d{2}$/.test(expireYear)) {
            return new Response(
                JSON.stringify({ error: 'Expire year must be 2 digits' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE token = ?'
        ).bind(token).first();

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // If setting as default, unset other defaults
        if (setAsDefault) {
            await env.DB.prepare(
                'UPDATE cards SET is_default = 0 WHERE user_id = ?'
            ).bind(user.id).run();
        }

        // Insert card
        const result = await env.DB.prepare(
            `INSERT INTO cards (user_id, card_number, cvv2, expire_month, expire_year, card_name, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            user.id,
            cardNumber,
            cvv2,
            expireMonth,
            expireYear,
            cardName || null,
            setAsDefault ? 1 : 0
        ).run();

        console.log('✅ Card saved for user:', user.id, 'Card ID:', result.meta.last_row_id);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Card saved successfully',
                cardId: result.meta.last_row_id
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error saving card:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        const cardId = url.searchParams.get('id');

        if (!token || !cardId) {
            return new Response(
                JSON.stringify({ error: 'Token and card ID required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get user
        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE token = ?'
        ).bind(token).first();

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Delete card (only if belongs to user)
        await env.DB.prepare(
            'DELETE FROM cards WHERE id = ? AND user_id = ?'
        ).bind(cardId, user.id).run();

        console.log('🗑️  Card deleted:', cardId, 'for user:', user.id);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Card deleted successfully'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error deleting card:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}
