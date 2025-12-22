
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AssistantModal from './components/AssistantModal';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, Category } from './types';

const CATEGORY_MAP: Record<string, string> = {
  'Electronics': 'إلكترونيات',
  'Fashion': 'موضة وأزياء',
  'Home & Kitchen': 'المنزل والمطبخ',
  'Beauty & Health': 'الجمال والصحة',
  'Traditional Moroccan': 'منتجات تقليدية'
};

const MOROCCAN_CITIES = [
  'الدار البيضاء', 'الرباط', 'مراكش', 'فاس', 'طنجة', 'أغادير', 'مكناس', 
  'وجدة', 'القنيطرة', 'تطوان', 'تمارة', 'آسفي', 'العيون', 'المحمدية'
];

interface Order {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  items: CartItem[];
  total: number;
  date: string;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // منطق الإدارة
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // نموذج الطلب
  const [checkoutData, setCheckoutData] = useState({ fullName: '', phone: '', city: MOROCCAN_CITIES[0] });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setClickCount(0), 5000);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, q: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: q } : item));
  };

  const handleLogoClick = () => {
    const next = clickCount + 1;
    if (next === 5) {
      setShowAdminAuth(true);
      setClickCount(0);
    } else {
      setClickCount(next);
    }
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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOrder(true);
    
    setTimeout(() => {
      const orderId = 'MM-' + Math.floor(Math.random() * 1000000);
      const total = cartItems.reduce((a, b) => a + (b.price * b.quantity), 0);
      
      const newOrder: Order = {
        id: orderId,
        customerName: checkoutData.fullName,
        phone: checkoutData.phone,
        city: checkoutData.city,
        items: [...cartItems],
        total: total,
        date: new Date().toLocaleString('ar-MA')
      };

      setOrders(prev => [newOrder, ...prev]);
      setOrderSuccess(orderId);
      setIsProcessingOrder(false);
      setIsCheckoutOpen(false);
      setCartItems([]);
      setCheckoutData({ fullName: '', phone: '', city: MOROCCAN_CITIES[0] });
    }, 1500);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    alert('تم التحديث بنجاح');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // --- واجهة المسؤول ---
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-right flex flex-col" dir="rtl">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-emerald-400">لوحة تحكم الإدارة</h1>
            <nav className="flex gap-2">
              <button onClick={() => setAdminTab('products')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${adminTab === 'products' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>إدارة المنتجات</button>
              <button onClick={() => setAdminTab('orders')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${adminTab === 'orders' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>الطلبيات ({orders.length})</button>
            </nav>
          </div>
          <button onClick={() => setIsAdmin(false)} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-xs font-bold transition">خروج</button>
        </header>

        <main className="container mx-auto p-6 flex-1">
          {adminTab === 'products' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">المنتجات والأسعار</h2>
                <button 
                  onClick={() => {
                    // Added missing 'name' property to satisfy the Product interface requirement
                    const newP: Product = { id: Date.now().toString(), name: 'New Product', nameAr: 'منتج جديد', description: '', price: 0, category: Category.ELECTRONICS, image: 'https://picsum.photos/200', rating: 5, reviews: 0 };
                    setProducts([newP, ...products]);
                    setEditingProduct(newP);
                  }}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-md transition"
                >+ إضافة منتج</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
                    <img src={p.image} className="w-16 h-16 rounded-xl object-cover border" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-sm">{p.nameAr}</h4>
                      <p className="text-emerald-600 font-black text-xs">{p.price} MAD</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition text-xs font-bold">تعديل</button>
                      <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition text-xs font-bold">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-800">سجل الطلبيات</h2>
              <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">الزبون / الهاتف</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">المدينة</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">المنتجات</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold">لا توجد طلبيات بعد.</td></tr>
                    ) : orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 text-sm">{order.customerName}</div>
                          <div className="text-xs text-slate-500" dir="ltr">{order.phone}</div>
                        </td>
                        <td className="p-4 text-sm">{order.city}</td>
                        <td className="p-4 text-[10px] text-slate-600 max-w-xs">{order.items.map(i => `${i.nameAr} (${i.quantity})`).join('، ')}</td>
                        <td className="p-4 font-black text-emerald-600">{order.total} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-bold">تعديل المنتج</h3>
                <button onClick={() => setEditingProduct(null)}>✕</button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                <input className="w-full border rounded-xl p-3 text-sm outline-none" placeholder="اسم المنتج" value={editingProduct.nameAr} onChange={e => setEditingProduct({...editingProduct, nameAr: e.target.value})} />
                <input type="number" className="w-full border rounded-xl p-3 text-sm outline-none" placeholder="السعر" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                <input className="w-full border rounded-xl p-3 text-sm outline-none" placeholder="رابط الصورة" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                <button type="submit" className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition">حفظ</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- واجهة الزبون ---
  return (
    <div className="min-h-screen flex flex-col text-right bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <div 
            onClick={handleLogoClick}
            className="text-2xl font-black text-emerald-600 cursor-pointer select-none tracking-tight"
          >
            MATJAR MAROC
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAssistantOpen(true)} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-100 transition">
              <span className="hidden sm:inline">المساعد الذكي</span> 🤖
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-emerald-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-emerald-900 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070" className="w-full h-full object-cover opacity-40" alt="" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">اكتشف أفضل ما في المغرب</h1>
          <p className="text-lg text-emerald-50 mb-8 opacity-90 leading-relaxed">من أحدث التقنيات إلى الحرف التقليدية الأصيلة. توصيل سريع لكل أنحاء المملكة.</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar flex-row-reverse">
          <button onClick={() => setActiveCategory('All')} className={`px-6 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${activeCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border'}`}>كل المنتجات</button>
          {Object.values(Category).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border'}`}>
              {CATEGORY_MAP[cat] || cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12 text-center text-gray-400">
        <p className="font-bold text-emerald-600 mb-2">MATJAR MAROC</p>
        <p className="text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة لمتجر المغرب</p>
      </footer>

      {/* Modals & UI Components */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={removeCartItem} onUpdateQuantity={updateQuantity} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={cartItems} />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden">
                <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-black">تفاصيل التوصيل</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="text-2xl">✕</button>
                </div>
                <form onSubmit={handleCheckout} className="p-8 space-y-6">
                    <input required className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm outline-none font-bold" placeholder="الاسم الكامل" onChange={e => setCheckoutData({...checkoutData, fullName: e.target.value})} />
                    <input required type="tel" className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm outline-none font-bold text-left" dir="ltr" placeholder="06 .. .. .. .." onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                    <select required className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm outline-none font-bold appearance-none text-right" onChange={e => setCheckoutData({...checkoutData, city: e.target.value})}>
                      {MOROCCAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                    <button disabled={isProcessingOrder} type="submit" className="w-full py-5 rounded-[22px] font-black text-xl transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200">
                        {isProcessingOrder ? 'جاري تسجيل الطلب...' : 'تأكيد الطلب الآن'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
                <h2 className="text-3xl font-black mb-3">شكراً لثقتكم!</h2>
                <p className="text-sm text-slate-500 mb-8">تم تسجيل طلبكم بنجاح. رمز الطلب: {orderSuccess}</p>
                <button onClick={() => setOrderSuccess(null)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">إغلاق</button>
            </div>
        </div>
      )}

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-center">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-xs">
            <h2 className="text-2xl font-black mb-6 uppercase">الدخول السري</h2>
            <input type="password" placeholder="••••••••" className="w-full border-2 rounded-2xl p-4 text-center mb-6 text-2xl outline-emerald-500 tracking-[0.5em] font-black" autoFocus onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && loginAdmin()} />
            <button onClick={loginAdmin} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl">دخول</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-6 text-slate-300 text-xs font-bold hover:text-slate-500 transition">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
