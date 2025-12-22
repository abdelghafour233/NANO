
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- الإعدادات والبيانات ---

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

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameAr: 'ساعة ذكية برو 2025', description: 'شاشة AMOLED، تتبع الصحة، وبطارية تدوم طويلاً.', price: 499, oldPrice: 799, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop' },
  { id: '2', nameAr: 'حقيبة يد جلدية فاخرة', description: 'صناعة يدوية من الجلد الطبيعي المغربي.', price: 350, category: 'موضة', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
  { id: '3', nameAr: 'زيت أركان أصلي 100%', description: 'مستخلص طبيعي للشعر والبشرة من تعاونيات سوس.', price: 120, oldPrice: 150, category: 'منتجات تقليدية', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400&auto=format&fit=crop' },
  { id: '4', nameAr: 'سماعات لاسلكية عازلة', description: 'صوت محيطي نقي مع ميزة إلغاء الضجيج.', price: 299, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' },
  { id: '5', nameAr: 'قفطان مغربي مطرز', description: 'أناقة تقليدية لكل المناسبات بتطريز يدوي.', price: 950, category: 'موضة', image: 'https://images.unsplash.com/photo-1585435421671-0c1676763d09?q=80&w=400&auto=format&fit=crop' },
  { id: '6', nameAr: 'مصباح نحاسي تقليدي', description: 'إضاءة دافئة بلمسة من فن الصناعة التقليدية.', price: 450, category: 'منزل', image: 'https://images.unsplash.com/photo-1542739674-b449a6323609?q=80&w=400&auto=format&fit=crop' }
];

const CATEGORIES = ['الكل', 'إلكترونيات', 'موضة', 'منزل', 'منتجات تقليدية'];

// --- المكونات الفرعية ---

// Fix: Use React.FC to properly handle intrinsic props like 'key' in TypeScript
const ProductCard: React.FC<{ product: Product, onAdd: (p: Product) => void }> = ({ product, onAdd }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">
    <div className="relative aspect-square overflow-hidden bg-gray-100">
      <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      {product.oldPrice && <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">تخفيض</div>}
    </div>
    <div className="p-4 flex flex-col gap-2">
      <span className="text-[10px] font-bold text-emerald-600 uppercase">{product.category}</span>
      <h3 className="font-bold text-gray-800 line-clamp-1">{product.nameAr}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-black text-gray-900">{product.price} درهم</span>
          {product.oldPrice && <span className="text-xs text-gray-400 line-through">{product.oldPrice} درهم</span>}
        </div>
        <button 
          onClick={() => onAdd(product)}
          className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
    </div>
  </div>
);

// --- التطبيق الرئيسي ---

const App = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [category, setCategory] = useState('الكل');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'أهلاً بك في متجر المغرب! أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // منطق لوحة التحكم
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'إلكترونيات' });

  useEffect(() => {
    if (adminClickCount === 5) {
      setShowAdminLogin(true);
      setAdminClickCount(0);
    }
    const timer = setTimeout(() => setAdminClickCount(0), 2000);
    return () => clearTimeout(timer);
  }, [adminClickCount]);

  const filteredProducts = useMemo(() => 
    category === 'الكل' ? products : products.filter(p => p.category === category)
  , [category, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const item = prev.find(i => i.id === product.id);
      if (item) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const total = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Fix: Initialize GoogleGenAI with direct process.env.API_KEY as per instructions
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const productsStr = products.map(p => `${p.nameAr} (${p.price} درهم)`).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت مساعد متجر "Matjar Maroc". الزبون يسأل: ${userMsg}. 
        المنتجات المتوفرة: ${productsStr}. 
        أجب بلهجة مغربية ودودة ومختصرة.`
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'عذراً، جرب مرة أخرى.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'سمح ليا، كاين مشكل تقني. جرب شوية آخر.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'maroc2025') {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('كلمة السر خاطئة!');
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const productToAdd = { 
      ...newProduct, 
      id, 
      price: Number(newProduct.price) || 0,
      image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'
    } as Product;
    setProducts(prev => [productToAdd, ...prev]);
    setNewProduct({ category: 'إلكترونيات' });
    alert('تم إضافة المنتج بنجاح!');
  };

  // واجهة المسؤول (Admin Panel Overlay)
  if (isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        <header className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-widest text-emerald-400 underline decoration-2 underline-offset-4">لوحة تحكم المسؤول</h1>
            <div className="flex gap-4 text-xs opacity-70">
              <span>إجمالي المنتجات: {products.length}</span>
              <span>الطلبات النشطة: 12</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminLoggedIn(false)}
            className="bg-red-500/20 hover:bg-red-500 text-red-100 px-4 py-1 rounded text-sm transition-all"
          >
            تسجيل الخروج
          </button>
        </header>
        
        <main className="container mx-auto p-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* إحصائيات سريعة */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-emerald-500">
              <p className="text-gray-500 text-xs">إجمالي المبيعات (اليوم)</p>
              <h4 className="text-xl font-black">4,520 درهم</h4>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-blue-500">
              <p className="text-gray-500 text-xs">الطلبات الجديدة</p>
              <h4 className="text-xl font-black">24 طلب</h4>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-amber-500">
              <p className="text-gray-500 text-xs">زوار الموقع اليوم</p>
              <h4 className="text-xl font-black">1,120 زائر</h4>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-purple-500">
              <p className="text-gray-500 text-xs">نسبة التحويل</p>
              <h4 className="text-xl font-black">3.2%</h4>
            </div>
          </div>

          {/* إضافة منتج جديد */}
          <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">إضافة منتج جديد</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">اسم المنتج</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.nameAr || ''} 
                  onChange={e => setNewProduct({...newProduct, nameAr: e.target.value})}
                  className="w-full bg-gray-50 border rounded-lg p-2 text-sm outline-emerald-500" 
                  placeholder="مثال: قفطان ملكي" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">السعر (MAD)</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.price || ''} 
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full bg-gray-50 border rounded-lg p-2 text-sm outline-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الفئة</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-gray-50 border rounded-lg p-2 text-sm outline-emerald-500"
                  >
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">رابط الصورة</label>
                <input 
                  type="text" 
                  value={newProduct.image || ''} 
                  onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full bg-gray-50 border rounded-lg p-2 text-sm outline-emerald-500" 
                  placeholder="https://..." 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                <textarea 
                  value={newProduct.description || ''} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-gray-50 border rounded-lg p-2 text-sm outline-emerald-500 h-20"
                />
              </div>
              <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">إضافة المنتج للكتالوج</button>
            </form>
          </div>

          {/* قائمة المنتجات الحالية */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <h3 className="font-bold p-6 bg-gray-50 border-b text-gray-800">إدارة الكتالوج الحالي</h3>
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-xs text-gray-500 sticky top-0">
                  <tr>
                    <th className="p-4">المنتج</th>
                    <th className="p-4">الفئة</th>
                    <th className="p-4">السعر</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded object-cover border" />
                        <span className="font-bold text-sm text-gray-700">{p.nameAr}</span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">{p.category}</td>
                      <td className="p-4 font-bold text-sm">{p.price} MAD</td>
                      <td className="p-4">
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-bold underline"
                        >حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setAdminClickCount(prev => prev + 1)}
              className="text-2xl font-black text-emerald-600 tracking-tighter cursor-pointer select-none"
            >
              MATJAR MAROC
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-500">
              <a href="#" className="text-emerald-600">الرئيسية</a>
              <a href="#" className="hover:text-emerald-600 transition">أحدث العروض</a>
              <a href="#" className="hover:text-emerald-600 transition">الفئات</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAiOpen(true)}
              className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition"
            >
              <span>🤖 المساعد الذكي</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-700 hover:text-emerald-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-emerald-900 relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto relative z-10 text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">سوق المغرب في جيبك</h1>
          <p className="text-emerald-100 text-lg mb-8 opacity-90 leading-relaxed">اكتشف تشكيلة واسعة من المنتجات المختارة بعناية، من التكنولوجيا الحديثة إلى الصناعة التقليدية الأصيلة.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-emerald-50 transition">تسوق الآن</button>
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-emerald-700 transition">عرض العروض</button>
          </div>
        </div>
      </section>

      {/* Main UI */}
      <main className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 mb-8">
          {CATEGORIES.map(c => (
            <button 
              key={c}
              onClick={() => setCategory(c)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${category === c ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border text-gray-600 hover:border-emerald-600'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
        </div>
      </main>

      {/* Admin Login Modal (Hidden trigger) */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)} />
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xs text-center">
            <h2 className="text-xl font-black mb-4">الدخول للإدارة</h2>
            <p className="text-xs text-gray-500 mb-6">يرجى إدخال رمز التحقق للوصول إلى لوحة التحكم</p>
            <input 
              type="password" 
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              placeholder="••••••••"
              className="w-full bg-gray-50 border rounded-xl p-3 text-center mb-4 tracking-[0.5em] outline-emerald-500"
              autoFocus
            />
            <button 
              onClick={handleAdminLogin}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              تأكيد الدخول
            </button>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full mr-auto shadow-2xl flex flex-col animate-slide-in">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-800">سلة المشتريات</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-red-500 transition">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <div className="bg-gray-100 p-6 rounded-full text-4xl">🛒</div>
                  <p className="text-gray-400 font-bold">سلتك خاوية حالياً!</p>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center animate-fade-in">
                  <img src={item.image} className="w-20 h-20 rounded-xl object-cover border" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.nameAr}</h4>
                    <p className="text-sm text-emerald-600 font-black">{item.price} درهم × {item.quantity}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 mt-2 font-bold underline">إزالة</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50 space-y-4">
              <div className="flex justify-between items-center text-lg font-black">
                <span>المجموع الإجمالي:</span>
                <span className="text-2xl text-emerald-600">{total} درهم</span>
              </div>
              <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all">إتمام الطلب</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col h-[80vh] overflow-hidden">
            <div className="p-5 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="font-black leading-none">مساعد ماتجار ماروك</h3>
                  <p className="text-[10px] opacity-80 mt-1">مدعوم بالذكاء الاصطناعي لمساعدتك</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-emerald-600 font-bold animate-pulse">المساعد يفكر...</div>}
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="اسأل عن المنتجات أو اطلب نصيحة..." 
                className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              />
              <button onClick={sendMessage} className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-700 transition">
                <svg className="w-5 h-5 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-10 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <div className="font-black text-emerald-600 text-xl mb-4 tracking-tighter">MATJAR MAROC</div>
          <p className="text-sm">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
          <div className="mt-4 flex justify-center gap-6 text-sm font-bold">
            <a href="#" className="hover:text-emerald-600">سياسة الخصوصية</a>
            <a href="#" className="hover:text-emerald-600">شروط الاستخدام</a>
            <a href="#" className="hover:text-emerald-600">تواصل معنا</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
