
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- الأنواع (Types) ---
interface Product {
  id: string;
  nameAr: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- البيانات الثابتة (Constants) ---
const PRODUCTS: Product[] = [
  { id: '1', nameAr: 'ساعة ذكية برو 2024', description: 'شاشة AMOLED عالية الدقة مع تتبع المؤشرات الصحية.', price: 499, oldPrice: 799, category: 'إلكترونيات', image: 'https://picsum.photos/seed/watch1/600/600' },
  { id: '2', nameAr: 'حقيبة يد جلدية أصلية', description: 'تصميم أنيق من الجلد الطبيعي للصناعة التقليدية.', price: 350, category: 'موضة', image: 'https://picsum.photos/seed/bag1/600/600' },
  { id: '3', nameAr: 'زيت أركان التجميلي 100مل', description: 'عضوي 100% من قلب سوس، مثالي للشعر والبشرة.', price: 120, oldPrice: 150, category: 'منتجات تقليدية', image: 'https://picsum.photos/seed/argan/600/600' },
  { id: '4', nameAr: 'سماعات بلوتوث عازلة', description: 'صوت نقي وبطارية تدوم طويلاً.', price: 299, category: 'إلكترونيات', image: 'https://picsum.photos/seed/buds/600/600' },
  { id: '5', nameAr: 'زربية أمازيغية منسوجة', description: 'قطعة فنية يدوية لتزيين منزلك بأصالة.', price: 1200, category: 'منتجات تقليدية', image: 'https://picsum.photos/seed/rug/600/600' },
  { id: '6', nameAr: 'مقلاة هوائية رقمية 5.5 لتر', description: 'طهي صحي وسريع بدون زيت.', price: 850, oldPrice: 1100, category: 'منزل', image: 'https://picsum.photos/seed/fryer/600/600' }
];

const CATEGORIES = ['الكل', 'إلكترونيات', 'موضة', 'منزل', 'منتجات تقليدية'];

// --- خدمة الذكاء الاصطناعي (AI Service) ---
const getAIResponse = async (userPrompt: string, cart: CartItem[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const productsContext = PRODUCTS.map(p => `${p.nameAr} بـ ${p.price} درهم`).join(', ');
    const cartContext = cart.length > 0 ? `في السلة: ${cart.map(i => i.nameAr).join(', ')}` : "السلة فارغة";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت مساعد ذكي لمتجر "Matjar Maroc". ساعد الزبناء في اختيار المنتجات. 
      المنتجات المتوفرة: ${productsContext}.
      حالة السلة: ${cartContext}.
      أجب بالدارجة المغربية الممزوجة بالعربية الفصحى بشكل ودود جداً.
      طلب الزبون: ${userPrompt}`
    });
    return response.text;
  } catch (e) {
    return "سمح ليا، كاين مشكل تقني دابا. جرب من بعد شوية!";
  }
};

// --- المكونات (Components) ---

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [category, setCategory] = useState('الكل');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'أهلاً بك في متجر المغرب! أنا المساعد الذكي ديالك، كيفاش نقدر نعاونك اليوم؟' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const filteredProducts = useMemo(() => 
    category === 'الكل' ? PRODUCTS : PRODUCTS.filter(p => p.category === category)
  , [category]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const total = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    const response = await getAIResponse(msg, cart);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: response || '' }]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-emerald-600">MATJAR MAROC</h1>
            <nav className="hidden md:flex gap-4 text-sm font-medium">
              <a href="#" className="text-emerald-600 border-b-2 border-emerald-600">الرئيسية</a>
              <a href="#" className="hover:text-emerald-600 transition">العروض</a>
              <a href="#" className="hover:text-emerald-600 transition">تواصل معنا</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold"
            >
              <span>🤖 المساعد الذكي</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-emerald-800 text-white py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">أفضل المنتجات المغربية والعالمية</h2>
        <p className="text-emerald-100 max-w-xl mx-auto">جودة عالية، أثمنة مناسبة، وتوصيل سريع لباب دارك في جميع أنحاء المغرب.</p>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8 overflow-x-auto no-scrollbar flex gap-3">
        {CATEGORIES.map(c => (
          <button 
            key={c}
            onClick={() => setCategory(c)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition ${category === c ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-600 hover:border-emerald-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={p.image} className="w-full aspect-square object-cover" alt={p.nameAr} />
              <div className="p-4">
                <span className="text-[10px] text-emerald-600 font-bold uppercase">{p.category}</span>
                <h3 className="font-bold text-gray-800 my-1">{p.nameAr}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-lg font-black">{p.price} درهم</span>
                    {p.oldPrice && <span className="text-xs text-gray-400 line-through block">{p.oldPrice} درهم</span>}
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full mr-auto flex flex-col shadow-2xl animate-slide-in">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">سلة التسوق</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <p className="text-center text-gray-400 py-10">السلة خاوية!</p> : cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img src={item.image} className="w-16 h-16 rounded object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{item.nameAr}</h4>
                    <p className="text-sm text-emerald-600">{item.price} درهم x {item.quantity}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 underline mt-1">حذف</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t space-y-4">
              <div className="flex justify-between font-bold"><span>المجموع:</span><span>{total} درهم</span></div>
              <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">إتمام الطلب</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col h-[70vh]">
            <div className="p-4 bg-emerald-600 text-white rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-full">🤖</div>
                <div><h3 className="font-bold">المساعد الذكي</h3><p className="text-[10px] opacity-70">عاوني نختار ليك أحسن العروض</p></div>
              </div>
              <button onClick={() => setIsAiOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-gray-400 animate-pulse">المساعد كيكتب...</div>}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input 
                value={aiInput} 
                onChange={e => setAiInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                placeholder="شنو كتقلب عليه؟" 
                className="flex-1 border rounded-full px-4 text-sm focus:outline-emerald-600"
              />
              <button onClick={handleAiSend} className="bg-emerald-600 text-white p-2 rounded-full">
                <svg className="w-5 h-5 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <div className="container mx-auto px-4">
          <p className="mb-2">MATJAR MAROC © 2024</p>
          <p className="text-xs">جودة مغربية، معايير عالمية</p>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
