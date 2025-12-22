
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

  // منطق الإدارة
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // نموذج الطلب
  const [checkoutData, setCheckoutData] = useState<OrderDetails>({ fullName: '', phone: '', city: MOROCCAN_CITIES[0] });
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

      setOrders([newOrder, ...orders]);
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
    alert('تم تحديث المنتج بنجاح');
  };

  const handleAddProduct = () => {
    const newId = Date.now().toString();
    const newP: Product = {
        id: newId,
        nameAr: 'منتج جديد',
        description: 'وصف المنتج الجديد...',
        price: 100,
        category: 'إلكترونيات',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400'
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

  // --- واجهة المسؤول ---
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-right flex flex-col" dir="rtl">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-emerald-400">لوحة تحكم المدير</h1>
            <nav className="flex gap-2">
              <button 
                onClick={() => setAdminTab('products')} 
                className={`px-4 py-1 rounded-full text-sm font-bold transition ${adminTab === 'products' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >إدارة المنتجات</button>
              <button 
                onClick={() => setAdminTab('orders')} 
                className={`px-4 py-1 rounded-full text-sm font-bold transition ${adminTab === 'orders' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >الطلبيات ({orders.length})</button>
            </nav>
          </div>
          <button onClick={() => setIsAdmin(false)} className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg text-xs font-bold transition">خروج</button>
        </header>

        <main className="container mx-auto p-6 flex-1">
          {adminTab === 'products' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">قائمة المنتجات</h2>
                <button onClick={handleAddProduct} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-md transition">+ إضافة منتج</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                    <img src={p.image} className="w-20 h-20 rounded-xl object-cover border" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{p.nameAr}</h4>
                      <p className="text-emerald-600 font-black">{p.price} درهم</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setEditingProduct(p)} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-200">تعديل</button>
                        <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded hover:bg-red-100">حذف</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-800">سجل الطلبيات</h2>
              <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 text-sm font-bold text-slate-500">الزبون / الهاتف</th>
                      <th className="p-4 text-sm font-bold text-slate-500">المدينة</th>
                      <th className="p-4 text-sm font-bold text-slate-500">المنتجات</th>
                      <th className="p-4 text-sm font-bold text-slate-500">المجموع</th>
                      <th className="p-4 text-sm font-bold text-slate-500">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-400">لا توجد طلبيات بعد.</td></tr>
                    ) : orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{order.customerName}</div>
                          <div className="text-xs text-slate-500" dir="ltr">{order.phone}</div>
                        </td>
                        <td className="p-4 text-sm">{order.city}</td>
                        <td className="p-4">
                          <div className="text-xs text-slate-600">
                            {order.items.map(i => `${i.nameAr} (${i.quantity})`).join('، ')}
                          </div>
                        </td>
                        <td className="p-4 font-black text-emerald-600">{order.total} MAD</td>
                        <td className="p-4 text-xs text-slate-400">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* نافذة تعديل المنتج */}
        {editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold">تعديل بيانات المنتج</h3>
                <button onClick={() => setEditingProduct(null)}>✕</button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">اسم المنتج</label>
                  <input className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={editingProduct.nameAr} onChange={e => setEditingProduct({...editingProduct, nameAr: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الثمن (درهم)</label>
                  <input type="number" className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الفئة</label>
                  <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">رابط الصورة</label>
                  <input className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition">حفظ التغييرات</button>
              </form>
            </div>
          </div>
        )}
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
            className="text-2xl font-black text-emerald-600 cursor-pointer select-none tracking-tighter"
          >
            MATJAR MAROC
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAiOpen(true)} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-100 transition">🤖 مساعد ذكي</button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-600">
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
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">سوق المغرب في جيبك</h1>
            <p className="text-emerald-100 max-w-lg mx-auto text-sm opacity-80 leading-relaxed">جودة عالية وتوصيل سريع لباب منزلك في جميع أنحاء المملكة.</p>
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
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col group">
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nameAr} />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">{p.category}</span>
              <h3 className="font-bold text-gray-800 text-sm my-1">{p.nameAr}</h3>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-lg font-black text-slate-900">{p.price} درهم</span>
                <button onClick={() => addToCart(p)} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 active:scale-95 transition shadow-md">
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
                <div className="bg-emerald-50 p-3 rounded-xl mb-6 text-emerald-800 font-black text-xl">{orderSuccess}</div>
                <button onClick={() => setOrderSuccess(null)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition">إغلاق</button>
            </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-in">
                <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                    <h2 className="text-xl font-black text-right w-full">إتمام الطلب</h2>
                    <button onClick={() => setIsCheckoutOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleCheckout} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 text-right">الاسم الكامل</label>
                        <input required value={checkoutData.fullName} className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-right" placeholder="مثال: محمد العلوي" onChange={e => setCheckoutData({...checkoutData, fullName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 text-right">رقم الهاتف</label>
                        <input required type="tel" value={checkoutData.phone} className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 text-left" dir="ltr" placeholder="06 / 07 ..." onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 text-right">المدينة</label>
                        <select required value={checkoutData.city} className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 transition-all cursor-pointer text-right" onChange={e => setCheckoutData({...checkoutData, city: e.target.value})}>
                          {MOROCCAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <button disabled={isProcessingOrder} type="submit" className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${isProcessingOrder ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                        {isProcessingOrder ? 'جاري إرسال الطلب...' : 'تأكيد الطلب الآن'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full mr-auto shadow-2xl animate-slide-in flex flex-col text-right">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black">سلة التسوق</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? <p className="text-center text-gray-400 py-20 font-bold">السلة فارغة!</p> : cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                  <img src={item.image} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{item.nameAr}</h4>
                    <p className="text-xs text-emerald-600 font-bold">{item.price} MAD × {item.quantity}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-xs text-red-400 underline">حذف</button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50 space-y-4">
              <div className="flex justify-between font-black text-lg"><span>المجموع:</span><span className="text-emerald-600">{cart.reduce((a, b) => a + (b.price * b.quantity), 0)} درهم</span></div>
              <button 
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${cart.length === 0 ? 'bg-gray-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                إتمام الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xs animate-slide-in">
            <h2 className="text-xl font-black mb-4">الدخول للإدارة</h2>
            <input 
              type="password" 
              placeholder="كلمة السر" 
              className="w-full border rounded-xl p-3 text-center mb-4 text-lg outline-emerald-500 tracking-widest"
              autoFocus
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loginAdmin()}
            />
            <button onClick={loginAdmin} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">تأكيد</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-4 text-slate-400 text-xs">إلغاء</button>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-slide-in text-right">
            <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">🤖 <h3 className="font-bold">المساعد الذكي</h3></div>
              <button onClick={() => setIsAiOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-emerald-600 font-bold animate-pulse">جاري التفكير...</div>}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} placeholder="كيفاش نقدر نعاونك؟" className="flex-1 border rounded-full px-4 py-2 text-sm outline-emerald-500 text-right" />
              <button onClick={handleAiSend} className="bg-emerald-600 text-white p-2.5 rounded-full hover:bg-emerald-700 transition">
                <svg className="w-5 h-5 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-10 bg-white border-t text-center text-slate-400 text-xs">
        <p className="font-black text-emerald-600 text-lg mb-2">MATJAR MAROC</p>
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لمتجر المغرب</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
