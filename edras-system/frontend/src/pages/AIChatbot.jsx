import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Bot, User, Sparkles, RefreshCw, ShieldCheck, HelpCircle, Mic, MicOff, Volume2, Square } from 'lucide-react';
import { http, isNetworkError, markOffline } from '../lib/backend';
import { localReply } from '../lib/knowledge';

export default function AIChatbot({ theme }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am NeuroCare AI, your pretrained Neurological Medical Assistant. I am trained on dementia assessment datasets, MMSE/MoCA cognitive guidelines, and Brain MRI structural biomarkers. How can I assist your brain health today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const recRef = useRef(null);
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => { window.speechSynthesis?.cancel(); recRef.current?.stop(); }, []);

  // Voice input (Chrome/Edge): speak the question instead of typing.
  const toggleListen = () => {
    if (!SR) return;
    if (listening) { recRef.current?.stop(); return; }
    const r = new SR();
    r.lang = 'en-IN'; r.interimResults = true;
    r.onresult = (e) => setInput(Array.from(e.results).map((x) => x[0].transcript).join(''));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r; r.start(); setListening(true);
  };

  // Read answers aloud: helpful for elderly patients and low-vision users.
  const speak = (idx, text) => {
    const synth = window.speechSynthesis;
    if (speakingIdx === index) { synth.cancel(); setSpeakingIdx(null); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.onend = () => setSpeakingIdx(null);
    synth.speak(u); setSpeakingIdx(idx);
  };

  const suggestedQuestions = [
    "What are early signs of cognitive decline?",
    "How does my Brain MRI scan calculate dementia risk?",
    "How do MMSE & MoCA test scores work?",
    "What lifestyle habits improve brain health?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const response = await http.post('/api/assessments/ai-chatbot', { message: query });
      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply, timestamp: stamp() }]);
      }
    } catch (err) {
      if (isNetworkError(err)) markOffline();
      // Offline: answer from the same knowledge topics the backend uses (was one fixed reply for every question).
      await new Promise((r) => setTimeout(r, 600));
      setMessages(prev => [...prev, { sender: 'bot', text: localReply(query), timestamp: stamp() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> PRETRAINED MEDICAL AI CHATBOT
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">NeuroCare Assistant</h1>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="med-panel rounded-3xl border border-sky-200/80 dark:border-slate-800 flex flex-col h-[560px] overflow-hidden shadow-2xl">
        
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-gradient-to-tr from-sky-500 to-cyan-500 text-white shadow-md'
              }`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div className={`max-w-xl p-4 rounded-3xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-sky-200/80 dark:border-slate-800 shadow-sm'
              }`}>
                <p className="leading-relaxed font-medium">{msg.text}</p>
                <div className="flex items-center justify-end gap-2 mt-1.5">
                  {msg.sender === 'bot' && canSpeak && (
                    <button type="button" onClick={() => speak(index, msg.text)} className="flex items-center gap-1 text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer" aria-label={speakingIdx === index ? 'Stop reading' : 'Read aloud'}>
                      {speakingIdx === index ? <><Square className="w-3 h-3" />Stop</> : <><Volume2 className="w-3 h-3" />Read aloud</>}
                    </button>
                  )}
                  <span className="text-[10px] opacity-70 font-mono">{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-sky-200/80 dark:border-slate-800 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 bg-sky-50/60 dark:bg-slate-900/60 border-t border-sky-200/80 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto">
          <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 ml-2" />
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500 whitespace-nowrap cursor-pointer transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-4 bg-white dark:bg-slate-950 border-t border-sky-200/80 dark:border-slate-800 flex items-center space-x-3"
        >
          {SR && (
            <button type="button" onClick={toggleListen} aria-pressed={listening} aria-label={listening ? 'Stop voice input' : 'Ask by voice'}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all ${listening ? 'bg-red-600 text-white animate-pulse' : 'btn-soft-secondary'}`}>
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          <input
            type="text"
            aria-label="Your question"
            placeholder={listening ? 'Listening… speak your question' : "Ask AI Assistant about MRI scans, dementia symptoms, or cognitive health..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-sky-50/60 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3.5 rounded-2xl btn-soft-primary text-white cursor-pointer disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>

    </div>
  );
}
