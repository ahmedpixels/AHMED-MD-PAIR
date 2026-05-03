"use client";
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 border border-white/10"
      >
        <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
          About AHMED-MD Ecosystem
        </h1>
        
        <div className="space-y-6 text-lg text-gray-300 leading-relaxed font-light">
          <p>
            Welcome to the AHMED-MD Ecosystem. We are dedicated to providing the most advanced, secure, and user-friendly WhatsApp bot experience in the world.
          </p>
          <p>
            This platform, the AHMED-MD Session Generator, was built specifically to solve the complexities of session management. Unlike traditional bots that expose raw credentials, we utilize an advanced encryption algorithm to package your session safely.
          </p>
          <p>
            Our architecture is built for scale, supporting multiple simultaneous users with isolated instances, ensuring no cross-contamination or memory leaks. 
          </p>
          
          <div className="mt-12 p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-gray-400">
              To empower individuals and businesses with futuristic automation tools that are both powerful and elegant.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
