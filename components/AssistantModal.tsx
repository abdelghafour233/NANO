
import React, { useState, useRef, useEffect } from 'react';
import { getShoppingAdvice } from '../services/geminiService';
import { Message, CartItem } from '../types';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, cartItems }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'مرحباً بك في عبدو ويب! أنا مساعدك التقني الذكي. كيف يمكنني مساعدتك اليوم في اكتشاف أحدث التقنيات وأخبار المغرب؟ 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const aiResponse = await getShoppingAdvice(userMsg, cartItems);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1B4332]/60 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#FCF9F1] dark:bg-[#0F172A] rounded-[50px] shadow-2xl flex flex-col max-h-[85vh] text-right border border-[#E5E0D3] dark:border-white/10 overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between p-8 border-b border-[#E5E0D3] dark:border-white/10 bg-[#1B4332] dark:bg-[#1E293B] text-[#FCF9F1] flex-row-reverse">
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className="w-12 h-12 bg-white/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner dark:text-emerald-400">🤖</div>
            <div className="text-right">
              <h3 className="font-black text-lg tracking-tight">مساعد عبدو ويب</h3>
              <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">خبير التقنية الرقمي</p>
            </div>
          </div>
          <button onClick={onClose} className="text-2xl opacity-60 hover:opacity-100 transition">✕</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FCF9F1] dark:bg-[#0F172A] no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-5 rounded-[30px] shadow-sm font-bold text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-[#1B4332] dark:bg-emerald-600 text-[#FCF9F1] rounded-tr-none shadow-xl' 
                  : 'bg-white dark:bg-[#1E293B] text-[#1B4332] dark:text-slate-100 border border-[#E5E0D3] dark:border-white/5 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-white dark:bg-[#1E293B] border border-[#E5E0D3] dark:border-white/5 p-4 rounded-[30px] rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="text-[10px] font-black text-[#1B4332] dark:text-emerald-400 animate-pulse">جاري التفكير..</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-[#1B4332] dark:bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-[#1B4332] dark:bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-[#1B4332] dark:bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-[#E5E0D3] dark:border-white/10 bg-white dark:bg-[#1E293B]">
          <div className="flex gap-3 flex-row-reverse">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اسألني عن مراجعة جهاز أو خبر تقني.."
              className="flex-1 bg-[#FCF9F1] dark:bg-[#0F172A] border-2 border-[#F2EFE6] dark:border-white/10 rounded-[25px] px-8 py-5 text-sm font-bold focus:border-[#1B4332] dark:focus:border-emerald-500 outline-none text-[#1B4332] dark:text-white placeholder-[#1B4332]/30 dark:placeholder-white/20"
            />
            <button 
              onClick={handleSend}
              className="bg-[#1B4332] dark:bg-emerald-500 text-[#FCF9F1] p-5 rounded-[25px] hover:opacity-90 shadow-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 -rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantModal;
