/**
 * Supabase Client
 * Configured for Node.js 18 compatibility:
 * - Realtime disabled (avoids WebSocket hangs)
 * - Auth persistence disabled (server-side, no localStorage)
 * - Native fetch used explicitly
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌  Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession:   false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
    realtime: {
        // Disable realtime to prevent WebSocket connection issues on Node 18
        timeout: 1,
        params:  { eventsPerSecond: 0 },
    },
    global: {
        // Explicitly use native fetch (fixes Node 18 fetch issues)
        fetch: (...args) => fetch(...args),
    },
});

module.exports = supabase;
