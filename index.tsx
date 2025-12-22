
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

interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  items: CartItem[];
  total: number;
  date: string;
}

interface OrderDetails {
  fullName: string;
  phone: string;
  city: string;
}

// --- البيانات الأولية ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameAr: 'ساعة ذكية برو 2025', description: 'شاشة AMOLED، تتبع الصحة، وبطارية تدوم طويلاً.', price: 499, oldPrice: 799, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop' },
  { id: '2', nameAr: 'حقيبة يد جلدية فاخرة', description: 'صناعة يدوية من الجلد الطبيعي المغربي.', price: 350, category: 'موضة', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
  { id: '3', nameAr: 'زيت أركان أصلي 100%', description: 'مستخلص طبيعي للشعر والبشرة من تعاونيات سوس.', price: 120, oldPrice: 150, category: 'منتجات تقليدية', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400&auto=format&fit=crop' },
  { id: '4', nameAr: 'سماعات لاسلكية عازلة', description: 'صوت محيطي نقي مع ميزة إلغاء الضجيج.', price: 299, category: 'إلكترونيات', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' }
];

const CATEGORIES = ['الكل', 'إلكترونيات', 'موضة', 'منزل', 'منتجات تقليدية'];

const MOROCCAN_CITIES = [
  'الدار البيضاء', 'الرباط', 'مراكش', 'فاس', 'طنجة', 'أغادير', 'مكناس', 
  'وجدة', 'القنيطرة', 'تطوان', 'تمارة', 'آسفي', 'العيون', 'المحمدية'
];

const App = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [category, setCategory] = useState('الكل');
  
  // شات المساعد
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'أهلاً بك! أنا المساعد الذكي لمتجر المغرب. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // إدارة المسؤول
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [checkoutData, setCheckoutData] = useState<OrderDetails>({ fullName: '', phone: '', city: MOROCCAN_CITIES[0] });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOrder(true);
    
    setTimeout(() => {
      const orderId = 'MM-' + Math.floor(Math.random() * 1000000);
      const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
      
      const newOrder: Order = {
        id: orderId,
        customerName: checkoutData.fullName,
        phone: checkoutData.phone,
        city: checkoutData.city,
        items: [...cart],
        total: total,
        date: new Date().toLocaleString('ar-MA')
      };

      setOrders(prev => [newOrder, ...prev]);
      setOrderSuccess(orderId);
      setIsProcessingOrder(false);
      setIsCheckoutOpen(false);
      setCart([]);
      setCheckoutData({ fullName: '', phone: '', city: MOROCCAN_CITIES[0] });
    }, 1500);
  };

  const loginAdmin = () => {
    if (adminPass === 'maroc2025') {
      setIsAdmin(true);
      setShowAdminAuth(false);
      setAdminPass('');
    } else {
      alert('كلمة السر خاطئة!');
    }
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    alert('تم حفظ التغييرات بنجاح');
  };

  const handleAddProduct = () => {
    const newId = Date.now().toString();
    const newP: Product = {
        id: newId,
        nameAr: 'اسم المنتج',
        description: 'وصف المنتج...',
        price: 0,
        category: 'إلكترونيات',
        image: 'https://via.placeholder.com/400'
    };
    setProducts([newP, ...products]);
    setEditingProduct(newP);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = products.map(p => `${p.nameAr} ثمنه ${p.price} درهم`).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت مساعد متجر "Matjar Maroc". الزبون يسأل: ${msg}. قائمة المنتجات المتوفرة حالياً: ${context}. أجب بالدارجة المغربية بأسلوب تسويقي ذكي ومختصر.`
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'سمح ليا، كاين واحد العطب تقني. حاول مرة أخرى.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- واجهة المسؤول (Admin View) ---
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans text-right flex flex-col" dir="rtl">
        <header className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-2xl sticky top-0 z-[100]">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black text-emerald-400 tracking-tighter">لوحة التحكم</h1>
            <nav className="flex bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setAdminTab('products')} 
                className={`px-6 py-2 rounded-lg text-sm font-bold transition ${adminTab === 'products' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >📦 المنتجات</button>
              <button 
                onClick={() => setAdminTab('orders')} 
                className={`px-6 py-2 rounded-lg text-sm font-bold transition ${adminTab === 'orders' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >🛒 الطلبيات ({orders.length})</button>
            </nav>
          </div>
          <button onClick={() => setIsAdmin(false)} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl text-sm font-bold transition shadow-lg">خروج</button>
        </header>

        <main className="container mx-auto p-8 flex-1">
          {adminTab === 'products' ? (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-800">تسيير المنتجات والأسعار</h2>
                <button onClick={handleAddProduct} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-700 shadow-xl transition-all active:scale-95">+ إضافة منتج</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                    </div>
                    <h4 className="font-black text-slate-800 mb-1">{p.nameAr}</h4>
                    <p className="text-emerald-600 font-black text-xl mb-4">{p.price} MAD</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingProduct(p)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition">تعديل</button>
                      <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-100 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-3xl font-black text-slate-800">سجل الطلبيات الجديدة</h2>
              <div className="bg-white rounded-[40px] shadow-xl border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">المعرف / التاريخ</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">الزبون / الهاتف</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">المدينة</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">المنتجات</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.length === 0 ? (
                        <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-black text-xl">لا توجد أي طلبات حالياً.</td></tr>
                      ) : orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-all">
                          <td className="p-6">
                            <div className="font-black text-emerald-600 mb-1">{order.id}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{order.date}</div>
                          </td>
                          <td className="p-6">
                            <div className="font-black text-slate-800">{order.customerName}</div>
                            <div className="text-xs text-slate-500 font-mono tracking-tighter" dir="ltr">{order.phone}</div>
                          </td>
                          <td className="p-6 font-bold text-slate-700">{order.city}</td>
                          <td className="p-6">
                            <div className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                              {order.items.map(i => `${i.nameAr} (${i.quantity})`).join('، ')}
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black">{order.total} MAD</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal: Edit Product */}
        {editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-slide-in">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xl font-black">تعديل بيانات المنتج</h3>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white transition text-2xl">✕</button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-2 mr-1 uppercase">اسم المنتج</label>
                  <input required className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all" value={editingProduct.nameAr} onChange={e => setEditingProduct({...editingProduct, nameAr: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-2 mr-1 uppercase">الثمن الجديد (درهم)</label>
                    <input required type="number" className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 mb-2 mr-1 uppercase">الفئة</label>
                    <select className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                      {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 mb-2 mr-1 uppercase">رابط الصورة</label>
                  <input required className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[22px] font-black text-xl hover:bg-emerald-700 transition shadow-2xl shadow-emerald-200">حفظ جميع التعديلات</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- واجهة الزبون (Shop View) ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden text-right">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="text-3xl font-black text-emerald-600 tracking-tighter cursor-default">
            MATJAR MAROC
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAiOpen(true)} className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-full text-sm font-black hover:bg-emerald-100 transition shadow-sm">🤖 المساعد</button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 text-slate-600 group hover:bg-slate-50 rounded-2xl transition">
              <svg className="w-7 h-7 group-hover:text-emerald-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cart.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">سوق المغرب الرقمي</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium leading-relaxed opacity-90">جودة مغربية أصيلة، خدمات عصرية، وتوصيل سريع لباب دارك.</p>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-10 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setCategory(c)}
            className={`px-8 py-3 rounded-2xl whitespace-nowrap text-sm font-black transition-all duration-300 ${category === c ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 -translate-y-1' : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <main className="container mx-auto px-4 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group">
            <div className="aspect-square bg-slate-50 overflow-hidden relative">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.nameAr} />
              {p.oldPrice && <div className="absolute top-6 left-6 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg">تخفيض خاص</div>}
            </div>
            <div className="p-8 flex flex-col flex-1">
              <span className="text-[11px] text-emerald-600 font-black uppercase tracking-widest mb-2">{p.category}</span>
              <h3 className="font-black text-slate-800 text-lg mb-2 leading-tight">{p.nameAr}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-6 leading-relaxed font-medium">{p.description}</p>
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-900">{p.price} <small className="text-[10px]">MAD</small></span>
                    {p.oldPrice && <span className="text-sm text-slate-300 line-through font-bold">{p.oldPrice} MAD</span>}
                </div>
                <button onClick={() => addToCart(p)} className="bg-emerald-600 text-white p-4 rounded-[22px] hover:bg-emerald-700 active:scale-90 transition shadow-xl shadow-emerald-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
            <div className="bg-white p-10 rounded-[50px] shadow-2xl w-full max-w-md text-center animate-slide-in">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">✓</div>
                <h2 className="text-4xl font-black mb-4 text-slate-800">مبارك طلبكم!</h2>
                <p className="text-slate-500 mb-10 leading-relaxed px-4 font-medium">العملية تمت بنجاح. فريقنا غادي يتصل بيكم في أقرب وقت لتأكيد العنوان والشحن.</p>
                <div className="bg-slate-50 py-5 px-4 rounded-[30px] mb-10 border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-black uppercase mb-2 tracking-widest">رقم الطلبية الخاص بك</p>
                    <p className="text-3xl font-black text-slate-900 tracking-widest">{orderSuccess}</p>
                </div>
                <button onClick={() => setOrderSuccess(null)} className="w-full bg-emerald-600 text-white py-5 rounded-[25px] font-black text-xl shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95">استمرار بالتسوق</button>
            </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl overflow-hidden animate-slide-in">
                <div className="p-10 bg-emerald-600 text-white flex justify-between items-center">
                    <h2 className="text-3xl font-black">تأكيد الطلب</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="text-3xl text-white/70 hover:text-white transition">✕</button>
                </div>
                <form onSubmit={handleCheckout} className="p-10 space-y-8">
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 mb-3 mr-2 uppercase tracking-widest">الاسم الكامل</label>
                        <input required value={checkoutData.fullName} className="w-full border-2 border-slate-100 rounded-[25px] p-5 text-sm font-bold focus:border-emerald-500 outline-none bg-slate-50 transition-all shadow-sm" placeholder="محمد العلوي" onChange={e => setCheckoutData({...checkoutData, fullName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 mb-3 mr-2 uppercase tracking-widest">رقم الهاتف</label>
                        <input required type="tel" value={checkoutData.phone} className="w-full border-2 border-slate-100 rounded-[25px] p-5 text-sm font-bold focus:border-emerald-500 outline-none bg-slate-50 text-left transition-all shadow-sm" dir="ltr" placeholder="06 .. .. .. .." onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 mb-3 mr-2 uppercase tracking-widest">المدينة</label>
                        <select required value={checkoutData.city} className="w-full border-2 border-slate-100 rounded-[25px] p-5 text-sm font-bold focus:border-emerald-500 outline-none bg-slate-50 transition-all cursor-pointer shadow-sm appearance-none" onChange={e => setCheckoutData({...checkoutData, city: e.target.value})}>
                          {MOROCCAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <div className="pt-4">
                        <button disabled={isProcessingOrder} type="submit" className={`w-full py-6 rounded-[28px] font-black text-2xl shadow-2xl transition-all active:scale-95 ${isProcessingOrder ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'}`}>
                            {isProcessingOrder ? 'جاري التحميل...' : 'تأكيد الطلب الآن'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full mr-auto shadow-2xl animate-slide-in flex flex-col">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-800">سلتي</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-300 hover:text-red-500 transition text-3xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-10 py-20">
                    <svg className="w-24 h-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p className="font-black text-2xl">السلة فارغة</p>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-5 items-center border-b border-slate-50 pb-8 animate-fade-in">
                  <img src={item.image} className="w-20 h-20 rounded-[20px] object-cover border-2 border-white shadow-sm" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-800 truncate mb-1">{item.nameAr}</h4>
                    <p className="text-emerald-600 font-black">{item.price} MAD × {item.quantity}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-[11px] text-red-400 font-black underline hover:text-red-600 transition">حذف</button>
                </div>
              ))}
            </div>
            <div className="p-8 border-t bg-slate-50 space-y-6 rounded-t-[50px]">
              <div className="flex justify-between font-black text-2xl text-slate-900">
                  <span>الإجمالي:</span>
                  <span className="text-emerald-600">{cart.reduce((a, b) => a + (b.price * b.quantity), 0)} درهم</span>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                disabled={cart.length === 0}
                className={`w-full py-5 rounded-[25px] font-black text-xl shadow-2xl transition-all active:scale-95 ${cart.length === 0 ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
              >
                إتمام الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-6">
          <div className="bg-white p-12 rounded-[50px] shadow-2xl w-full max-w-xs animate-slide-in text-center">
            <div className="mb-6 text-emerald-600 text-4xl">🔒</div>
            <h2 className="text-2xl font-black mb-8 text-slate-800 uppercase tracking-widest">منطقة المسؤول</h2>
            <input 
              type="password" 
              placeholder="كلمة السر" 
              className="w-full border-2 border-slate-100 rounded-[25px] p-5 text-center mb-8 text-2xl font-black outline-emerald-500 tracking-[0.4em] shadow-inner"
              autoFocus
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loginAdmin()}
            />
            <button onClick={loginAdmin} className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black text-lg hover:bg-slate-800 transition shadow-2xl active:scale-95">تأكيد الدخول</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-8 text-slate-300 text-xs font-black hover:text-slate-500 transition">إلغاء والعودة</button>
          </div>
        </div>
      )}

      {/* Assistant Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[45px] shadow-2xl flex flex-col h-[75vh] overflow-hidden animate-slide-in">
            <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">🤖 <h3 className="font-black text-xl">مساعدك الذكي</h3></div>
              <button onClick={() => setIsAiOpen(false)} className="text-3xl opacity-70 hover:opacity-100">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-5 rounded-[30px] text-sm font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-emerald-600 font-black animate-pulse mr-2">جاري الكتابة...</div>}
            </div>
            <div className="p-8 border-t bg-white flex gap-3">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} placeholder="سولني على أي حاجة.." className="flex-1 border-2 border-slate-50 rounded-[22px] px-6 py-4 text-sm font-black outline-emerald-500 text-right" />
              <button onClick={handleAiSend} className="bg-emerald-600 text-white p-4 rounded-[22px] hover:bg-emerald-700 transition shadow-xl shadow-emerald-100">
                <svg className="w-6 h-6 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-24 bg-white border-t text-center">
        <div className="container mx-auto px-4">
            <p className="font-black text-emerald-600 text-3xl mb-4 tracking-tighter">MATJAR MAROC</p>
            <p className="text-sm font-bold text-slate-400 mb-10">© {new Date().getFullYear()} جميع الحقوق محفوظة لمتجر المغرب الرقمي</p>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
                <button onClick={() => setShowAdminAuth(true)} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-slate-800 transition shadow-xl">
                    <span>🔑 دخول الإدارة</span>
                </button>
                <a href="#" className="text-[11px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition">تواصل معنا</a>
                <a href="#" className="text-[11px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition">سياسة الخصوصية</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
