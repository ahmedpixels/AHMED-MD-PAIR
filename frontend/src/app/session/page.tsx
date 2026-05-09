"use client";
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Smartphone, QrCode } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Generate() {
  const [method, setMethod] = useState<'qr' | 'pairing'>('pairing');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [sessionString, setSessionString] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error' | 'banned'>('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleStart = () => {
    if (method === 'pairing') {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (!cleanNumber || cleanNumber.length < 10) {
        setErrorMsg('Please enter a valid phone number with country code (e.g., 923xxxxxxxxx)');
        setStatus('error');
        return;
      }
    }
    
    setStatus('generating');
    setIsConnecting(false);
    setQrCode('');
    setPairingCode('');
    setSessionString('');
    setErrorMsg('');

    if (socketRef.current) socketRef.current.disconnect();

    socketRef.current = io(BACKEND_URL);
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('start_session', { 
        phoneNumber: method === 'pairing' ? phoneNumber : null,
        isQR: method === 'qr'
      });
    });

    socket.on('qr', (qr) => {
      setQrCode(qr);
      setIsConnecting(false);
    });

    socket.on('pairing_code', (code) => {
      setPairingCode(code);
      setIsConnecting(false);
    });

    socket.on('connecting', () => {
      setIsConnecting(true);
    });
    
    socket.on('session_generated', (session) => {
      setSessionString(session);
      setStatus('success');
      setIsConnecting(false);
      socket.disconnect();
    });

    socket.on('error', (err) => {
      setErrorMsg(err);
      setStatus('error');
      setIsConnecting(false);
      socket.disconnect();
    });

    socket.on('banned', (err) => {
      setErrorMsg(err);
      setStatus('banned');
      setIsConnecting(false);
      socket.disconnect();
    });
  };

  const copyToClipboard = () => {
    if (!sessionString) return;
    navigator.clipboard.writeText(sessionString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPairingCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 md:p-12 rounded-3xl neon-border relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Generate Session</h1>
          <p className="text-gray-400">Connect your WhatsApp to securely generate AHMED-MD session ID.</p>
        </div>

        {status === 'idle' && (
          <div className="space-y-8">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setMethod('pairing')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex flex-col items-center gap-2 ${
                  method === 'pairing' 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                    : 'glass text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-6 h-6" />
                Pairing Code
              </button>
              <button
                onClick={() => setMethod('qr')}
                className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex flex-col items-center gap-2 ${
                  method === 'qr' 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                    : 'glass text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <QrCode className="w-6 h-6" />
                QR Code
              </button>
            </div>

            <AnimatePresence mode="wait">
              {method === 'pairing' && (
                <motion.div
                  key="pairing"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium text-gray-300">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 923xxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-lg"
                  />
                  <p className="text-xs text-gray-500">Enter number with country code, without + or spaces.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleStart}
              disabled={method === 'pairing' && !phoneNumber}
              className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/10"
            >
              Start Session
            </button>
          </div>
        )}

        {(status === 'generating' || status === 'error') && (
          <div className="space-y-8 flex flex-col items-center justify-center min-h-[250px]">
            
            {isConnecting ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-8">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
                <p className="text-purple-400 text-lg font-bold animate-pulse">Connecting to WhatsApp...</p>
                <p className="text-sm text-gray-500">Please wait, this might take a few moments.</p>
              </motion.div>
            ) : (
              <>
                {method === 'qr' && !qrCode && status === 'generating' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400">Generating QR Code...</p>
                  </motion.div>
                )}

                {method === 'pairing' && !pairingCode && status === 'generating' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400">Requesting Pairing Code...</p>
                  </motion.div>
                )}

                {method === 'qr' && qrCode && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col md:flex-row-reverse items-center justify-center gap-6 md:gap-12 w-full max-w-2xl mx-auto">
                    <div className="bg-white p-4 rounded-xl flex-shrink-0">
                      <QRCodeSVG value={qrCode} size={256} />
                    </div>
                    <div className="glass p-6 rounded-xl text-left border border-white/10 w-full md:w-auto flex-1">
                      <p className="font-bold text-purple-400 mb-4 text-lg">📸 How to scan:</p>
                      <ul className="text-gray-300 space-y-3 list-decimal pl-5">
                        <li>Open WhatsApp on your phone</li>
                        <li>Tap Menu (⋮) or Settings</li>
                        <li>Select Linked Devices</li>
                        <li>Tap "Link a Device" and point your phone at this screen to capture the code.</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {method === 'pairing' && pairingCode && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center w-full max-w-sm mx-auto">
                    <p className="text-gray-400 mb-2">Your Pairing Code</p>
                    <div className="flex items-center justify-center gap-3 bg-black/30 py-5 px-6 rounded-2xl border border-white/10 mb-6 group">
                      <div className="text-4xl md:text-5xl font-black tracking-[0.2em] text-white">
                        {pairingCode}
                      </div>
                      <button onClick={copyPairingCode} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all" title="Copy code">
                        <Copy className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="glass p-5 rounded-xl text-left border border-white/10 text-sm">
                      <p className="font-bold text-purple-400 mb-3">🔗 How to pair:</p>
                      <ul className="text-gray-300 space-y-2 list-decimal pl-5">
                        <li>You will receive a notification from WhatsApp</li>
                        <li>Tap the notification</li>
                        <li>Enter the code shown above</li>
                        <li>Wait for it to connect</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {status === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  <p className="font-bold">Error Occurred</p>
                  <p className="text-sm">{errorMsg || 'Connection was closed.'}</p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="py-3 px-8 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {status === 'banned' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 w-full max-w-md mx-auto">
                <div className="p-6 bg-red-900/40 border border-red-500/50 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">⛔</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase text-red-500">Access Denied</h3>
                  <p className="text-gray-300 font-medium">Your phone number has been banned from using AHMED-MD.</p>
                  <p className="text-sm text-gray-500 mt-4">If you believe this is a mistake, please contact support.</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500">
              <Check className="w-10 h-10" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2 text-white">Session Generated Successfully!</h2>
              <p className="text-gray-400">Copy your SESSION_ID below and use it to deploy AHMED-MD.</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-white/5 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 font-mono text-sm break-all text-left text-green-400 max-h-24 overflow-y-auto">
                  {sessionString}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>



            <button
              onClick={() => {
                setStatus('idle');
                setSessionString('');
              }}
              className="text-gray-400 hover:text-white transition-colors underline block mx-auto mt-4"
            >
              Generate another session
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
