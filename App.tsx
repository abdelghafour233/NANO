
import React, { useState, useMemo, useEffect } from 'react';
import ArticleCard from './components/ArticleCard';
import AssistantModal from './components/AssistantModal';
import { ARTICLES as INITIAL_ARTICLES } from './constants';
import { Article, BlogCategory } from './types';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('abdouweb_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All'>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Site Settings State
  const [settings, setSettings] = useState({
    siteName: localStorage.getItem('sw_name') || 'ABDOUWEB',
    siteTagline: localStorage.getItem('sw_tagline') || 'المنصة المغربية رقم 1 في مراجعات التقنية والافلييت وتطوير المهارات الرقمية.',
    adsenseId: localStorage.getItem('adsense_id') || '',
    isAdsEnabled: localStorage.getItem('ads_enabled') === 'true',
    analyticsId: localStorage.getItem('analytics_id') || '',
    facebookUrl: localStorage.getItem('social_fb') || '',
    whatsappNumber: localStorage.getItem('social_wa') || '',
    footerText: localStorage.getItem('footer_text') || 'جميع الحقوق محفوظة لمدونة عبدو ويب 2024'
  });

  // Admin States
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [adminTab, setAdminTab] = useState<'articles' | 'settings'>('articles');

  useEffect(() => {
    localStorage.setItem('abdouweb_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const saveAllSettings = () => {
    localStorage.setItem('sw_name', settings.siteName);
    localStorage.setItem('sw_tagline', settings.siteTagline);
    localStorage.setItem('adsense_id', settings.adsenseId);
    localStorage.setItem('ads_enabled', String(settings.isAdsEnabled));
    localStorage.setItem('analytics_id', settings.analyticsId);
    localStorage.setItem('social_fb', settings.facebookUrl);
    localStorage.setItem('social_wa', settings.whatsappNumber);
    localStorage.setItem('footer_text', settings.footerText);
    alert('✅ تم تحديث إعدادات عبدو ويب بنجاح!');
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

  const deleteArticle = (id: string) => {
    if (window.confirm('هل تود حذف هذا المقال نهائياً؟')) {
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans text-right flex flex-col transition-colors duration-500" dir="rtl">
        <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-xl font-black dark:text-white uppercase tracking-tight">{settings.siteName} Admin</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">إدارة المنصة الشاملة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button onClick={() => setAdminTab('articles')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${adminTab === 'articles' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}>المقالات</button>
              <button onClick={() => setAdminTab('settings')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${adminTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}>الإعدادات</button>
            </nav>
            <button onClick={() => setIsAdmin(false)} className="bg-red-50 dark:bg-red-500/10 text-red-500 px-6 py-2 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">خروج</button>
          </div>
        </header>

        <main className="container mx-auto p-8">
          {adminTab === 'articles' ? (
            <div className="space-y-8 animate-slide-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white">إدارة المحتوى ({articles.length})</h2>
                <button 
                  onClick={() => setEditingArticle({
                    id: Date.now().toString(),
                    title: '', excerpt: '', content: '', author: 'عبدو ويب',
                    date: new Date().toLocaleDateString('ar-MA'), category: BlogCategory.TECH,
                    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200', readTime: '5 دقائق'
                  })}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20"
                >
                  + إضافة تدوينة
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map(a => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border dark:border-slate-800 group shadow-sm transition-transform hover:-translate-y-1">
                    <div className="relative h-40">
                      <img src={a.image} className="h-full w-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button onClick={() => setSelectedArticle(a)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition">👁️</button>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-[9px] font-black text-emerald-600 uppercase mb-2 block">{a.category}</span>
                      <h3 className="font-bold text-sm mb-6 line-clamp-2 dark:text-white">{a.title}</h3>
                      <div className="flex gap-2 pt-4 border-t dark:border-slate-800">
                        <button onClick={() => setEditingArticle(a)} className="flex-1 bg-slate-50 dark:bg-slate-800 py-3 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all">تعديل</button>
                        <button onClick={() => deleteArticle(a.id)} className="bg-red-50 dark:bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-12 animate-slide-in pb-20">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black dark:text-white">إعدادات المنصة</h2>
                <button onClick={saveAllSettings} className="bg-emerald-600 text-white px-10 py-4 rounded-[20px] font-black shadow-xl hover:scale-105 transition-all">حفظ الكل</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Branding Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🎨</span>
                    <h3 className="font-black dark:text-white">الهوية البصرية</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-1">اسم الموقع</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-emerald-500" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-1">الوصف المختصر</label>
                      <textarea rows={3} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-emerald-500" value={settings.siteTagline} onChange={e => setSettings({...settings, siteTagline: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* SEO & Analytics */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚀</span>
                    <h3 className="font-black dark:text-white">SEO والتحليلات</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-1">Google Analytics ID</label>
                      <input placeholder="G-XXXXXXXXXX" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-blue-500" value={settings.analyticsId} onChange={e => setSettings({...settings, analyticsId: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-1">نص التذييل (Copyright)</label>
                      <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-blue-500" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* AdSense Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <h3 className="font-black dark:text-white">Google AdSense</h3>
                    </div>
                    <button onClick={() => setSettings({...settings, isAdsEnabled: !settings.isAdsEnabled})} className={`w-12 h-6 rounded-full transition-all relative ${settings.isAdsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isAdsEnabled ? 'right-7' : 'right-1'}`} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase mr-1">Publisher ID</label>
                    <input placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-amber-500" value={settings.adsenseId} onChange={e => setSettings({...settings, adsenseId: e.target.value})} />
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📱</span>
                    <h3 className="font-black dark:text-white">روابط التواصل</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-1">صفحة فيسبوك</label>
                      <input placeholder="https://facebook.com/..." className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-blue-600" value={settings.facebookUrl} onChange={e => setSettings({...settings, facebookUrl: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-1">رقم واتساب</label>
                      <input placeholder="2126XXXXXXXX" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 ring-green-500" value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {editingArticle && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-in">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white">تحرير المحتوى</h2>
                <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
              </div>
              <form onSubmit={handleUpdateArticle} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <input required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white" placeholder="العنوان" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                <select className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white" value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value as BlogCategory})}>
                  {Object.values(BlogCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium dark:bg-slate-800 dark:text-white" placeholder="المحتوى" rows={8} value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
                <input required className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white" placeholder="رابط الصورة" value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} />
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg">تأكيد النشر</button>
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
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">A</div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">{settings.siteName}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setActiveCategory('All')} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeCategory === 'All' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الكل</button>
            {Object.values(BlogCategory).map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeCategory === c ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{c}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" className="hidden sm:flex w-10 h-10 items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">FB</a>
            )}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-xl">{isDarkMode ? '🌞' : '🌙'}</button>
            <button onClick={() => setIsAssistantOpen(true)} className="w-11 h-11 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">🤖</button>
          </div>
        </div>
      </nav>

      {settings.isAdsEnabled && settings.adsenseId && (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 text-center border-b dark:border-slate-800 animate-pulse">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إعلان من Google AdSense</p>
          <div className="h-20 bg-white dark:bg-slate-800 rounded-xl mt-2 flex items-center justify-center border border-dashed dark:border-slate-700">
             <span className="text-xs text-slate-400 font-bold italic">هنا تظهر أرباحك ({settings.adsenseId})</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-12 lg:py-20 flex-1">
        <div className="mb-16">
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter dark:text-white mb-6 animate-slide-in">
            {activeCategory === 'All' ? 'استكشف جديد التقنية' : activeCategory}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
            {settings.siteTagline}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map(a => (
            <ArticleCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} />
          ))}
        </div>
      </main>

      <footer className="bg-slate-50 dark:bg-[#020617] border-t dark:border-slate-800 py-20 text-center">
        <div className="mb-10 flex justify-center gap-6">
           {settings.whatsappNumber && <a href={`https://wa.me/${settings.whatsappNumber}`} className="text-emerald-500 font-bold">واتساب</a>}
           {settings.facebookUrl && <a href={settings.facebookUrl} className="text-blue-600 font-bold">فيسبوك</a>}
        </div>
        <h2 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-widest">{settings.siteName}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{settings.footerText}</p>
        <button onClick={() => setShowAdminAuth(true)} className="mt-8 text-[9px] font-bold opacity-10 hover:opacity-100 transition tracking-[0.4em] dark:text-white uppercase">Control Center</button>
      </footer>

      <ArticleReader />

      {showAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-6">
          <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[60px] w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto mb-10 shadow-emerald-500/50">A</div>
            <h2 className="text-2xl font-black mb-10 dark:text-white tracking-tighter uppercase">AbdouWeb Secure Login</h2>
            <div className="relative mb-10">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full border-b-4 border-slate-100 dark:border-slate-800 bg-transparent p-4 text-center text-3xl font-black dark:text-white outline-none focus:border-emerald-500" 
                placeholder="••••"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginAdmin()}
                autoFocus
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 opacity-40 hover:opacity-100 text-xl">{showPassword ? '👁️' : '🕶️'}</button>
            </div>
            <button onClick={loginAdmin} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">دخول</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-8 text-xs text-slate-400 font-black uppercase">إغلاق</button>
          </div>
        </div>
      )}

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={[]} />
    </div>
  );
};

export default App;
