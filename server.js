/**
 * BOCRA Customer Portal - Backend Server
 * Node.js + Express + Supabase
 *
 * Routes:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   GET    /api/user/profile
 *   PATCH  /api/user/profile
 *   GET    /api/user/stats
 *   GET    /api/user/activity
 *   POST   /api/user/change-password
 *   DELETE /api/user/account
 *   GET    /api/user/complaints             — list own complaints
 *   POST   /api/user/complaints             — submit (multipart, up to 5 files × 2 MB)
 *   GET    /api/user/complaints/track/:ref  — track own complaint
 *   GET    /api/admin/complaints            — all complaints (admin)
 *   PUT    /api/admin/update/:ref           — update status / notes (admin)
 *   GET    /api/user/devices
 *   POST   /api/user/devices
 *   GET    /api/user/licenses
 *   POST   /api/user/licenses
 *   GET    /api/user/notifications
 *   PATCH  /api/user/notifications/read-all
 *   GET    /api/faqs
 *   GET    /uploads/:filename               — uploaded complaint attachments
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { verifyTransport } = require('./services/email');

const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const complaintsRoutes = require('./routes/complaints');
const devicesRoutes = require('./routes/devices');
const licensesRoutes = require('./routes/licenses');
const notificationsRoutes = require('./routes/notifications');
const faqsRoutes = require('./routes/faqs');
const { router: adminRoutes } = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production: restrict to BASE_URL only.
// In development (NODE_ENV !== 'production'): allow all origins for convenience.
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [BASE_URL]
    : true; // true = reflect any origin (cors default)

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Static Frontend Files ────────────────────────────────────────────────────
// Serve the HTML/CSS/JS files from the parent directory (project root)
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// Serve uploaded complaint attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Public Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqsRoutes); // FAQs are public

// Admin routes (protected by admin JWT — see routes/admin.js)
app.use('/api/admin', adminRoutes);

// ─── Protected Routes (JWT required) ─────────────────────────────────────────
app.use('/api/user/complaints', authMiddleware, complaintsRoutes);
app.use('/api/user/devices', authMiddleware, devicesRoutes);
app.use('/api/user/licenses', authMiddleware, licensesRoutes);
app.use('/api/user/notifications', authMiddleware, notificationsRoutes);
app.use('/api/user', authMiddleware, userRoutes); // profile, stats, activity, etc.

// ─── Catch-all: serve frontend for any non-API route ─────────────────────────
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
    } else {
        res.status(404).json({ message: 'API endpoint not found.' });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║  BOCRA Customer Portal Backend           ║');
    console.log(`  ║  Listening on port ${PORT}                  ║`);
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log(`  Frontend : ${BASE_URL}/index.html`);
    console.log(`  API Base : ${BASE_URL}/api/`);
    console.log(`  Env      : ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    await verifyTransport();
    console.log('');
});

module.exports = app;
