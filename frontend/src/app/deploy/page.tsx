"use client";
import { motion } from 'framer-motion';
import { Server, Cloud, Cpu, ArrowRight, ExternalLink } from 'lucide-react';

const platforms = [
  {
    name: 'Deploy to Render',
    icon: <Cloud className="w-10 h-10" />,
    color: 'from-blue-500/20 to-cyan-500/5',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    link: 'https://dashboard.render.com/blueprint/new',
    steps: [
      'Create an account on Render.com',
      'Click the deployment button above',
      'Connect your GitHub account',
      'Fill in the SESSION_ID environment variable',
      'Click Deploy and wait for the build to complete'
    ]
  },
  {
    name: 'Deploy to Heroku',
    icon: <Server className="w-10 h-10" />,
    color: 'from-purple-500/20 to-fuchsia-500/5',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    link: 'https://heroku.com/deploy',
    steps: [
      'Login or Register on Heroku',
      'Click the deployment button above',
      'Give your app a unique name',
      'Enter your SESSION_ID in the config vars',
      'Click Deploy App'
    ]
  },
  {
    name: 'Deploy on VPS',
    icon: <Cpu className="w-10 h-10" />,
    color: 'from-green-500/20 to-emerald-500/5',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    link: '#',
    steps: [
      'Connect to your VPS via SSH',
      'Run: sudo apt update && sudo apt install nodejs git',
      'Clone repo: git clone https://github.com/.../AHMED-MD',
      'cd AHMED-MD && npm install',
      'Create config.env and add SESSION_ID',
      'Run the bot using PM2: pm2 start index.js'
    ]
  }
];

export default function Deploy() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-6 text-white">Quick Deployment</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Choose your preferred cloud platform to deploy AHMED-MD instantly using your generated SESSION_ID.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {platforms.map((platform, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass rounded-3xl p-8 border border-white/10 hover:${platform.borderColor} transition-all flex flex-col h-full relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${platform.color} opacity-50 z-0`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className={`mb-6 flex flex-col items-center gap-4 ${platform.textColor} text-center`}>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  {platform.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{platform.name}</h2>
              </div>
              
              {platform.link !== '#' ? (
                <a 
                  href={platform.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 mb-8 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  Deploy Now <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="w-full py-3 mb-8 bg-white/5 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10">
                  Manual Setup
                </div>
              )}
              
              <ul className="space-y-4 flex-grow">
                {platform.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <ArrowRight className={`w-4 h-4 mt-1 shrink-0 ${platform.textColor}`} />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
