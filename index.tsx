
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- الأنواع ---
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

interface OrderDetails {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

// --- البيانات الأولية ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameAr: 'ساعة ذكية برو 2025', description: 'شاشة AMOLED، تتبع الصحة، وبطارية تدوم طويلاً.', price: 499, oldPrice: 799, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop' },
  { id: '2', nameAr: 'حقيبة يد جلدية فاخرة', description: 'صناعة يدوية من الجلد الطبيعي المغربي.', price: 350, category: 'موضة', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
  { id: '3', nameAr: 'زيت أركان أصلي 100%', description: 'مستخلص طبيعي للشعر والبشرة من تعاونيات سوس.', price: 120, oldPrice: 150, category: 'منتجات تقليدية', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400&auto=format&fit=crop' },
  { id: '4', nameAr: 'سماعات لاسلكية عازلة', description: 'صوت محيطي نقي مع ميزة إلغاء الضجيج.', price: 299, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' },
  { id: '5', nameAr: 'قفطان مغربي مطرز', description: 'أناقة تقليدية لكل المناسبات بتطريز يدوي.', price: 950, category: 'موضة', image: 'https://images.unsplash.com/photo-1585435421671-0c1676763d09?q=80&w=400&auto=format&fit=crop' },
  { id: '6', nameAr: 'مصباح نحاسي تقليدي', description: 'إضاءة دافئة بلمسة من فن الصناعة التقليدية.', price: 450, category: 'منزل', image: 'https://images.unsplash.com/photo-1542739674-b449a6323609?q=80&w=400&auto=format&fit=crop' }
];

const CATEGORIES = ['الكل', 'إلكترونيات', 'موضة', 'منزل', 'منتجات تقليدية'];

const App = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [category, setCategory] = useState('الكل');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'أهلاً بك في متجر المغرب! أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // منطق لوحة التحكم السرية
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({ category: 'إلكترونيات' });

  // نموذج الطلب
  const [checkoutData, setCheckoutData] = useState<OrderDetails>({ fullName: '', phone: '', city: '', address: '' });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setClickCount(0), 2000);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const filteredProducts = useMemo(() => 
    category === 'الكل' ? products : products.filter(p => p.category === category)
  , [category, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = products.map(p => `${p.nameAr} (${p.price} درهم)`).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت مساعد متجر "Matjar Maroc". الزبون يسأل: ${msg}. المنتجات: ${context}. أجب بلهجة مغربية ودودة.`
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'سمح ليا، كاين مشكل تقني حالياً.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const loginAdmin = () => {
    if (adminPass === 'maroc2025') {
      setIsAdmin(true);
      setShowAdminAuth(false);
    } else {
      alert('كلمة السر خاطئة!');
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData.fullName || !checkoutData.phone) {
      alert('المرجو إدخال الاسم ورقم الهاتف');
      return;
    }
    
    setIsProcessingOrder(true);
    // محاكاة عملية الإرسال
    setTimeout(() => {
      const orderId = 'MM-' + Math.floor(Math.random() * 1000000);
      setOrderSuccess(orderId);
      setIsProcessingOrder(false);
      setIsCheckoutOpen(false);
      setCart([]); // تفريغ السلة
    }, 2000);
  };

  // --- واجهة المسؤول ---
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl">
          <h1 className="text-xl font-black text-emerald-400 uppercase tracking-widest">لوحة التحكم</h1>
          <button onClick={() => setIsAdmin(false)} className="bg-red-500 px-4 py-1 rounded text-xs font-bold">خروج</button>
        </header>
        <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">إضافة منتج</h3>
            <div className="space-y-4">
              <input placeholder="اسم المنتج" className="w-full border p-2 rounded text-sm" onChange={e => setNewProd({...newProd, nameAr: e.target.value})} />
              <input placeholder="السعر" type="number" className="w-full border p-2 rounded text-sm" onChange={e => setNewProd({...newProd, price: Number(e.target.value)})} />
              <select className="w-full border p-2 rounded text-sm" onChange={e => setNewProd({...newProd, category: e.target.value})}>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="رابط الصورة" className="w-full border p-2 rounded text-sm" onChange={e => setNewProd({...newProd, image: e.target.value})} />
              <button 
                className="w-full bg-emerald-600 text-white py-2 rounded font-bold"
                onClick={() => {
                  if(!newProd.nameAr || !newProd.price) return alert('عمر البيانات!');
                  setProducts([{...newProd as Product, id: Date.now().toString()}, ...products]);
                  alert('تمت الإضافة!');
                }}
              >حفظ المنتج</button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="p-4">المنتج</th>
                  <th className="p-4">الفئة</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">إدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} className="w-8 h-8 rounded object-cover" />
                      <span className="text-sm font-bold">{p.nameAr}</span>
                    </td>
                    <td className="p-4 text-xs">{p.category}</td>
                    <td className="p-4 text-sm font-bold">{p.price} MAD</td>
                    <td className="p-4">
                      <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="text-red-500 text-xs underline">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    );
  }

  // --- واجهة الزبون ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => {
              const next = clickCount + 1;
              if (next === 5) { setShowAdminAuth(true); setClickCount(0); }
              else { setClickCount(next); }
            }}
            className="text-2xl font-black text-emerald-600 cursor-pointer select-none"
          >
            MATJAR MAROC
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAiOpen(true)} className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold">🤖 مساعد ذكي</button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-emerald-900 py-16 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">اكتشف روعة التسوق المغربي</h1>
            <p className="text-emerald-100 max-w-lg mx-auto text-sm opacity-80 leading-relaxed">أفضل المنتجات التقنية والتقليدية، بجودة عالية وتوصيل سريع لباب منزلك.</p>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8 flex gap-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setCategory(c)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${category === c ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border text-gray-500 hover:border-emerald-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products */}
      <main className="container mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col group">
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {p.oldPrice && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">تخفيض</span>}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">{p.category}</span>
              <h3 className="font-bold text-gray-800 text-sm my-1">{p.nameAr}</h3>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-lg font-black">{p.price} درهم</span>
                <button onClick={() => addToCart(p)} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 active:scale-95 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-slide-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                <h2 className="text-2xl font-black mb-2 text-gray-800">شكراً لثقتكم!</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">تم تسجيل طلبكم بنجاح. سنقوم بالاتصال بكم قريباً لتأكيد الشحن.</p>
                <div className="bg-emerald-50 p-3 rounded-xl mb-6">
                    <p className="text-xs text-emerald-700 font-bold uppercase mb-1">رقم الطلب</p>
                    <p className="text-xl font-black text-emerald-800">{orderSuccess}</p>
                </div>
                <button onClick={() => setOrderSuccess(null)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200">إغلاق</button>
            </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
                <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                    <h2 className="text-xl font-black">معلومات التوصيل</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="text-white/80">✕</button>
                </div>
                <form onSubmit={handleCheckout} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الكامل</label>
                            <input required className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" placeholder="مثال: محمد العلوي" onChange={e => setCheckoutData({...checkoutData, fullName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">رقم الهاتف</label>
                            <input required type="tel" className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-left" dir="ltr" placeholder="+212 6..." onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">المدينة</label>
                        <input required className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" placeholder="الدار البيضاء، الرباط..." onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">عنوان التوصيل</label>
                        <textarea required className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 h-24" placeholder="الحي، اسم الشارع، رقم الشقة..." onChange={e => setCheckoutData({...checkoutData, address: e.target.value})} />
                    </div>
                    <button disabled={isProcessingOrder} type="submit" className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${isProcessingOrder ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'}`}>
                        {isProcessingOrder ? 'جاري معالجة الطلب...' : 'تأكيد الطلب الآن'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full mr-auto shadow-2xl animate-slide-in flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black">سلة التسوق</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? <p className="text-center text-gray-400 py-20">السلة خاوية!</p> : cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center animate-fade-in">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover border" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{item.nameAr}</h4>
                    <p className="text-xs text-emerald-600 font-bold">{item.price} MAD × {item.quantity}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-xs text-red-300 hover:text-red-500 underline">إزالة</button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50 space-y-4">
              <div className="flex justify-between font-black text-lg"><span>المجموع:</span><span>{cart.reduce((a, b) => a + (b.price * b.quantity), 0)} درهم</span></div>
              <button 
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                إتمام الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-slide-in">
            <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">🤖 <h3 className="font-bold">مساعد ماتجار ماروك</h3></div>
              <button onClick={() => setIsAiOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none shadow-md' : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-emerald-600 font-bold animate-pulse">المساعد يكتب...</div>}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} placeholder="كيف أساعدك؟" className="flex-1 border rounded-full px-4 text-sm outline-emerald-500 text-right" />
              <button onClick={handleAiSend} className="bg-emerald-600 text-white p-2 rounded-full">
                <svg className="w-5 h-5 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xs animate-slide-in">
            <h2 className="text-xl font-black mb-4">الدخول للإدارة</h2>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full border rounded-xl p-3 text-center mb-4 text-lg outline-emerald-500 tracking-[0.5em]"
              autoFocus
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loginAdmin()}
            />
            <div className="flex gap-2">
              <button onClick={loginAdmin} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold">تأكيد</button>
              <button onClick={() => setShowAdminAuth(false)} className="bg-gray-100 text-gray-400 px-4 rounded-xl">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-10 bg-white border-t text-center text-gray-400 text-xs">
        <p className="font-black text-emerald-600 text-lg mb-2">MATJAR MAROC</p>
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لمتجر المغرب الذكي</p>
        <div className="mt-4 flex justify-center gap-4">
            <a href="#" className="hover:text-emerald-600 transition">تواصل معنا</a>
            <span>•</span>
            <a href="#" className="hover:text-emerald-600 transition">سياسة الخصوصية</a>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
