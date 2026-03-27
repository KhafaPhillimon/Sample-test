/**
 * BOCRA Admin Portal - Standalone Server
 * Runs on http://localhost:3002
 * Communicates with API on http://localhost:3001
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3002;
const PROJECT_ROOT = path.join(__dirname, '..');

// Basic Middleware
app.use(cors());
// Serve frontend source files
app.use(express.static(PROJECT_ROOT));
// Serve uploaded attachments and documents securely to admins
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Specifically serve admin.html as the index for this port
app.get('/', (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, 'admin.html'));
});

// Explicit routes for admin assets to ensure no confusion
app.get('/admin.html', (req, res) => res.sendFile(path.join(PROJECT_ROOT, 'admin.html')));
app.get('/admin.js',   (req, res) => res.sendFile(path.join(PROJECT_ROOT, 'admin.js')));
app.get('/admin.css',  (req, res) => res.sendFile(path.join(PROJECT_ROOT, 'admin.css')));

app.listen(PORT, () => {
    console.log('');
	console.log('  ╔══════════════════════════════════════════╗');
	console.log('  ║  BOCRA Admin Portal Standalone Server    ║');
	console.log(`  ║  Listening on port ${PORT}                  ║`);
	console.log('  ╚══════════════════════════════════════════╝');
	console.log('');
	console.log(`  Admin URL : http://localhost:${PORT}`);
    console.log(`  API URL   : http://localhost:3001/api`);
	console.log('');
});
