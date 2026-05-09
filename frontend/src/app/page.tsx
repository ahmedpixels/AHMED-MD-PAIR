"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Smartphone, Server, ArrowRight, Bot, Code, Cpu, Terminal } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-8 h-8 text-purple-400" />,
    title: 'Secure by Design',
    description: 'Military-grade session encryption ensures your credentials remain absolutely private and secure.'
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    title: 'Lightning Fast',
    description: 'Optimized WebSocket connections for instant QR code and pairing code session generation.'
  },
  {
    icon: <Server className="w-8 h-8 text-purple-400" />,
    title: 'Auto Deployment',
    description: 'Seamless integration with PM2 and Node.js for 1-click deployment on VPS and panels.'
  },
  {
    icon: <Bot className="w-8 h-8 text-purple-400" />,
    title: 'Smart Bot Engine',
    description: 'Advanced command handling, plugin support, and zero-crash architecture built-in.'
  }
];

export default function Home() {
  const [time, setTime] = useState('00:00');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi, I need help setting up my bot on a VPS.", sender: 'user', time: '10:41 AM' },
    { id: 2, text: "Hello! I'm AHMED Support Bot 🤖. I can guide you. Please send your Session ID to get started.", sender: 'bot', time: '10:42 AM' }
  ]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), text: inputText, sender: 'user', time: time };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      let botReply = "I am a demo bot. Please use the Generate tab above to get your Session ID!";
      const lower = newMsg.text.toLowerCase();
      if (lower.includes("vps") || lower.includes("deploy")) {
        botReply = "To deploy on VPS, you just need Node.js and PM2. First, generate a Session ID!";
      } else if (lower.includes("error") || lower.includes("not working")) {
        botReply = "Please ensure your Session ID is fresh. They expire in 5 hours if not used.";
      } else if (lower.includes("price") || lower.includes("buy")) {
        botReply = "AHMED-MD is completely free and open source!";
      } else if (lower.includes("plugin")) {
        botReply = "You can add new features using our Plugins directory!";
      } else if (lower.includes("hi") || lower.includes("hello")) {
        botReply = "Hi there! How can I help you with your WhatsApp bot today?";
      }

      setMessages(prev => [...prev, { id: Date.now()+1, text: botReply, sender: 'bot', time: time }]);
    }, 1500);
  };


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      
      {/* Background blobs for Liquid Glass effect */}
      <div className="fixed top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[140px] z-[-1] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-fuchsia-600/10 blur-[120px] z-[-1] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.2fr_1fr] gap-4 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 font-bold text-xs mb-8">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Live: Multi-Device WhatsApp SaaS
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black mb-6 tracking-tighter text-white leading-[1.05]">
              Automate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
                WhatsApp.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-lg font-medium leading-relaxed pr-8">
              Deploy an intelligent WhatsApp bot in seconds. Provide 24/7 support, capture leads, and install custom plugins instantly from our dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/session"
                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden w-full sm:w-auto text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                  <Terminal className="w-5 h-5" />
                  Start Session
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/plugins">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 bg-[#111] text-white rounded-xl font-bold text-lg border border-white/10 hover:bg-white/5 transition-all"
                >
                  Explore Plugins
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Phone Frame - Sleek, Dark, Clean */}
            <div className="relative w-[300px] h-[600px] bg-[#050505] rounded-[40px] border-[4px] border-[#1a1a1a] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.15)] flex flex-col ring-1 ring-white/5">
              
              {/* Phone Notch/Status Bar */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-between items-center px-5 z-20">
                <span className="text-[10px] text-white font-medium tracking-wide mt-1">{time}</span>
                {/* Classic Clean Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1a1a1a] rounded-b-[14px]"></div>
                <div className="flex gap-1.5 items-center mt-1">
                  <div className="flex gap-0.5 items-end h-2.5">
                    <div className="w-[2px] h-[4px] bg-white rounded-sm"></div>
                    <div className="w-[2px] h-[6px] bg-white rounded-sm"></div>
                    <div className="w-[2px] h-[8px] bg-white rounded-sm"></div>
                    <div className="w-[2px] h-[10px] bg-white rounded-sm"></div>
                  </div>
                  <Zap className="w-[10px] h-[10px] text-white fill-white" />
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="bg-[#0a0a0a] pt-12 pb-3 px-4 flex items-center gap-3 border-b border-white/[0.03] relative z-10">
                <ArrowRight className="w-5 h-5 text-gray-500 rotate-180" />
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-white font-semibold text-sm tracking-wide">AHMED Support</h3>
                  <p className="text-gray-400 text-[10px]">bot • online</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-grow bg-[#050505] p-4 flex flex-col gap-4 overflow-y-auto relative scrollbar-hide">
                <div className="text-center mt-2 mb-1 shrink-0">
                  <span className="bg-white/5 border border-white/5 text-gray-400 text-[9px] font-medium px-3 py-1 rounded-full">Today</span>
                </div>

                {messages.map((msg, idx) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-2xl max-w-[85%] relative z-10 ${
                      msg.sender === 'user' 
                      ? 'bg-purple-600 rounded-tr-sm self-end shadow-[0_4px_15px_rgba(168,85,247,0.2)]' 
                      : 'bg-[#111] rounded-tl-sm self-start border border-white/5'
                    }`}
                  >
                    <p className={`text-[13px] leading-relaxed ${msg.sender === 'user' ? 'text-white' : 'text-gray-200'}`}>
                      {msg.text}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-end'}`}>
                      <p className={`text-[9px] ${msg.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>{msg.time}</p>
                      {msg.sender === 'user' && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6667 4.5L5.66667 10.5L3 7.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 4.5L10 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.33333 7.83333L8.66667 9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-[#0a0a0a] border-t border-white/[0.03] relative z-10 flex gap-2 mb-1">
                <form onSubmit={handleSendMessage} className="flex-grow flex gap-2 w-full">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-grow bg-[#111] rounded-full px-4 py-2 text-[13px] text-white placeholder-gray-600 border border-white/5 focus:outline-none focus:border-purple-500/30 transition-colors"
                  />
                  <button type="submit" className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <ArrowRight className="w-[18px] h-[18px] text-white -rotate-45 ml-0.5 mb-0.5" />
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to get your bot running</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 pointer-events-none group-hover:text-purple-500/10 transition-colors">1</div>
              <Smartphone className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Pair Device</h3>
              <p className="text-gray-400 leading-relaxed">Enter your WhatsApp number to receive an 8-digit pairing code. Enter it in your WhatsApp linked devices to securely generate a session.</p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 pointer-events-none group-hover:text-fuchsia-500/10 transition-colors">2</div>
              <Code className="w-12 h-12 text-fuchsia-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Get Script</h3>
              <p className="text-gray-400 leading-relaxed">Download your custom index.js deployment script. Your unique encrypted Session ID is automatically embedded inside the file.</p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 pointer-events-none group-hover:text-purple-500/10 transition-colors">3</div>
              <Cpu className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Deploy Bot</h3>
              <p className="text-gray-400 leading-relaxed">Upload the file to your VPS or Pterodactyl Panel and start. The script handles everything: cloning, installing, and running.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Premium Features</h2>
            <p className="text-gray-400 text-lg">Built for performance and reliability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass p-8 rounded-3xl border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300 group"
              >
                <div className="mb-6 p-4 bg-purple-500/10 rounded-2xl inline-flex group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
