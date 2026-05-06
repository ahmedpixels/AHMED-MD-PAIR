"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Activity, Eye, RefreshCw, Trash2, CheckCircle, Edit3, Settings, LogOut, Plus, Key, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ activeSockets: 0, totalGenerated: 0, visitors: 0 });
  const [plugins, setPlugins] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<any>(null);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [changePassword, setChangePassword] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers: getHeaders() });
      if (res.status === 401 || res.status === 403) return logout();
      const data = await res.json();
      setStats(data);
    } catch (err) {}
  };

  const fetchPlugins = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/plugins`, { headers: getHeaders() });
      const data = await res.json();
      setPlugins(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchPlugins();
      const interval = setInterval(() => {
        fetchStats();
        fetchPlugins();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const handleRestart = async () => {
    if (confirm("Are you sure you want to restart the socket server?")) {
      try {
         await fetch(`${BACKEND_URL}/api/admin/restart`, { method: 'POST', headers: getHeaders() });
         alert("Restart command sent.");
      } catch (e) {}
    }
  };

  const handleApprovePlugin = async (id: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/plugins/${id}/approve`, { method: 'POST', headers: getHeaders() });
      fetchPlugins();
    } catch (e) {}
  };

  const handleDeletePlugin = async (id: string) => {
    if (confirm("Delete this plugin?")) {
      try {
        await fetch(`${BACKEND_URL}/api/admin/plugins/${id}`, { method: 'DELETE', headers: getHeaders() });
        fetchPlugins();
      } catch (e) {}
    }
  };

  const submitEditPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${BACKEND_URL}/api/admin/plugins/${editingPlugin.id}/edit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(editingPlugin)
      });
      setShowEditModal(false);
      fetchPlugins();
    } catch (e) {}
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg('Admin added successfully!');
        setNewAdminEmail('');
        setNewAdminPassword('');
      } else {
        setSettingsMsg(data.error);
      }
    } catch (e) {}
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Decode JWT locally to get email
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const res = await fetch(`${BACKEND_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: payload.email, newPassword: changePassword })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg('Password changed successfully!');
        setChangePassword('');
      } else {
        setSettingsMsg(data.error);
      }
    } catch (e) {}
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 md:p-12 rounded-3xl w-full max-w-md border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white">Admin Secure Login</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500/50 outline-none transition-colors" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Master Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500/50 outline-none transition-colors" required />
            </div>
            <button type="submit" className="w-full py-4 mt-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 glass p-4 rounded-2xl border border-white/10">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Shield className="text-purple-500 w-8 h-8" /> Control Panel
        </h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowSettingsModal(true)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white flex items-center gap-2 border border-white/10 transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button onClick={handleRestart} className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500/20 flex items-center gap-2 border border-yellow-500/20 transition-colors">
            <RefreshCw className="w-4 h-4" /> Restart
          </button>
          <button onClick={logout} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-gray-400 font-medium">Live Visitors</h3>
            <Eye className="text-blue-400" />
          </div>
          <p className="text-5xl font-black text-white relative z-10">{stats.visitors || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-colors"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-gray-400 font-medium">Sessions Generated</h3>
            <Users className="text-purple-400" />
          </div>
          <p className="text-5xl font-black text-white relative z-10">{stats.totalGenerated || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-gray-400 font-medium">Active Sockets</h3>
            <Activity className="text-green-400" />
          </div>
          <p className="text-5xl font-black text-white relative z-10">{stats.activeSockets}</p>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          Plugin Submissions
          <span className="text-xs bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full text-purple-400 font-bold">
            {plugins.length} Total
          </span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="pb-4 pl-4 font-medium">Plugin Details</th>
                <th className="pb-4 font-medium">Author</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plugins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">No plugins found.</td>
                </tr>
              ) : (
                plugins.map(plugin => (
                  <tr key={plugin.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 pl-4">
                      <div className="font-bold text-white text-base">{plugin.name}</div>
                      <div className="text-xs text-blue-400 font-mono truncate max-w-[250px]">{plugin.url}</div>
                      {plugin.description && <div className="text-xs text-gray-500 mt-1 truncate max-w-[250px]">{plugin.description}</div>}
                    </td>
                    <td className="py-4 text-gray-300 font-medium">{plugin.author}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        plugin.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {plugin.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right space-x-2">
                      <button onClick={() => { setEditingPlugin(plugin); setShowEditModal(true); }} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {plugin.status === 'pending' && (
                        <button onClick={() => handleApprovePlugin(plugin.id)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDeletePlugin(plugin.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plugin Modal */}
      {showEditModal && editingPlugin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Edit Plugin</h3>
            <form onSubmit={submitEditPlugin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Plugin Name</label>
                <input type="text" value={editingPlugin.name} onChange={e => setEditingPlugin({...editingPlugin, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Author Name</label>
                <input type="text" value={editingPlugin.author} onChange={e => setEditingPlugin({...editingPlugin, author: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Raw Gist URL</label>
                <input type="url" value={editingPlugin.url} onChange={e => setEditingPlugin({...editingPlugin, url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-mono text-xs" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl text-white bg-white/5 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-purple-600 hover:bg-purple-500 font-bold">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 p-6 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="text-purple-500"/> Admin Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white"><XCircle className="w-6 h-6"/></button>
            </div>
            
            {settingsMsg && <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm text-purple-400">{settingsMsg}</div>}

            <div className="space-y-8">
              {/* Change Password */}
              <div className="glass p-5 rounded-2xl border border-white/5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-purple-400"/> Change Password</h4>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                  <input type="password" placeholder="New Password" value={changePassword} onChange={e=>setChangePassword(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white" />
                  <button type="submit" className="self-end px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white text-sm">Update Password</button>
                </form>
              </div>

              {/* Add New Admin */}
              <div className="glass p-5 rounded-2xl border border-white/5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-green-400"/> Add New Admin</h4>
                <form onSubmit={handleAddAdmin} className="flex flex-col gap-3">
                  <input type="email" placeholder="Admin Email" value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white" />
                  <input type="password" placeholder="Temporary Password" value={newAdminPassword} onChange={e=>setNewAdminPassword(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white" />
                  <button type="submit" className="self-end px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white text-sm">Create Admin</button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
