import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../App';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { id: 'where_eat', label: "Where should I eat tonight?", icon: '🍜' },
  { id: 'solo_safe', label: "Is this area safe at night?", icon: '🔒' },
  { id: 'change_plan', label: "Change tomorrow's plan", icon: '📅' },
  { id: 'local_tips', label: "Give me local tips nobody knows", icon: '✨' },
  { id: 'budget_check', label: "Am I on budget?", icon: '💰' },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a helpful travel assistant for a solo traveler using the SoloPath app. Keep your answers concise, friendly, and tailored to solo travel.",
        },
      });
      
      // Send the history
      // Note: For a real app, we'd pass the full message history to the chat instance.
      // Here we just send the latest message for simplicity, but we could initialize the chat with history.
      const response = await chat.sendMessage({ message: text });
      
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that request.",
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my travel brain right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen pb-[84px]">
      {/* Header */}
      <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40 p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <div 
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">AI Assistant</h2>
          <p className="text-primary text-xs font-semibold uppercase tracking-wider">Online</p>
        </div>
        <div className="flex w-10 items-center justify-end">
          <button className="flex items-center justify-center rounded-full size-10 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your travel companion</h3>
              <p className="text-slate-500 dark:text-slate-400">Ask me anything — from what to eat tonight to changing tomorrow's plans.</p>
            </div>
            
            <div className="w-full space-y-2 mt-8">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleSend(action.label)}
                  className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-colors text-left active:scale-[0.98]"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-2xl p-4",
                  msg.role === 'user' 
                    ? "bg-primary text-white self-end ml-auto rounded-br-sm" 
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 self-start mr-auto rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700"
                )}
              >
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            ))}
            {isTyping && (
              <div className="max-w-[85%] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 self-start mr-auto rounded-2xl rounded-bl-sm p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 flex items-end gap-2">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-end p-1 border border-transparent focus-within:border-primary/30 transition-colors">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(inputText);
              }
            }}
            placeholder="Ask anything about your trip..."
            className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            rows={1}
          />
        </div>
        <button
          onClick={() => handleSend(inputText)}
          disabled={!inputText.trim() || isTyping}
          className="w-12 h-12 shrink-0 bg-primary text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    </div>
  );
}
