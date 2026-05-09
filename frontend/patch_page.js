const fs = require('fs');

const file = 'c:\\Users\\f\\OneDrive\\Desktop\\PAIR\\ahmed-md-session-generator\\frontend\\src\\app\\page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add state variables at the top of Home component
const stateVars = `  const [time, setTime] = useState('00:00');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi, I need help setting up my bot on a VPS.", sender: 'user', time: '10:41 AM' },
    { id: 2, text: "Hello! I'm AHMED Support Bot 🤖. I can guide you. Please send your Session ID to get started.", sender: 'bot', time: '10:42 AM' }
  ]);

  const handleSendMessage = (e) => {
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
`;

content = content.replace("  const [time, setTime] = useState('00:00');", stateVars);

// 2. Replace Chat Area with map
const chatAreaMatch = /\{\/\* Chat Area \*\/\}(.|\n)*?\{\/\* Chat Input Bar \*\/\}/g;
const newChatArea = `{/* Chat Area */}
              <div className="flex-grow bg-[#050505] p-4 flex flex-col gap-4 overflow-y-auto relative scrollbar-hide">
                <div className="text-center mt-2 mb-1 shrink-0">
                  <span className="bg-white/5 border border-white/5 text-gray-400 text-[9px] font-medium px-3 py-1 rounded-full">Today</span>
                </div>

                {messages.map((msg, idx) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={\`p-3 rounded-2xl max-w-[85%] relative z-10 \${
                      msg.sender === 'user' 
                      ? 'bg-purple-600 rounded-tr-sm self-end shadow-[0_4px_15px_rgba(168,85,247,0.2)]' 
                      : 'bg-[#111] rounded-tl-sm self-start border border-white/5'
                    }\`}
                  >
                    <p className={\`text-[13px] leading-relaxed \${msg.sender === 'user' ? 'text-white' : 'text-gray-200'}\`}>
                      {msg.text}
                    </p>
                    <div className={\`flex items-center gap-1 mt-1 \${msg.sender === 'user' ? 'justify-end' : 'justify-end'}\`}>
                      <p className={\`text-[9px] \${msg.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}\`}>{msg.time}</p>
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

              {/* Chat Input Bar */}`;

content = content.replace(chatAreaMatch, newChatArea);

// 3. Replace Chat Input Bar
const inputBarMatch = /<input(.|\n)*?\/>\n\s*<button(.|\n)*?<\/button>/g;
const newInputBar = `<form onSubmit={handleSendMessage} className="flex-grow flex gap-2 w-full">
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
                </form>`;

content = content.replace(inputBarMatch, newInputBar);

fs.writeFileSync(file, content);
