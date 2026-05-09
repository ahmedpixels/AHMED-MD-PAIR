import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ahmed-md-session-generator.vercel.app'),
  title: {
    default: 'AHMED-MD Session Generator | Premium WhatsApp Bot',
    template: '%s | AHMED-MD',
  },
  description: 'Generate your secure AHMED-MD WhatsApp Bot session id. The most advanced and premium WhatsApp bot platform for automation, designed by AHMED PIXELS.',
  keywords: ['whatsapp bot', 'ahmed-md', 'session generator', 'whatsapp automation', 'whatsapp api', 'baileys'],
  authors: [{ name: 'AHMED PIXELS' }],
  creator: 'AHMED PIXELS',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'AHMED-MD | Premium WhatsApp Bot',
    description: 'Generate your secure AHMED-MD WhatsApp Bot session id. The most advanced and premium WhatsApp bot platform.',
    url: 'https://ahmed-md-session-generator.vercel.app',
    siteName: 'AHMED-MD Platform',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'AHMED-MD Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AHMED-MD | Premium WhatsApp Bot',
    description: 'Generate your secure AHMED-MD WhatsApp Bot session id.',
    images: ['/logo.png'],
  },
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
        
        <footer className="glass border-t border-purple-500/20 py-8 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 font-medium text-sm">
              © {new Date().getFullYear()} AHMED-MD
            </div>
            
            <div className="flex items-center gap-5">
              <a href="https://whatsapp.com/channel/0029Vb8EK6l3gvWfrZpfOm23" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-500 transition-colors" title="WhatsApp Channel">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
              <a href="https://t.me/ahmedpixels" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors" title="Telegram Channel">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="https://github.com/ahmedpixels/AHMED-MD-PAIR" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="GitHub Repository">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Designed & developed by</span>
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
