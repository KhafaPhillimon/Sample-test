/**
 * BOCRA Customer Portal - Database Client
 *
 * The database has been migrated from SQLite to Supabase (PostgreSQL).
 * This module re-exports the shared Supabase client for any legacy
 * code that imports from 'db.js' instead of 'supabase.js'.
 *
 * Configure via environment variables in .env:
 *   SUPABASE_URL — your project URL
 *   SUPABASE_KEY — your anon/service-role key
 */

module.exports = require('./supabase');
