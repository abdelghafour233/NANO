
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
    { role: 'model', text: 'مرحباً بك! أنا مساعدك الذكي في متجر المغرب. كيف يمكنني مساعدتك اليوم؟' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh] text-right">
        <div className="flex items-center justify-between p-4 border-b bg-emerald-600 text-white rounded-t-2xl flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-right">
              <h3 className="font-bold">المساعد الذكي</h3>
              <p className="text-[10px] opacity-80">مدعوم بتقنية Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                m.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tl-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tr-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex gap-2 flex-row-reverse">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اطرح سؤالاً أو اطلب نصيحة..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
            />
            <button 
              onClick={handleSend}
              className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 -rotate-90" viewBox="0 0 20 20" fill="currentColor">
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
