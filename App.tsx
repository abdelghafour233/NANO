
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
  const [adminTab, setAdminTab] = useState<'articles' | 'settings'>('articles');

  // AdSense States
  const [adsenseId, setAdsenseId] = useState(() => localStorage.getItem('adsense_id') || '');
  const [isAdsEnabled, setIsAdsEnabled] = useState(() => localStorage.getItem('ads_enabled') === 'true');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const saveSettings = () => {
    localStorage.setItem('adsense_id', adsenseId);
    localStorage.setItem('ads_enabled', String(isAdsEnabled));
    alert('تم حفظ الإعدادات بنجاح في عبدو ويب!');
  };

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
      alert('كلمة السر خاطئة! يرجى التأكد من الصلاحيات.');
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
    if (window.confirm('هل تود حذف هذا المقال نهائياً من عبدو ويب؟')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const ArticleReader = () => (
    selectedArticle && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 lg:p-12 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl animate-slide-in relative">
          <button onClick={() => setSelectedArticle(null)} className="absolute top-6 left-6 z-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-12 h-12 rounded-full shadow-xl font-black">✕</button>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <img src={selectedArticle.image} className="w-full h-80 lg:h-full object-cover" />
            <div className="p-10 lg:p-20 text-right">
              <span className="text-emerald-600 font-black text-xs uppercase mb-6 block">{selectedArticle.category}</span>
              <h2 className="text-3xl md:text-5xl font-black mb-10 dark:text-white leading-tight">{selectedArticle.title}</h2>
              <div className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed space-y-6 whitespace-pre-line font-medium">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-right flex flex-col transition-colors duration-500" dir="rtl">
        <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-xl font-black dark:text-white uppercase">AbdouWeb Dashboard</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">إدارة المحتوى والإعلانات</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button 
                onClick={() => setAdminTab('articles')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${adminTab === 'articles' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}
              >
                المقالات
              </button>
              <button 
                onClick={() => setAdminTab('settings')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${adminTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}
              >
                الإعدادات
              </button>
            </nav>
            <button 
              onClick={() => setIsAdmin(false)} 
              className="bg-red-50 dark:bg-red-500/10 text-red-500 px-6 py-2 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
            >
              خروج
            </button>
          </div>
        </header>

        <main className="container mx-auto p-8">
          {adminTab === 'articles' ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white">إدارة المقالات ({articles.length})</h2>
                <button 
                  onClick={() => setEditingArticle({
                    id: Date.now().toString(),
                    title: '',
                    excerpt: '',
                    content: '',
                    author: 'عبدو ويب',
                    date: new Date().toLocaleDateString('ar-MA'),
                    category: BlogCategory.TECH,
                    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
                    readTime: '5 دقائق'
                  })}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20"
                >
                  + مقال جديد
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map(a => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border dark:border-slate-800 group shadow-sm">
                    <div className="relative h-40">
                      <img src={a.image} className="h-full w-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button onClick={() => setSelectedArticle(a)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg" title="معاينة">👁️</button>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-[9px] font-black text-emerald-600 uppercase mb-2 block">{a.category}</span>
                      <h3 className="font-bold text-sm mb-6 line-clamp-2 dark:text-white">{a.title}</h3>
                      <div className="flex gap-2 pt-4 border-t dark:border-slate-800">
                        <button onClick={() => setEditingArticle(a)} className="flex-1 bg-slate-50 dark:bg-slate-800 py-3 rounded-xl text-xs font-black hover:bg-emerald-50 transition-colors">تعديل</button>
                        <button onClick={() => deleteArticle(a.id)} className="bg-red-50 dark:bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8 animate-slide-in">
              <h2 className="text-2xl font-black dark:text-white">إعدادات الموقع المتقدمة</h2>
              
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border dark:border-slate-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">💰</div>
                  <div>
                    <h3 className="font-black dark:text-white">Google AdSense</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">إدارة الأرباح والإعلانات</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="font-bold text-sm dark:text-white">تفعيل الإعلانات على الموقع</span>
                    <button 
                      onClick={() => setIsAdsEnabled(!isAdsEnabled)}
                      className={`w-14 h-8 rounded-full transition-all relative ${isAdsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isAdsEnabled ? 'right-7' : 'right-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 uppercase">AdSense Publisher ID</label>
                    <input 
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black dark:bg-slate-800 dark:text-white outline-none focus:border-amber-500 transition-all"
                      placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                      value={adsenseId}
                      onChange={(e) => setAdsenseId(e.target.value)}
                    />
                    <p className="text-[9px] text-slate-500 font-medium px-2 italic">أدخل معرف الناشر الخاص بك من حساب AdSense لتفعيل شفرات الإعلانات التلقائية.</p>
                  </div>

                  <button 
                    onClick={saveSettings}
                    className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all"
                  >
                    حفظ كافة الإعدادات
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[32px] border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-black text-blue-900 dark:text-blue-400 mb-2">تلميح تقني 💡</h4>
                <p className="text-sm text-blue-800/70 dark:text-blue-400/70 leading-relaxed font-medium">عند تفعيل AdSense، سيقوم نظام "عبدو ويب" تلقائياً بحقن الشفرة البرمجية بين المقالات وفي الجوانب لزيادة نسبة النقر إلى الظهور (CTR).</p>
              </div>
            </div>
          )}
        </main>

        {editingArticle && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-in">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white">تحرير محتوى عبدو ويب</h2>
                <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
              </div>
              <form onSubmit={handleUpdateArticle} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <input required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white" placeholder="عنوان المقال" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                  <select className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white" value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value as BlogCategory})}>
                    {Object.values(BlogCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <textarea required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium dark:bg-slate-800 dark:text-white" placeholder="نبذة مختصرة" rows={2} value={editingArticle.excerpt} onChange={e => setEditingArticle({...editingArticle, excerpt: e.target.value})} />
                <textarea required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium dark:bg-slate-800 dark:text-white" placeholder="محتوى المقال" rows={10} value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
                <input required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white" placeholder="رابط الصورة" value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} />
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg">نشر التحديث</button>
              </form>
            </div>
          </div>
        )}
        <ArticleReader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-right transition-colors duration-500 bg-white dark:bg-[#020617]">
      <nav className="sticky top-0 z-50 glass-nav border-b dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xl group-hover:rotate-12 transition-transform">A</div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">ABDOUWEB</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setActiveCategory('All')} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeCategory === 'All' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الكل</button>
            {Object.values(BlogCategory).map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeCategory === c ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{c}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button onClick={() => setIsAssistantOpen(true)} className="w-11 h-11 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {isAdsEnabled && adsenseId && (
        <div className="bg-slate-100 dark:bg-slate-900 p-4 text-center border-b dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إعلان ممول - Google AdSense</p>
          {/* محاكاة مكان الإعلان */}
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
             <span className="text-xs text-slate-400 font-bold">مكان الإعلان (Pub ID: {adsenseId})</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-12 lg:py-20 flex-1">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl lg:text-5xl font-black tracking-tighter dark:text-white">
            {activeCategory === 'All' ? 'أحدث المقالات' : activeCategory}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map(a => (
            <ArticleCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} />
          ))}
        </div>
      </main>

      <footer className="bg-slate-50 dark:bg-[#020617] border-t dark:border-slate-800 py-16 text-center">
        <h2 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-widest">ABDOUWEB</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">المنصة المغربية رقم 1 في مراجعات التقنية والافلييت وتطوير المهارات الرقمية.</p>
        <button onClick={() => setShowAdminAuth(true)} className="text-[9px] font-bold opacity-20 hover:opacity-100 transition tracking-[0.3em] dark:text-white uppercase">بوابة التحكم</button>
      </footer>

      <ArticleReader />

      {showAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-6">
          <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[60px] w-full max-w-sm text-center">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto mb-10">A</div>
            <h2 className="text-2xl font-black mb-10 dark:text-white tracking-tighter uppercase">AbdouWeb Access</h2>
            <div className="relative mb-10">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full border-b-4 border-slate-100 dark:border-slate-800 bg-transparent p-4 text-center text-3xl font-black dark:text-white outline-none focus:border-emerald-500" 
                placeholder="••••••••"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginAdmin()}
                autoFocus
              />
              <button 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all text-xl"
                title="رؤية ما كتبت"
              >
                {showPassword ? '👁️' : '🕶️'}
              </button>
            </div>
            <button onClick={loginAdmin} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">تحقق</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-8 text-xs text-slate-400 font-black uppercase">إلغاء</button>
          </div>
        </div>
      )}

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={[]} />
    </div>
  );
};

export default App;
