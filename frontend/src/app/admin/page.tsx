"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Activity, Eye, RefreshCw, Trash2, CheckCircle, Edit3, Settings, LogOut, Plus, Key, XCircle, Search } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { flag } from 'country-flag-emoji';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ activeSockets: 0, totalGenerated: 0, visitors: 0 });
  const [plugins, setPlugins] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const [error, setError] = useState('');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<any>(null);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [changePassword, setChangePassword] = useState('');
  const [newBanNumber, setNewBanNumber] = useState('');
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

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/list`, { headers: getHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setAdmins(data);
    } catch (err) {}
  };

  const fetchBans = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/bans`, { headers: getHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setBans(data);
    } catch (err) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, { headers: getHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {}
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchPlugins();
      fetchAdmins();
      fetchBans();
      fetchUsers();
      const interval = setInterval(() => {
        fetchStats();
        fetchPlugins();
        fetchAdmins();
        fetchBans();
        fetchUsers();
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
        fetchAdmins();
      } else {
        setSettingsMsg(data.error || 'Failed to add admin');
      }
    } catch (e) {
      setSettingsMsg('Error adding admin');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/delete/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const data = await res.json();
        if (data.success) {
          setSettingsMsg('Admin deleted successfully!');
          fetchAdmins();
        } else {
          setSettingsMsg(data.error || 'Failed to delete admin');
        }
      } catch (e) {
        setSettingsMsg('Error deleting admin');
      }
    }
  };

  const handleAddBan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/bans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ number: newBanNumber })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg('User banned successfully!');
        setNewBanNumber('');
        fetchBans();
      } else {
        setSettingsMsg(data.error || 'Failed to ban user');
      }
    } catch (e) {
      setSettingsMsg('Error banning user');
    }
  };

  const handleDeleteBan = async (id: string) => {
    if (confirm("Are you sure you want to unban this number?")) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/bans/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if ((await res.json()).success) {
          setSettingsMsg('User unbanned successfully!');
          fetchBans();
        }
      } catch (e) {
        setSettingsMsg('Error unbanning user');
      }
    }
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
    <div className="max-w-[1400px] mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row gap-8 mt-16">
      {/* Sidebar */}
      <div className="w-full md:w-72 flex-shrink-0 flex flex-row md:flex-col gap-2 glass p-3 md:p-5 rounded-2xl md:rounded-3xl border border-white/10 h-fit sticky top-20 md:top-24 z-40 overflow-x-auto hide-scrollbar">
        <div className="hidden md:flex items-center gap-3 mb-6 p-2">
          <Shield className="text-purple-500 w-10 h-10" />
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">Admin Panel</h2>
            <p className="text-xs text-gray-400">AHMED-MD</p>
          </div>
        </div>
        
        <button onClick={() => setActiveTab('dashboard')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 p-3 md:p-3.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
          <Activity className="w-5 h-5" /> <span className="text-sm md:text-base">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 p-3 md:p-3.5 rounded-xl transition-all ${activeTab === 'users' ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
          <div className="flex items-center gap-2 md:gap-3"><Users className="w-5 h-5" /> <span className="text-sm md:text-base">Users</span></div>
          <span className="text-xs bg-black/50 px-2 py-1 rounded-md hidden md:inline-block">{users.length}</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 p-3 md:p-3.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
          <Settings className="w-5 h-5" /> <span className="text-sm md:text-base">Settings</span>
        </button>

        <div className="md:mt-8 md:pt-6 md:border-t border-white/10 flex flex-row md:flex-col gap-2 flex-shrink-0 ml-auto md:ml-0">
          <button onClick={handleRestart} title="Restart Server" className="flex items-center gap-2 md:gap-3 p-3 md:p-3.5 text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all font-medium">
            <RefreshCw className="w-5 h-5" /> <span className="hidden md:inline">Restart</span>
          </button>
          <button onClick={logout} title="Logout" className="flex items-center gap-2 md:gap-3 p-3 md:p-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium">
            <LogOut className="w-5 h-5" /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-h-[70vh]">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-gray-400 font-medium">Live Visitors</h3>
                  <Eye className="text-blue-400 w-6 h-6" />
                </div>
                <p className="text-5xl font-black text-white relative z-10">{stats.visitors || 0}</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-gray-400 font-medium">Sessions Generated</h3>
                  <Users className="text-purple-400 w-6 h-6" />
                </div>
                <p className="text-5xl font-black text-white relative z-10">{stats.totalGenerated || 0}</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-gray-400 font-medium">Active Sockets</h3>
                  <Activity className="text-green-400 w-6 h-6" />
                </div>
                <p className="text-5xl font-black text-white relative z-10">{stats.activeSockets}</p>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-purple-500 w-6 h-6" />
                  Plugin Submissions
                </div>
                <span className="text-sm bg-purple-500/20 border border-purple-500/30 px-4 py-1.5 rounded-full text-purple-400 font-bold">
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
                            <div className="text-xs text-blue-400 font-mono truncate max-w-[250px] mt-1">{plugin.url}</div>
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
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (() => {
          const filteredUsers = (users || []).filter((u: any) => {
            const numMatch = u?.number ? String(u.number).includes(searchQuery) : false;
            const nameMatch = u?.name ? String(u.name).toLowerCase().includes(searchQuery.toLowerCase()) : false;
            return numMatch || nameMatch;
          });
          return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400 w-6 h-6" />
                Connected Users
                <span className="text-sm bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-400 font-bold ml-2">
                  {(users || []).length} Total
                </span>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search number or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
              </div>
            </h2>
            
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No users found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user: any) => {
                  let countryFlag = '🌍';
                  let parsed = null;
                  try {
                    if (user?.number) {
                      parsed = parsePhoneNumberFromString('+' + user.number);
                      if (parsed?.country) {
                        countryFlag = flag(parsed.country) || '🌍';
                      }
                    }
                  } catch (e) {}
                  
                  return (
                  <div key={user?.id || Math.random()} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl" title={parsed?.country || 'Unknown'}>{countryFlag}</div>
                      <div>
                        <div className="text-lg font-bold text-white tracking-wide">+{user?.number || 'Unknown'}</div>
                        <div className="text-sm text-gray-400 font-medium">{user?.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500 mt-1">{user?.date ? new Date(user.date).toLocaleString() : 'Unknown Date'}</div>
                      </div>
                    </div>
                    <div className="bg-green-500/10 p-2 rounded-xl border border-green-500/20 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                )})}
              </div>
            )}
          </motion.div>
        )})()}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {settingsMsg && <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-sm text-purple-400 font-bold">{settingsMsg}</div>}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Ban System */}
              <div className="glass p-6 rounded-3xl border border-white/10">
                <h4 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2"><XCircle className="w-6 h-6"/> Ban Management</h4>
                <form onSubmit={handleAddBan} className="flex gap-2 mb-6">
                  <input type="text" placeholder="Number (e.g. 923xxxxxxxxx)" value={newBanNumber} onChange={e=>setNewBanNumber(e.target.value)} required className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500/50 outline-none transition-colors" />
                  <button type="submit" className="px-5 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white text-sm whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.3)]">Ban</button>
                </form>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {bans.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No banned users.</p> : bans.map(ban => (
                    <div key={ban.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                      <div>
                        <span className="text-base text-red-300 font-mono font-bold block">+{ban.number}</span>
                        <span className="text-[11px] text-gray-500">{new Date(ban.date).toLocaleDateString()}</span>
                      </div>
                      <button onClick={() => handleDeleteBan(ban.id)} className="text-green-400 hover:text-green-300 p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors title='Unban'">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Admin List */}
                <div className="glass p-6 rounded-3xl border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-blue-400"/> Admin Accounts</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar mb-6">
                    {admins.map(admin => (
                      <div key={admin.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-sm text-gray-300 font-mono">{admin.email}</span>
                        {admin.email === 'ahmedpixelspro@gmail.com' ? (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold">Master</span>
                        ) : (
                          <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <h5 className="text-sm font-bold text-green-400 mb-3">Add New Admin</h5>
                  <form onSubmit={handleAddAdmin} className="flex flex-col gap-3">
                    <input type="email" placeholder="Admin Email" value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm" />
                    <div className="flex gap-2">
                      <input type="password" placeholder="Temporary Password" value={newAdminPassword} onChange={e=>setNewAdminPassword(e.target.value)} required className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white text-sm" />
                      <button type="submit" className="px-5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white text-sm shadow-[0_0_15px_rgba(22,163,74,0.3)]">Add</button>
                    </div>
                  </form>
                </div>

                {/* Change Password */}
                <div className="glass p-6 rounded-3xl border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Key className="w-6 h-6 text-purple-400"/> Change Password</h4>
                  <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                    <input type="password" placeholder="New Password" value={changePassword} onChange={e=>setChangePassword(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500/50 outline-none" />
                    <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">Update Password</button>
                  </form>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </div>

      {/* Edit Plugin Modal */}
      {showEditModal && editingPlugin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Plugin</h3>
            <form onSubmit={submitEditPlugin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Plugin Name</label>
                <input type="text" value={editingPlugin.name} onChange={e => setEditingPlugin({...editingPlugin, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-purple-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Author Name</label>
                <input type="text" value={editingPlugin.author} onChange={e => setEditingPlugin({...editingPlugin, author: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-purple-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Raw Gist URL</label>
                <input type="url" value={editingPlugin.url} onChange={e => setEditingPlugin({...editingPlugin, url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-purple-500/50 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl text-white bg-white/5 hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl text-white bg-purple-600 hover:bg-purple-500 font-bold transition-colors shadow-lg">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
