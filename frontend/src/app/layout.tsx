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
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen flex flex-col`} suppressHydrationWarning={true}>
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
        
        <footer className="glass border-t border-purple-500/20 py-10 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 font-medium">
              © {new Date().getFullYear()} AHMED-MD
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span>Designed and developed by</span>
              <a 
                href="https://ahmedpixels.com" 
                target="_blank" 
                rel="noreferrer"
                className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 hover:from-purple-300 hover:to-fuchsia-300 transition-colors tracking-wide"
              >
                AHMED PIXELS
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
