"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Plus, Copy, Check, MessageCircle, X, Search } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type Plugin = {
  id: string;
  name: string;
  description: string;
  url: string;
  author: string;
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Form states
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pUrl, setPUrl] = useState('');
  const [pAuthor, setPAuthor] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/plugins`);
      const data = await res.json();
      setPlugins(data);
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/plugins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pName, description: pDesc, url: pUrl, author: pAuthor })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus('Success! Your plugin is pending admin approval.');
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitStatus('');
          setPName(''); setPDesc(''); setPUrl(''); setPAuthor('');
        }, 3000);
      } else {
        setSubmitStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setSubmitStatus('Failed to submit plugin.');
    }
  };

  const copyCommand = (id: string, url: string) => {
    navigator.clipboard.writeText(`.plugin ${url}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const filteredPlugins = plugins.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black mb-2">Plugins Library</h1>
          <p className="text-gray-400">Discover and install official & community plugins for AHMED-MD.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search plugins..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-3 rounded-xl transition-all font-bold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Submit
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin, idx) => (
          <motion.div 
            key={plugin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{plugin.name}</h3>
              <span className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-1 rounded">by {plugin.author}</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 flex-grow">{plugin.description}</p>
            
            <div className="flex gap-3 mt-auto">
              <button 
                onClick={() => copyCommand(plugin.id, plugin.url)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg transition-colors text-sm font-bold"
              >
                {copiedId === plugin.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copiedId === plugin.id ? 'Copied!' : 'Copy Command'}
              </button>
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`.plugin ${plugin.url}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-colors"
                title="Send to WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        ))}
        
        {filteredPlugins.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            No plugins found matching your search.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-md w-full rounded-3xl p-8 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-white">Submit Plugin</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitStatus && (
                  <div className={`p-3 rounded-lg text-sm ${submitStatus.includes('Success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {submitStatus}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Plugin Name</label>
                  <input required value={pName} onChange={e=>setPName(e.target.value)} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea required value={pDesc} onChange={e=>setPDesc(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Raw URL (GitHub/Gist only)</label>
                  <input required value={pUrl} onChange={e=>setPUrl(e.target.value)} type="url" placeholder="https://gist.githubusercontent.com/..." className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Author Name</label>
                  <input required value={pAuthor} onChange={e=>setPAuthor(e.target.value)} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                </div>
                
                <button type="submit" className="w-full py-4 mt-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10">
                  Submit for Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
