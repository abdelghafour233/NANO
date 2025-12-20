
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AssistantModal from './components/AssistantModal';
import { PRODUCTS } from './constants';
import { Product, CartItem, Category } from './types';

const CATEGORY_MAP: Record<string, string> = {
  'Electronics': 'إلكترونيات',
  'Fashion': 'موضة وأزياء',
  'Home & Kitchen': 'المنزل والمطبخ',
  'Beauty & Health': 'الجمال والصحة',
  'Traditional Moroccan': 'منتجات تقليدية'
};

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col text-right">
      <Header 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)} 
        onAssistantClick={() => setIsAssistantOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-emerald-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40" 
            alt="Hero background"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">اكتشف أفضل ما في المغرب</h1>
          <p className="text-lg text-emerald-50 mb-8 opacity-90">من أحدث التقنيات إلى الحرف التقليدية الأصيلة. توصيل سريع لكل أنحاء المملكة.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition">تسوق الآن</button>
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition">عرض الكتالوج</button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar flex-row-reverse">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
              activeCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border hover:border-emerald-500'
            }`}
          >
            كل المنتجات
          </button>
          {Object.values(Category).map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border hover:border-emerald-500'
              }`}
            >
              {CATEGORY_MAP[cat] || cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12 text-right">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-bold text-emerald-600 mb-4">MATJAR MAROC</h4>
            <p className="text-sm text-gray-500 leading-relaxed">وجهتكم الأولى للتسوق الإلكتروني في المغرب. جودة، سرعة، وثقة.</p>
          </div>
          <div>
            <h5 className="font-bold mb-4">روابط سريعة</h5>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-emerald-600">من نحن</a></li>
              <li><a href="#" className="hover:text-emerald-600">اتصل بنا</a></li>
              <li><a href="#" className="hover:text-emerald-600">معلومات الشحن</a></li>
              <li><a href="#" className="hover:text-emerald-600">سياسة الخصوصية</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">خدمة العملاء</h5>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-emerald-600">سياسة الإرجاع</a></li>
              <li><a href="#" className="hover:text-emerald-600">تتبع الطلب</a></li>
              <li><a href="#" className="hover:text-emerald-600">تواصل معنا</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">تابعنا</h5>
            <div className="flex gap-4 flex-row-reverse">
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">F</a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">I</a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">T</a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Matjar Maroc. جميع الحقوق محفوظة.
        </div>
      </footer>

      {/* Persistence / Modals */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onRemove={removeCartItem}
        onUpdateQuantity={updateQuantity}
      />
      <AssistantModal 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
        cartItems={cartItems}
      />
      
      <button className="fixed bottom-6 left-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.436h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </button>
    </div>
  );
};

export default App;
