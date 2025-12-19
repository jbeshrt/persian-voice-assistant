// Middleware to ensure environment variables are available
// This runs before all Pages Functions

export async function onRequest(context) {
    // Log available environment variables (for debugging)
    console.log('Environment variables available:', Object.keys(context.env || {}));
    
    // Pass context to next function
    return context.next();
}
