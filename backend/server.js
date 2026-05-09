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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Version check
app.get('/api/version', (req, res) => res.json({ version: '2.0.0', auth: true }));

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
const ADMINS_DB = path.join(DB_DIR, 'admins.json');
const BANS_DB = path.join(DB_DIR, 'bans.json');
const USERS_DB = path.join(DB_DIR, 'users.json');

if (!fs.existsSync(PLUGINS_DB)) fs.writeFileSync(PLUGINS_DB, JSON.stringify([]));
if (!fs.existsSync(STATS_DB)) fs.writeFileSync(STATS_DB, JSON.stringify({ visitors: 0, totalGenerated: 0 }));
if (!fs.existsSync(BANS_DB)) fs.writeFileSync(BANS_DB, JSON.stringify([]));
if (!fs.existsSync(USERS_DB)) fs.writeFileSync(USERS_DB, JSON.stringify([]));

if (!fs.existsSync(ADMINS_DB)) {
  const defaultPassword = bcrypt.hashSync('@pixels7078', 10);
  fs.writeFileSync(ADMINS_DB, JSON.stringify([{ id: '1', email: 'ahmedpixelspro@gmail.com', password: defaultPassword }]));
}
function getAdmins() { return JSON.parse(fs.readFileSync(ADMINS_DB, 'utf-8')); }
function saveAdmins(data) { fs.writeFileSync(ADMINS_DB, JSON.stringify(data, null, 2)); }

function getBans() { return JSON.parse(fs.readFileSync(BANS_DB, 'utf-8')); }
function saveBans(data) { fs.writeFileSync(BANS_DB, JSON.stringify(data, null, 2)); }

function getUsers() { return JSON.parse(fs.readFileSync(USERS_DB, 'utf-8')); }
function saveUsers(data) { fs.writeFileSync(USERS_DB, JSON.stringify(data, null, 2)); }


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

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'ahmed-md-secret-key-2026';

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid Token' });
  }
}

// ─── Admin Auth Routes ────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const admins = getAdmins();
  const admin = admins.find(a => a.email === email);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.post('/api/admin/add', verifyAdmin, (req, res) => {
  const { email, password } = req.body;
  const admins = getAdmins();
  if (admins.find(a => a.email === email)) return res.status(400).json({ error: 'Email already exists' });
  admins.push({ id: Date.now().toString(), email, password: bcrypt.hashSync(password, 10) });
  saveAdmins(admins);
  res.json({ success: true });
});

app.get('/api/admin/list', verifyAdmin, (req, res) => {
  const admins = getAdmins();
  // Don't send passwords to frontend
  res.json(admins.map(a => ({ id: a.id, email: a.email })));
});

app.delete('/api/admin/delete/:id', verifyAdmin, (req, res) => {
  let admins = getAdmins();
  const adminToDelete = admins.find(a => a.id === req.params.id);
  if (!adminToDelete) return res.status(404).json({ error: 'Admin not found' });
  
  if (adminToDelete.email === 'ahmedpixelspro@gmail.com') {
    return res.status(403).json({ error: 'Cannot delete the main admin account' });
  }
  
  admins = admins.filter(a => a.id !== req.params.id);
  saveAdmins(admins);
  res.json({ success: true });
});

app.get('/api/admin/users', verifyAdmin, (req, res) => {
  res.json(getUsers());
});

// Banned Users Routes
app.get('/api/admin/bans', verifyAdmin, (req, res) => {
  res.json(getBans());
});

app.post('/api/admin/bans', verifyAdmin, (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ error: 'Number is required' });
  
  const bans = getBans();
  const cleanNumber = number.replace(/[^0-9]/g, '');
  
  if (bans.find(b => b.number === cleanNumber)) {
    return res.status(400).json({ error: 'Number is already banned' });
  }
  
  bans.push({ id: Date.now().toString(), number: cleanNumber, date: new Date().toISOString() });
  saveBans(bans);
  res.json({ success: true });
});

