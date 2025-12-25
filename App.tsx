
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
      alert('كلمة السر خاطئة! حاول مرة أخرى.');
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

  const deleteArticle = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  // --- واجهة لوحة التحكم ---
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-right flex flex-col transition-colors duration-500" dir="rtl">
        <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black dark:text-white">لوحة تحكم عبدو ويب</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إدارة المحتوى التقني</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setEditingArticle({
                id: Date.now().toString(),
                title: '',
                excerpt: '',
                content: '',
                author: 'عبدو تيك',
                date: new Date().toLocaleDateString('ar-MA'),
                category: BlogCategory.TECH,
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200',
                readTime: '5 دقائق'
              })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-500/20"
            >
              + مقال جديد
            </button>
            <button 
              onClick={() => setIsAdmin(false)} 
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-2xl text-sm font-black hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
            >
              خروج
            </button>
          </div>
        </header>

        <main className="container mx-auto p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map(a => (
              <div key={a.id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all duration-500">
                <div className="h-40 relative overflow-hidden">
                  <img src={a.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-black uppercase dark:text-white">
                    {a.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-sm mb-4 line-clamp-2 dark:text-white min-h-[40px] leading-relaxed">{a.title}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingArticle(a)} 
                      className="flex-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 py-3 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors"
                    >
                      تعديل
                    </button>
                    <button 
                      onClick={() => deleteArticle(a.id)} 
                      className="bg-red-50 dark:bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Modal التعديل والإضافة */}
        {editingArticle && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl animate-slide-in">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white">تحرير المقال التقني</h2>
                <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">✕</button>
              </div>
              <form onSubmit={handleUpdateArticle} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">عنوان المقال</label>
                    <input 
                      required
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all" 
                      placeholder="مثلاً: مراجعة آيفون 15..." 
                      value={editingArticle.title} 
                      onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">التصنيف</label>
                    <select 
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all"
                      value={editingArticle.category}
                      onChange={e => setEditingArticle({...editingArticle, category: e.target.value as BlogCategory})}
                    >
                      {Object.values(BlogCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2">وصف مختصر</label>
                  <textarea 
                    required
                    className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all" 
                    placeholder="نبذة سريعة تظهر في الصفحة الرئيسية..." 
                    rows={2} 
                    value={editingArticle.excerpt} 
                    onChange={e => setEditingArticle({...editingArticle, excerpt: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2">المحتوى الكامل للمقال</label>
                  <textarea 
                    required
                    className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all" 
                    placeholder="اكتب تفاصيل المقال هنا..." 
                    rows={10} 
                    value={editingArticle.content} 
                    onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">رابط الصورة</label>
                    <input 
                      required
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all" 
                      placeholder="URL للصورة..." 
                      value={editingArticle.image} 
                      onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">وقت القراءة</label>
                    <input 
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all" 
                      placeholder="مثلاً: 5 دقائق" 
                      value={editingArticle.readTime} 
                      onChange={e => setEditingArticle({...editingArticle, readTime: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" className="flex-1 bg-emerald-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all">حفظ ونشر المقال</button>
                  <button type="button" onClick={() => setEditingArticle(null)} className="px-8 py-5 rounded-[24px] font-black border-2 border-slate-100 dark:border-slate-800 dark:text-white">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- الواجهة الرئيسية للمدونة ---
  return (
    <div className="min-h-screen flex flex-col text-right transition-colors duration-500 bg-[#FCF9F1] dark:bg-[#020617]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b dark:border-slate-800">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">A</div>
            <span className="text-2xl font-black tracking-tighter dark:text-white">ABDOUWEB</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setActiveCategory('All')} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeCategory === 'All' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الكل</button>
            {Object.values(BlogCategory).map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeCategory === c ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{c}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl dark:text-emerald-400 hover:scale-110 transition-all border border-transparent dark:border-white/5 shadow-sm">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button onClick={() => setIsAssistantOpen(true)} className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Featured Header */}
      {activeCategory === 'All' && articles[0] && (
        <header className="container mx-auto px-6 pt-8">
          <div onClick={() => setSelectedArticle(articles[0])} className="relative h-[600px] rounded-[50px] overflow-hidden cursor-pointer group shadow-2xl border-4 border-white dark:border-slate-800">
            <img src={articles[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
            <div className="absolute bottom-12 right-12 left-12">
              <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block shadow-xl">{articles[0].category}</span>
              <h1 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] max-w-4xl tracking-tighter">{articles[0].title}</h1>
              <div className="flex items-center gap-6 text-white/60 text-sm font-bold">
                <span>بواسطة {articles[0].author}</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>{articles[0].date}</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>{articles[0].readTime} قراءة</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Articles Grid */}
      <main className="container mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter dark:text-white">
            {activeCategory === 'All' ? 'آخر التحديثات التقنية' : activeCategory}
          </h2>
          <div className="h-1 flex-1 mx-12 bg-slate-200 dark:bg-slate-800 rounded-full hidden md:block"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredArticles.map(a => (
            <ArticleCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} />
          ))}
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t dark:border-slate-800 py-32 text-center transition-colors">
        <div className="flex items-center justify-center gap-4 mb-8">
           <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">A</div>
           <h2 className="text-4xl font-black dark:text-white tracking-widest uppercase">ABDOUWEB</h2>
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-lg max-w-xl mx-auto mb-16 leading-relaxed px-6">بوابتك الرقمية الأولى في المغرب لاكتشاف عالم التكنولوجيا، مراجعات الأجهزة، وأهم مستجدات الذكاء الاصطناعي.</p>
        
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setShowAdminAuth(true)} 
            className="text-[11px] font-black opacity-30 hover:opacity-100 dark:text-white transition-all uppercase tracking-[0.4em] hover:text-emerald-500"
          >
            بوابة الإدارة
          </button>
          <div className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
            © 2024 AbdouWeb Maroc. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Article Modal Reader */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-0 md:p-12 overflow-y-auto">
          <div className="bg-[#FCF9F1] dark:bg-slate-900 w-full max-w-6xl md:rounded-[60px] overflow-hidden shadow-2xl animate-slide-in relative my-auto min-h-screen md:min-h-0">
            <button 
              onClick={() => setSelectedArticle(null)} 
              className="fixed top-8 left-8 z-[110] bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform font-black text-xl"
            >✕</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-[400px] lg:h-auto relative">
                <img src={selectedArticle.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FCF9F1] dark:from-slate-900 via-transparent to-transparent hidden lg:block"></div>
              </div>
              <div className="p-10 md:p-20 lg:p-24 flex flex-col justify-center">
                <div className="flex gap-4 mb-10 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl w-fit">
                  <span>{selectedArticle.category}</span>
                  <span className="opacity-30">•</span>
                  <span>{selectedArticle.date}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-12 dark:text-white leading-[1.1] tracking-tighter">{selectedArticle.title}</h2>
                <div className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed space-y-8 whitespace-pre-line font-medium">
                  {selectedArticle.content}
                </div>
                <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-white text-xl">A</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الناشر</p>
                    <p className="text-lg font-black dark:text-white">{selectedArticle.author}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-6">
          <div className="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[80px] w-full max-w-md text-center shadow-2xl border-4 border-slate-50 dark:border-slate-800">
            <div className="w-24 h-24 bg-emerald-600 text-white rounded-[32px] flex items-center justify-center font-black text-5xl mx-auto mb-12 shadow-2xl shadow-emerald-500/20">A</div>
            <h2 className="text-3xl font-black mb-4 dark:text-white tracking-tighter">منطقة المحررين</h2>
            <p className="text-slate-400 font-bold text-sm mb-12">يرجى إدخال كلمة السر الخاصة بعبدو ويب</p>
            <div className="relative mb-10">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full border-b-4 border-slate-100 dark:border-slate-800 bg-transparent p-6 text-center text-4xl font-black dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-100 dark:placeholder:text-slate-800" 
                placeholder="••••••••"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginAdmin()}
                autoFocus
              />
              <button 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100"
              >
                {showPassword ? '👁️' : '🕶️'}
              </button>
            </div>
            <button 
              onClick={loginAdmin} 
              className="w-full bg-emerald-600 text-white py-6 rounded-[32px] font-black shadow-2xl shadow-emerald-500/20 hover:scale-[1.05] transition-all text-xl"
            >
              دخول آمن
            </button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-12 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] hover:text-red-500 transition-colors">إلغاء العملية</button>
          </div>
        </div>
      )}

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={[]} />
    </div>
  );
};

export default App;
