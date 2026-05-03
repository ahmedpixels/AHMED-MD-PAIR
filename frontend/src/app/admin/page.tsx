"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Eye, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ activeSockets: 0, totalGenerated: 0, visitors: 0 });
  const [plugins, setPlugins] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'ahmedpixelspro@gmail.com' && password === '@pixels7078') {
      setIsAuthenticated(true);
      fetchStats();
      fetchPlugins();
    } else {
      setError('Invalid credentials');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {}
  };

  const fetchPlugins = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/plugins`);
      const data = await res.json();
      setPlugins(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchStats();
        fetchPlugins();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleRestart = async () => {
    if (confirm("Are you sure you want to restart the socket server?")) {
      try {
         await fetch(`${BACKEND_URL}/api/admin/restart`, { method: 'POST' });
         alert("Restart command sent.");
      } catch (e) {}
    }
  };

  const handleApprovePlugin = async (id: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/plugins/${id}/approve`, { method: 'POST' });
      fetchPlugins();
    } catch (e) {}
  };

  const handleDeletePlugin = async (id: string) => {
    if (confirm("Delete this plugin?")) {
      try {
        await fetch(`${BACKEND_URL}/api/admin/plugins/${id}`, { method: 'DELETE' });
        fetchPlugins();
      } catch (e) {}
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 md:p-12 rounded-3xl w-full max-w-md border border-white/10">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white">Admin Portal</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 outline-none transition-colors" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 outline-none transition-colors" required />
            </div>
            <button type="submit" className="w-full py-4 mt-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10">
              Login to Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Shield className="text-white" /> Admin Dashboard
        </h1>
        <div className="flex gap-4">
          <button onClick={handleRestart} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 flex items-center gap-2 border border-white/10">
            <RefreshCw className="w-4 h-4" /> Restart Server
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 border border-red-500/20">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Total Site Visitors</h3>
            <Eye className="text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.visitors || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Total Sessions Generated</h3>
            <Users className="text-purple-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalGenerated || 0}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Live Sockets</h3>
            <Activity className="text-green-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.activeSockets}</p>
        </div>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          Plugin Management
          <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-gray-300 font-normal">
            {plugins.length} Total
          </span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="pb-4 pr-4 font-medium">Name</th>
                <th className="pb-4 pr-4 font-medium">Author</th>
                <th className="pb-4 pr-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plugins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No plugins submitted yet.</td>
                </tr>
              ) : (
                plugins.map(plugin => (
                  <tr key={plugin.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-white">{plugin.name}</div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{plugin.url}</div>
                    </td>
                    <td className="py-4 pr-4 text-gray-300">{plugin.author}</td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        plugin.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {plugin.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {plugin.status === 'pending' && (
                        <button onClick={() => handleApprovePlugin(plugin.id)} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors" title="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDeletePlugin(plugin.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