app.delete('/api/admin/bans/:id', verifyAdmin, (req, res) => {
  let bans = getBans();
  bans = bans.filter(b => b.id !== req.params.id);
  saveBans(bans);
  res.json({ success: true });
});

app.post('/api/admin/change-password', verifyAdmin, (req, res) => {
  const { email, newPassword } = req.body;
  const admins = getAdmins();
  const admin = admins.find(a => a.email === email);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  admin.password = bcrypt.hashSync(newPassword, 10);
  saveAdmins(admins);
  res.json({ success: true });
});

app.post('/api/admin/plugins/:id/edit', verifyAdmin, (req, res) => {
  const { name, url, author } = req.body;
  const plugins = getPlugins();
  const index = plugins.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    plugins[index] = { ...plugins[index], name, url, author };
    savePlugins(plugins);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Plugin not found' });
  }
});

// Admin Plugin APIs
app.get('/api/admin/plugins', verifyAdmin, (req, res) => res.json(getPlugins()));


app.post('/api/admin/plugins/:id/approve', verifyAdmin, (req, res) => {
  const plugins = getPlugins();
  const idx = plugins.findIndex(p => p.id === req.params.id);
  if (idx > -1) {
    plugins[idx].status = 'approved';
    savePlugins(plugins);
    res.json({ success: true });
  } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/admin/plugins/:id', verifyAdmin, (req, res) => {
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
      markOnlineOnConnect: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false
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
    
    if (!isQR && phoneNumber) {
      const bans = getBans();
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (bans.find(b => b.number === cleanNumber)) {
        socket.emit('banned', 'Your number is banned from using this service.');
        socket.isSessionClosed = true;
        return;
      }
    }
    
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
         const cleanNumber = userJid.split('@')[0];
         const bans = getBans();
         if (bans.find(b => b.number === cleanNumber)) {
            try { await sock.sendMessage(userJid, { text: '❌ *ACCESS DENIED*\n\nYour number is banned from using AHMED-MD.' }); } catch(e) {}
            socket.emit('banned', 'Your number is banned from using this service.');
            
            socket.isSessionClosed = true;
            try { await sock.logout(); } catch(e) {}
            try { sock.ws.close(); } catch(e) {}
            activeSockets.delete(socket.id);
            deleteSessionFolder(sessionId);
            return;
         }
         
         // Record user
         const users = getUsers();
         if (!users.find(u => u.number === cleanNumber)) {
           users.push({ id: Date.now().toString(), number: cleanNumber, date: new Date().toISOString() });
           saveUsers(users);
         }
      }
      
      // Auto follow user channel if they provided one, but since they didn't we follow default:
      try { await sock.newsletterFollow('120363429242988054@newsletter'); } catch (err) {}

      if (userJid) {
        // 1. Send JUST the Session ID
        await sock.sendMessage(userJid, { text: sessionString });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 2. Send the Connected Message with Channel Link
        const connectedMsg = `*AHMED-MD CONNECTED SUCCESSFULLY!* ✅\n\nYour bot is ready to be deployed. Do not share your Session ID with anyone.\n\n*Join our WhatsApp Channel for Updates:*\n👉 https://whatsapp.com/channel/0029Vb8EK6l3gvWfrZpfOm23`;
        
        await sock.sendMessage(userJid, { text: connectedMsg });
        await new Promise(resolve => setTimeout(resolve, 2000));
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

// ─── Download Deploy Script (Node.js version) ─────────────────────────────
app.get('/api/download/nodejs/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  if (!sessionId || !sessionId.startsWith('AHMED-MD_')) {
    return res.status(400).json({ error: 'Invalid Session ID' });
  }

  const script = `const { spawnSync, spawn } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

const SESSION_ID = '${sessionId}'; // DO NOT EDIT THIS LINE

let nodeRestartCount = 0;
const maxNodeRestarts = 5;
const restartWindow = 30000;
let lastRestartTime = Date.now();

const REPO_URL = 'https://github.com/ahmedpixels/AHMED-MD.git';
const FOLDER_NAME = 'AHMED-MD';

function startNode() {
  const child = spawn('node', ['index.js'], { cwd: FOLDER_NAME, stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code !== 0) {
      const currentTime = Date.now();
      if (currentTime - lastRestartTime > restartWindow) nodeRestartCount = 0;
      lastRestartTime = currentTime;
      nodeRestartCount++;
      if (nodeRestartCount > maxNodeRestarts) {
        console.error('Too many restarts. Stopping...');
        return;
      }
      console.log(\`Restarting... (Attempt \${nodeRestartCount})\`);
      startNode();
    }
  });
}

function installDependencies() {
  console.log('Installing dependencies...');
  const result = spawnSync('npm', ['install'], { cwd: FOLDER_NAME, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error('Failed to install dependencies');
    process.exit(1);
  }
}

function cloneRepository() {
  console.log('Cloning AHMED-MD repository...');
  const result = spawnSync('git', ['clone', REPO_URL, FOLDER_NAME], { stdio: 'inherit' });
  if (result.error) throw new Error(\`Clone failed: \${result.error.message}\`);
  writeFileSync(\`\${FOLDER_NAME}/.env\`, \`SESSION_ID=\${SESSION_ID}\\nMODE=private\\nOWNER_NAME=AHMED\`);
  installDependencies();
}

if (!existsSync(FOLDER_NAME)) {
  cloneRepository();
} else {
  installDependencies();
}

startNode();
`;

  res.setHeader('Content-Disposition', 'attachment; filename="index.js"');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(script);
});

