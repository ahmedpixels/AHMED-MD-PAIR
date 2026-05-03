const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Database Configuration
const DB_DIR = path.join(__dirname, 'database');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const PLUGINS_DB = path.join(DB_DIR, 'plugins.json');
const STATS_DB = path.join(DB_DIR, 'stats.json');

if (!fs.existsSync(PLUGINS_DB)) fs.writeFileSync(PLUGINS_DB, JSON.stringify([]));
if (!fs.existsSync(STATS_DB)) fs.writeFileSync(STATS_DB, JSON.stringify({ visitors: 0, totalGenerated: 0 }));

function getPlugins() { return JSON.parse(fs.readFileSync(PLUGINS_DB, 'utf-8')); }
function savePlugins(data) { fs.writeFileSync(PLUGINS_DB, JSON.stringify(data, null, 2)); }
function getStats() { return JSON.parse(fs.readFileSync(STATS_DB, 'utf-8')); }
function saveStats(data) { fs.writeFileSync(STATS_DB, JSON.stringify(data, null, 2)); }
function incrementGenerated() {
  const stats = getStats();
  stats.totalGenerated += 1;
  saveStats(stats);
}

// Visitor tracking
app.post('/api/visit', (req, res) => {
  const stats = getStats();
  stats.visitors += 1;
  saveStats(stats);
  res.json({ success: true });
});

// Plugin System APIs
app.get('/api/plugins', (req, res) => {
  const plugins = getPlugins();
  res.json(plugins.filter(p => p.status === 'approved'));
});

app.post('/api/plugins', (req, res) => {
  const { name, description, url, author } = req.body;
  if (!url || (!url.includes('github.com') && !url.includes('gist.github.com') && !url.includes('raw.githubusercontent.com'))) {
    return res.status(400).json({ error: 'Only GitHub or Gist URLs are allowed.' });
  }
  const plugins = getPlugins();
  plugins.push({
    id: Date.now().toString(),
    name, description, url, author,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  savePlugins(plugins);
  res.json({ success: true, message: 'Plugin submitted successfully and is pending approval!' });
});

// Admin Plugin APIs
app.get('/api/admin/plugins', (req, res) => res.json(getPlugins()));

app.post('/api/admin/plugins/:id/approve', (req, res) => {
  const plugins = getPlugins();
  const idx = plugins.findIndex(p => p.id === req.params.id);
  if (idx > -1) {
    plugins[idx].status = 'approved';
    savePlugins(plugins);
    res.json({ success: true });
  } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/admin/plugins/:id', (req, res) => {
  let plugins = getPlugins();
  plugins = plugins.filter(p => p.id !== req.params.id);
  savePlugins(plugins);
  res.json({ success: true });
});

// Session Cleanup
function cleanupExpiredSessions() {
  if (!fs.existsSync(DB_DIR)) return;
  const files = fs.readdirSync(DB_DIR);
  const now = Date.now();
  files.forEach(file => {
    if (file.endsWith('.zip')) {
      const filePath = path.join(DB_DIR, file);
      const stat = fs.statSync(filePath);
      // 5 hours
      if (now - stat.mtimeMs > 18000000) {
        try { fs.unlinkSync(filePath); } catch(e) {}
      }
    }
  });
}
setInterval(cleanupExpiredSessions, 3600000); 

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.createHash('sha256').update('AHMED_MD_SECRET_KEY').digest('base'); 
const IV_LENGTH = 16;

function encryptSession(buffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `AHMED_MD~${iv.toString('hex')}${encrypted.toString('hex')}`;
}

async function compressSession(sessionId) {
  return new Promise((resolve, reject) => {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];
    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', err => reject(err));
    archive.directory(sessionDir, false);
    archive.finalize();
  });
}

function deleteSessionFolder(sessionId) {
  const sessionDir = path.join(__dirname, 'sessions', sessionId);
  if (fs.existsSync(sessionDir)) {
    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch(e) {}
  }
}

const activeSockets = new Map();

async function startWhatsAppConnection(sessionId, socket, phoneNumber, isQR) {
  if (socket.isSessionClosed) return;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions', sessionId));
    const { version } = await fetchLatestBaileysVersion();
    
    let sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false
    });

    activeSockets.set(socket.id, sock);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr && isQR) {
        socket.emit('qr', qr);
      }

      if (connection === 'close') {
        if (socket.isSessionClosed) return;
        const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
           startWhatsAppConnection(sessionId, socket, phoneNumber, isQR);
        } else {
           deleteSessionFolder(sessionId);
           socket.emit('error', 'Connection closed. Please try again.');
        }
      } else if (connection === 'open') {
        await handleSuccessfulConnection(sock, socket, sessionId);
      }
    });

    // Make pairing robust
    if (!isQR && phoneNumber && !sock.authState.creds.me) {
      setTimeout(async () => {
         try {
           let code = await sock.requestPairingCode(phoneNumber);
           socket.emit('pairing_code', code);
         } catch(e) {
           setTimeout(async () => {
              try {
                let code = await sock.requestPairingCode(phoneNumber);
                socket.emit('pairing_code', code);
              } catch (err) {
                socket.emit('error', `Failed to get pairing code: ${err.message}`);
              }
           }, 2000);
         }
      }, 3000); 
    }

    sock.ev.on('creds.update', saveCreds);

  } catch (error) {
    socket.emit('error', error.message);
    deleteSessionFolder(sessionId);
  }
}

