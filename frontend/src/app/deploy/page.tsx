"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, ArrowRight, Server, Cloud, Cpu, Smartphone, MonitorSpeaker } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const platforms = [
  {
    id: 'koyeb',
    name: 'Deploy to Koyeb',
    icon: <MonitorSpeaker className="w-8 h-8" />,
    iconBg: 'bg-blue-500/20 text-blue-400',
    buttonText: 'Deploy Now',
    buttonLink: 'https://koyeb.com',
    hasDownload: false,
    steps: [
      'Login to koyeb.com and create new App',
      'Select GitHub and connect your forked repo',
      'Set Build Command: npm install',
      'Set Run Command: node index.js',
      'Add env SESSION_ID from below, then Deploy!',
    ],
  },
  {
    id: 'render',
    name: 'Deploy to Render',
    icon: <Cloud className="w-8 h-8" />,
    iconBg: 'bg-cyan-500/20 text-cyan-400',
    buttonText: 'Deploy Now',
    buttonLink: 'https://render.com',
    hasDownload: false,
    steps: [
      'Go to render.com → New Web Service',
      'Click the deployment button above',
      'Connect your GitHub account',
      'Fill in the SESSION_ID as environment variable',
      'Click Deploy and wait for the build to complete',
    ],
  },
  {
    id: 'panel',
    name: 'Deploy on Panel',
    icon: <Server className="w-8 h-8" />,
    iconBg: 'bg-purple-500/20 text-purple-400',
    buttonText: 'Manual Setup',
    buttonLink: null,
    scriptType: 'pm2',
    hasDownload: true,
    steps: [
      'Go to your Pterodactyl / HopePanel',
      'Create a new Node.js server (v18+)',
      'Open "File Manager" tab in the panel',
      'Download index.js below & upload it',
      'Click "Start" — bot deploys itself!',
    ],
  },
  {
    id: 'vps',
    name: 'Deploy on VPS',
    icon: <Cpu className="w-8 h-8" />,
    iconBg: 'bg-green-500/20 text-green-400',
    buttonText: 'Manual Setup',
    buttonLink: null,
    scriptType: 'pm2',
    hasDownload: true,
    steps: [
      'Connect to your VPS via SSH',
      'Run: sudo apt update && sudo apt install nodejs git',
      'Download index.js below to your server',
      'Create .env and add SESSION_ID',
      'Run the bot: pm2 start index.js',
    ],
  },
  {
    id: 'termux',
    name: 'Deploy on Termux',
    icon: <Smartphone className="w-8 h-8" />,
    iconBg: 'bg-orange-500/20 text-orange-400',
    buttonText: 'Manual Setup',
    buttonLink: null,
    hasDownload: false,
    steps: [
      'Install Termux from F-Droid on Android',
      'Run: pkg install nodejs git',
      'Run: git clone https://github.com/ahmedpixels/AHMED-MD',
      'cd AHMED-MD && npm install',
      'Add SESSION_ID in .env and node index.js',
    ],
  },
];

export default function Deploy() {
  const [sessions, setSessions] = useState<Record<string, string>>({});

  const setSession = (id: string, val: string) =>
    setSessions(prev => ({ ...prev, [id]: val }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-14 z-10 relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-5xl font-black text-white mb-3">Deploy your bot.</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Choose a platform to host your instance. Follow the specific instructions for each
          provider to ensure a successful deployment.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {platforms.map((p, i) => {
          const sessionId = sessions[p.id] || '';
          const isValid = sessionId.startsWith('AHMED-MD_') && sessionId.length > 15;
          const downloadUrl = p.hasDownload ? `${BACKEND_URL}/api/download/${p.scriptType}/${sessionId}` : '#';

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group flex flex-col rounded-2xl border border-white/8 bg-[#0e0e12] p-6 transition-all duration-300 hover:border-white/15"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${p.iconBg} border border-white/10`}>
                {p.icon}
              </div>

              {/* Name */}
              <h2 className="text-xl font-black text-white mb-4">{p.name}</h2>

              {/* Deploy Button */}
              {p.buttonLink ? (
                <a
                  href={p.buttonLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 mb-6 bg-white/8 hover:bg-white/12 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 transition-all"
                >
                  {p.buttonText} <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="w-full py-3 mb-6 bg-white/4 text-gray-500 rounded-xl font-bold flex items-center justify-center border border-white/8">
                  {p.buttonText}
                </div>
              )}

              {/* Steps */}
              <ul className="space-y-3 mb-6 flex-grow">
                {p.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                    <span className="text-gray-400 text-sm">{step}</span>
                  </li>
                ))}
              </ul>

              {p.hasDownload && (
                <>
                  {/* Divider */}
                  <div className="border-t border-white/8 my-4" />

                  {/* Session ID + Download */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Session ID</p>
                    <input
                      type="text"
                      placeholder="AHMED-MD_xxxxxxxxxxxxxxxx"
                      value={sessionId}
                      onChange={e => setSession(p.id, e.target.value.trim())}
                      className={`w-full bg-black/50 border rounded-xl px-3 py-3 text-white font-mono text-xs focus:outline-none transition-all placeholder-gray-700 ${
                        sessionId.length === 0
                          ? 'border-white/10 focus:border-purple-500/50'
                          : isValid
                          ? 'border-green-500/50'
                          : 'border-red-500/30'
                      }`}
                    />

                    {isValid ? (
                      <a
                        href={downloadUrl}
                        download="index.js"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" /> Download index.js
                      </a>
                    ) : (
                      <div className="w-full py-3 rounded-xl bg-white/4 border border-white/8 text-gray-600 font-bold flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                        <Download className="w-4 h-4" /> Enter Session ID
                      </div>
                    )}

                    {!sessionId && (
                      <p className="text-center text-xs text-gray-700">
                        No session? <a href="/generate" className="text-purple-400 hover:underline">Generate here →</a>
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
