
import React, { useState, useMemo, useEffect } from 'react';
import ArticleCard from './components/ArticleCard';
import AssistantModal from './components/AssistantModal';
import { ARTICLES as INITIAL_ARTICLES } from './constants';
import { Article, BlogCategory } from './types';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All'>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Admin States
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return articles;
    return articles.filter(a => a.category === activeCategory);
  }, [activeCategory, articles]);

  const handleLogoClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next === 5) {
        setShowAdminAuth(true);
        return 0;
      }
      return next;
    });
  };

  const loginAdmin = () => {
    if (adminPass === 'abdou2025') {
      setIsAdmin(true);
      setShowAdminAuth(false);
      setAdminPass('');
    } else {
      alert('كلمة السر خاطئة!');
    }
  };

  const handleUpdateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (articles.find(a => a.id === editingArticle.id)) {
      setArticles(articles.map(a => a.id === editingArticle.id ? editingArticle : a));
    } else {
      setArticles([editingArticle, ...articles]);
    }
    setEditingArticle(null);
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-right flex flex-col transition-colors duration-500" dir="rtl">
        <header className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-black">لوحة تحكم عبدو ويب</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setEditingArticle({ id: Date.now().toString(), title: '', excerpt: '', content: '', author: 'AbdouWeb', date: new Date().toLocaleDateString('ar-MA'), category: BlogCategory.TECH, image: '', readTime: '5 دقائق' })}
              className="bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold"
            >+ مقال جديد</button>
            <button onClick={() => setIsAdmin(false)} className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold">خروج</button>
          </div>
        </header>
        <main className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {articles.map(a => (
            <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700 shadow-sm">
              <img src={a.image} className="w-full h-32 object-cover rounded-xl mb-4" alt="" />
              <h3 className="font-bold text-sm mb-4 line-clamp-2 dark:text-white">{a.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => setEditingArticle(a)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-xs">تعديل</button>
                <button onClick={() => setArticles(articles.filter(x => x.id !== a.id))} className="bg-red-500 text-white p-2 rounded-lg">🗑️</button>
              </div>
            </div>
          ))}
        </main>
        {editingArticle && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black mb-6 dark:text-white">تحرير المحتوى</h2>
              <form onSubmit={handleUpdateArticle} className="space-y-4">
                <input className="w-full border p-4 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="العنوان" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                <textarea className="w-full border p-4 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="المحتوى" rows={8} value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
                <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black">حفظ</button>
                <button type="button" onClick={() => setEditingArticle(null)} className="w-full text-gray-500">إلغاء</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-right transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b dark:border-slate-800">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xl">A</div>
            <span className="text-2xl font-black tracking-tighter dark:text-white">ABDOUWEB</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 text-xs font-bold rounded-lg ${activeCategory === 'All' ? 'bg-emerald-600 text-white' : 'dark:text-slate-400'}`}>الكل</button>
            {Object.values(BlogCategory).map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 text-xs font-bold rounded-lg ${activeCategory === c ? 'bg-emerald-600 text-white' : 'dark:text-slate-400'}`}>{c}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl dark:text-emerald-400">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button onClick={() => setIsAssistantOpen(true)} className="p-3 bg-emerald-600 text-white rounded-xl">🤖</button>
          </div>
        </div>
      </nav>

      {/* Featured */}
      {activeCategory === 'All' && articles[0] && (
        <header className="container mx-auto px-6 pt-8">
          <div onClick={() => setSelectedArticle(articles[0])} className="relative h-[500px] rounded-[40px] overflow-hidden cursor-pointer group shadow-2xl">
            <img src={articles[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-12 right-12 left-12">
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 inline-block">{articles[0].category}</span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight max-w-4xl">{articles[0].title}</h1>
              <p className="text-white/70 line-clamp-2 max-w-2xl">{articles[0].excerpt}</p>
            </div>
          </div>
        </header>
      )}

      {/* Articles Grid */}
      <main className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-12 dark:text-white">آخر المستجدات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(a => (
            <ArticleCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} />
          ))}
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t dark:border-slate-800 py-20 text-center transition-colors">
        <h2 className="text-3xl font-black mb-4 dark:text-white tracking-widest">ABDOUWEB</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-10">منصة مغربية رائدة في المحتوى التقني والمراجعات الرقمية.</p>
        <button onClick={() => setShowAdminAuth(true)} className="text-[10px] font-bold opacity-30 hover:opacity-100 dark:text-white">بوابة التحرير</button>
      </footer>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-12 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl animate-slide-in my-auto">
            <div className="relative h-80 lg:h-[500px]">
              <img src={selectedArticle.image} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full">✕</button>
            </div>
            <div className="p-10 lg:p-20">
              <div className="flex gap-4 mb-6 text-xs font-bold text-emerald-600">
                <span>{selectedArticle.category}</span>
                <span>•</span>
                <span>{selectedArticle.date}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black mb-10 dark:text-white leading-tight">{selectedArticle.title}</h2>
              <div className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed space-y-6 whitespace-pre-line">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[50px] w-full max-w-sm text-center">
            <h2 className="text-2xl font-black mb-8 dark:text-white">تسجيل الدخول</h2>
            <input 
              type="password" 
              className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent p-4 text-center text-xl font-bold dark:text-white outline-none focus:border-emerald-500 mb-8"
              placeholder="••••••••"
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loginAdmin()}
            />
            <button onClick={loginAdmin} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black">تحقق</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-6 text-xs text-slate-400">إلغاء</button>
          </div>
        </div>
      )}

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={[]} />
    </div>
  );
};

export default App;