io.on('connection', (socket) => {
  let sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  socket.on('start_session', async ({ phoneNumber, isQR }) => {
    socket.isSessionClosed = false;
    deleteSessionFolder(sessionId); 
    await startWhatsAppConnection(sessionId, socket, phoneNumber, isQR);
  });

  socket.on('disconnect', () => {
    socket.isSessionClosed = true;
    if (activeSockets.has(socket.id)) {
      const s = activeSockets.get(socket.id);
      try { s.ws.close(); } catch(e) {}
      activeSockets.delete(socket.id);
    }
    deleteSessionFolder(sessionId);
  });
});

async function handleSuccessfulConnection(sock, socket, sessionId) {
  try {
    socket.emit('connecting'); 
    
    try { await sock.newsletterFollow('120363429242988054@newsletter'); } catch (err) {}

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const zipBuffer = await compressSession(sessionId);
    const shortHex = crypto.randomBytes(16).toString('hex');
    const sessionString = `AHMED-MD_${shortHex}`;
    
    const dbPath = path.join(DB_DIR, `${shortHex}.zip`);
    fs.writeFileSync(dbPath, zipBuffer);
    
    try {
      let userJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
      if (!userJid && sock.authState?.creds?.me?.id) {
         userJid = sock.authState.creds.me.id.split(':')[0] + '@s.whatsapp.net';
      }
      if (userJid) {
        const msgText = `*AHMED-MD SESSION SUCCESSFUL*\n\n*SESSION ID:*\n${sessionString}\n\n*Note:* This Session ID will expire in 5 hours if not used to connect your bot. Do not share this ID with anyone!`;
        await sock.sendMessage(userJid, { text: msgText });
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (err) {
      console.error('Failed to send session via WA', err.message);
    }

    socket.emit('session_generated', sessionString);
    incrementGenerated();
    
    // Cleanup
    socket.isSessionClosed = true;
    try { sock.ws.close(); } catch(e) {}
    activeSockets.delete(socket.id);
    deleteSessionFolder(sessionId);
  } catch(e) {
    socket.isSessionClosed = true;
    socket.emit('error', `Error handling connection: ${e.message}`);
    deleteSessionFolder(sessionId);
  }
}

app.get('/api/session/:id', (req, res) => {
  const id = req.params.id;
  if (!id || !id.startsWith('AHMED-MD_')) return res.status(400).json({ error: 'Invalid ID format' });
  const hex = id.replace('AHMED-MD_', '');
  const filePath = path.join(DB_DIR, `${hex}.zip`);
  if (fs.existsSync(filePath)) res.download(filePath, 'creds.zip');
  else res.status(404).json({ error: 'Session not found or expired' });
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  const stats = getStats();
  res.json({
    activeSockets: activeSockets.size,
    totalGenerated: stats.totalGenerated,
    visitors: stats.visitors,
    timestamp: Date.now()
  });
});

app.post('/api/admin/restart', (req, res) => {
  res.json({ success: true, message: 'Restarting...' });
  setTimeout(() => process.exit(0), 1000);
});

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
