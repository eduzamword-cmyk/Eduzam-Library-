import { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, Sparkles, BrainCircuit, LineChart } from 'lucide-react';

export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Good day, Educator. I am your dedicated EDUZAM AI Assistant, engineered to support your mission with strategic lesson planning, advanced performance analytics, and official curriculum review. How may I support your official objectives today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text: query };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        text: "I've analyzed the recent markbook data. The Grade 12 cohort is showing a 15% improvement in Mathematics compared to last term. Would you like me to generate a detailed breakdown report for the regional schools?"
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.35)] bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950">
            <Bot className="w-7 h-7 text-indigo-200 drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Education Assistant</h2>
            <p className="text-purple-200 text-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Powered by Gemini
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-8">
        {chatHistory.length === 1 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-8 max-w-2xl mx-auto text-center">
            {/* Professional Salutation / Welcome Message */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-purple-200 mb-2">
                <Bot className="w-9 h-9" />
              </div>
              <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-none py-2">
                Good day, Educator.
              </h1>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                I am your dedicated <span className="text-purple-700 font-bold">EDUZAM AI Assistant</span>, 
                engineered to support your mission with strategic lesson planning, 
                advanced performance analytics, and official curriculum review.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto pt-2" />
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest pt-2">
                How may I support your official objectives today?
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                { title: 'Analyze Performance', icon: LineChart, desc: 'Identify critical trends in recent institutional exams.' },
                { title: 'Lesson Planning', icon: BrainCircuit, desc: 'Generate high-compliance national syllabus guides.' }
              ].map((card, idx) => (
                <button 
                  key={idx}
                  onClick={() => setQuery(card.title)}
                  className="text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <card.icon className="w-12 h-12" />
                  </div>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-purple-100">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{card.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.slice(1).map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-slate-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
              }`}>
                {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-slate-600 text-white rounded-tr-sm shadow-sm' 
                  : 'bg-slate-50 border border-slate-100 text-slate-900 rounded-tl-sm shadow-xs'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the assistant anything..."
            className="w-full bg-slate-100 border-none text-slate-800 placeholder:text-slate-400 pl-6 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
          />
          <button 
            type="submit"
            disabled={!query.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-purple-600/20 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-xs text-slate-400">AI can make mistakes. Verify important information with official examination guidelines.</p>
        </div>
      </div>
    </div>
  );
}
