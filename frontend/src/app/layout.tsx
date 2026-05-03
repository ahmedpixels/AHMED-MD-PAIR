import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AHMED-MD Session Generator | Premium WhatsApp Bot',
  description: 'Generate your secure AHMED-MD WhatsApp Bot session id. The most advanced and premium WhatsApp bot platform.',
};

import VisitorTracker from '@/components/VisitorTracker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <VisitorTracker />
        {/* Animated Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-black">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
        </div>
        
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
        
        <footer className="glass border-t border-white/5 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p>© {new Date().getFullYear()} AHMED-MD Ecosystem. All rights reserved.</p>
            <p className="text-sm mt-2">Built with ❤️ for a futuristic WhatsApp experience.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
