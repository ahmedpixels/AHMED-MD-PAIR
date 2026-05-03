"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Smartphone, Server } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-8 h-8 text-purple-400" />,
    title: 'Secure by Design',
    description: 'Military-grade session encryption ensures your credentials remain private.'
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    title: 'Lightning Fast',
    description: 'Optimized socket connections for instant session generation.'
  },
  {
    icon: <Smartphone className="w-8 h-8 text-purple-400" />,
    title: 'Mobile Ready',
    description: 'Perfectly responsive design to generate sessions on the go.'
  },
  {
    icon: <Server className="w-8 h-8 text-purple-400" />,
    title: 'Auto Cleanup',
    description: 'Temporary files are instantly wiped, leaving zero footprint.'
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 relative overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto z-10 pt-20"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Welcome to <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 neon-text">
            AHMED-MD
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
          The most advanced, futuristic, and secure WhatsApp Bot session generator platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/generate">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-lg border border-white/10 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Generate Session Now
            </motion.button>
          </Link>
          <Link href="/deploy">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass text-white rounded-full font-bold text-lg border border-purple-500/30 hover:bg-white/5 transition-all"
            >
              View Deploy Guide
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto mt-32 w-full z-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-8 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="mb-4 p-3 bg-purple-500/10 rounded-xl inline-block group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
