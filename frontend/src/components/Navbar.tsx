"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Plugins', path: '/plugins' },
  { name: 'Deploy', path: '/deploy' },
  { name: 'About', path: '/about' },
  { name: 'Session', path: '/session' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed w-full z-50 top-4 left-0 flex justify-center pointer-events-none px-4">
      <nav className="pointer-events-auto w-[90%] max-w-5xl glass rounded-full border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-black tracking-tighter text-white">
                AHMED<span className="text-purple-500 neon-text">-MD</span>
              </span>
            </Link>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.path
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <a
                  href="https://wa.me/923216479192"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-full text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0f1c] border border-blue-500/30 shadow-2xl absolute top-20 left-0 w-full rounded-2xl overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.path
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
                href="https://wa.me/923216479192"
                target="_blank"
                rel="noreferrer"
                className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:text-purple-300"
              >
                Contact Us
            </a>
          </div>
        </motion.div>
      )}
    </nav>
    </div>
  );
}