// ─── Download Deploy Script (PM2 version) ─────────────────────────────────
app.get('/api/download/pm2/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  if (!sessionId || !sessionId.startsWith('AHMED-MD_')) {
    return res.status(400).json({ error: 'Invalid Session ID' });
  }

  const script = `const { spawnSync, spawn } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

const SESSION_ID = '${sessionId}'; // DO NOT EDIT THIS LINE

const REPO_URL = 'https://github.com/ahmedpixels/AHMED-MD.git';
const FOLDER_NAME = 'AHMED-MD';

function startNode() {
  const child = spawn('node', ['index.js'], { cwd: FOLDER_NAME, stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code !== 0) setTimeout(() => startNode(), 3000);
  });
}

function startPm2() {
  const pm2 = spawn('npx', ['pm2', 'start', 'index.js', '--name', 'ahmed-md', '--attach'], {
    cwd: FOLDER_NAME,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  pm2.on('exit', (code) => { if (code !== 0) startNode(); });
  pm2.on('error', () => startNode());
  if (pm2.stdout) pm2.stdout.on('data', (d) => console.log(d.toString()));
}

function installDependencies() {
  console.log('Installing dependencies...');
  const result = spawnSync('npm', ['install'], { cwd: FOLDER_NAME, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error('Failed to install dependencies');
    process.exit(1);
  }
}

function cloneRepository() {
  console.log('Cloning AHMED-MD repository...');
  const result = spawnSync('git', ['clone', REPO_URL, FOLDER_NAME], { stdio: 'inherit' });
  if (result.error) throw new Error(\`Clone failed: \${result.error.message}\`);
  writeFileSync(\`\${FOLDER_NAME}/.env\`, \`SESSION_ID=\${SESSION_ID}\\nMODE=private\\nOWNER_NAME=AHMED\`);
  installDependencies();
}

if (!existsSync(FOLDER_NAME)) {
  cloneRepository();
} else {
  installDependencies();
}

startPm2();
`;

  res.setHeader('Content-Disposition', 'attachment; filename="index.js"');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(script);
});



// Admin Stats
app.get('/api/admin/stats', verifyAdmin, (req, res) => {
  const stats = getStats();
  res.json({
    activeSockets: activeSockets.size,
    totalGenerated: stats.totalGenerated,
    visitors: stats.visitors,
    timestamp: Date.now()
  });
});

app.post('/api/admin/restart', verifyAdmin, (req, res) => {
  res.json({ success: true, message: 'Restarting...' });
  setTimeout(() => process.exit(0), 1000);
});

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
