const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverFile, 'utf-8');

// 1. Add jwt and bcrypt imports
if (!content.includes('jsonwebtoken')) {
  content = content.replace("const crypto = require('crypto');", "const crypto = require('crypto');\nconst jwt = require('jsonwebtoken');\nconst bcrypt = require('bcryptjs');");
}

// 2. Add admin DB logic
const dbConfigStr = `const ADMINS_DB = path.join(DB_DIR, 'admins.json');`;
if (!content.includes('ADMINS_DB')) {
  content = content.replace("const STATS_DB = path.join(DB_DIR, 'stats.json');", "const STATS_DB = path.join(DB_DIR, 'stats.json');\n" + dbConfigStr);
  
  const adminDbInit = `
if (!fs.existsSync(ADMINS_DB)) {
  const defaultPassword = bcrypt.hashSync('@pixels7078', 10);
  fs.writeFileSync(ADMINS_DB, JSON.stringify([{ id: '1', email: 'ahmedpixelspro@gmail.com', password: defaultPassword }]));
}
function getAdmins() { return JSON.parse(fs.readFileSync(ADMINS_DB, 'utf-8')); }
function saveAdmins(data) { fs.writeFileSync(ADMINS_DB, JSON.stringify(data, null, 2)); }
`;
  content = content.replace("if (!fs.existsSync(STATS_DB)) fs.writeFileSync(STATS_DB, JSON.stringify({ visitors: 0, totalGenerated: 0 }));", "if (!fs.existsSync(STATS_DB)) fs.writeFileSync(STATS_DB, JSON.stringify({ visitors: 0, totalGenerated: 0 }));\n" + adminDbInit);
}

// 3. Add auth middleware
const authMiddlewareStr = `
const JWT_SECRET = 'ahmed-md-secret-key-2026'; // Normally in .env

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
`;
if (!content.includes('verifyAdmin')) {
  content = content.replace("// Admin Stats", authMiddlewareStr + "\n// Admin Stats");
}

// 4. Protect admin stats and add new routes
content = content.replace("app.get('/api/admin/stats', (req, res) => {", "app.get('/api/admin/stats', verifyAdmin, (req, res) => {");
content = content.replace("app.post('/api/admin/restart', (req, res) => {", "app.post('/api/admin/restart', verifyAdmin, (req, res) => {");

// We need to find if there are existing plugin routes like /api/admin/plugins and protect them
content = content.replace(/app\.get\('\/api\/admin\/plugins'/g, "app.get('/api/admin/plugins', verifyAdmin");
content = content.replace(/app\.post\('\/api\/admin\/plugins\/:id\/approve'/g, "app.post('/api/admin/plugins/:id/approve', verifyAdmin");
content = content.replace(/app\.delete\('\/api\/admin\/plugins\/:id'/g, "app.delete('/api/admin/plugins/:id', verifyAdmin");

// 5. Add auth APIs
const authApis = `
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
`;

if (!content.includes('/api/admin/login')) {
  content = content.replace("// Admin Stats", authApis + "\n// Admin Stats");
}

fs.writeFileSync(serverFile, content);
console.log('Backend patched successfully.');
