"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Generate', path: '/generate' },
  { name: 'Deploy', path: '/deploy' },
  { name: 'Plugins', path: '/plugins' },
  { name: 'About', path: '/about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-black tracking-tighter text-white">
              AHMED<span className="text-purple-500 neon-text">-MD</span>
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.path
                      ? 'text-purple-400 bg-purple-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                  {pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="h-0.5 bg-purple-500 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
              <a
                href="https://wa.me/923216479192"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]"
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
          className="md:hidden glass absolute top-20 left-0 w-full"
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
  );
}
