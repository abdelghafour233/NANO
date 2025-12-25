
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

  const [settings, setSettings] = useState({
    siteName: localStorage.getItem('sw_name') || 'ABDOUWEB',
    siteTagline: localStorage.getItem('sw_tagline') || 'بوابة المغرب الأولى للتقنية والتحول الرقمي وتطوير الذات.',
    footerText: localStorage.getItem('footer_text') || '© 2024 جميع الحقوق محفوظة لمدونة عبدو ويب',
    adsenseCode: localStorage.getItem('adsense_code') || '',
    adsenseEnabled: localStorage.getItem('adsense_enabled') === 'true'
  });

  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('admin_password') || 'abdou2025');

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminTab, setAdminTab] = useState<'articles' | 'settings'>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New states for password change UI
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

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

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return articles;
    return articles.filter(a => a.category === activeCategory);
  }, [activeCategory, articles]);

  const featuredArticle = articles[0];

  const loginAdmin = () => {
    if (adminPassInput === adminPassword) {
      setIsAdmin(true);
      setShowAdminAuth(false);
      setAdminPassInput('');
      setShowPassword(false);
    } else {
      alert('كلمة السر خاطئة! حاول مجدداً.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // محاكاة تأخير بسيط للتغذية الراجعة البصرية
    await new Promise(resolve => setTimeout(resolve, 600));

    localStorage.setItem('sw_name', settings.siteName);
    localStorage.setItem('sw_tagline', settings.siteTagline);
    localStorage.setItem('footer_text', settings.footerText);
    localStorage.setItem('adsense_code', settings.adsenseCode);
    localStorage.setItem('adsense_enabled', String(settings.adsenseEnabled));
    
    if (newPass.trim()) {
      localStorage.setItem('admin_password', newPass);
      setAdminPassword(newPass);
      setNewPass('');
      alert('✅ تم تحديث الإعدادات وكلمة السر الجديدة بنجاح!');
    } else {
      alert('✅ تم حفظ كافة إعدادات الموقع بنجاح!');
    }
    
    setIsSaving(false);
  };

  const handleUpdateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    
    const exists = articles.find(a => a.id === editingArticle.id);
    if (exists) {
      setArticles(articles.map(a => a.id === editingArticle.id ? editingArticle : a));
    } else {
      setArticles([editingArticle, ...articles]);
    }
    setEditingArticle(null);
    alert('✅ تم تحديث المحتوى بنجاح!');
  };

  const deleteArticle = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال نهائياً؟')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const AdBanner = () => {
    if (!settings.adsenseEnabled || !settings.adsenseCode) return null;
    return (
      <div className="w-full my-12 p-4 bg-slate-100 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center min-h-[150px]">
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إعلان ممول</p>
          <div dangerouslySetInnerHTML={{ __html: settings.adsenseCode }} />
        </div>
      </div>
    );
  };

  const ArticleReader = () => (
    selectedArticle && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 lg:p-12 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl animate-reveal relative">
          <button 
            onClick={() => setSelectedArticle(null)} 
            className="absolute top-8 left-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white w-14 h-14 rounded-full flex items-center justify-center transition-all border border-white/10"
          >
            <span className="text-xl">✕</span>
          </button>
          
          <div className="flex flex-col lg:flex-row min-h-[80vh]">
            <div className="lg:w-2/5 h-64 lg:h-auto relative">
              <img src={selectedArticle.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-600/20 mix-blend-overlay"></div>
            </div>
            
            <div className="lg:w-3/5 p-8 lg:p-24 overflow-y-auto max-h-screen no-scrollbar">
              <div className="max-w-2xl">
                <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-2xl text-xs font-black uppercase mb-8">
                  {selectedArticle.category}
                </span>
                <h2 className="text-4xl lg:text-6xl font-black mb-12 dark:text-white leading-[1.15]">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 mb-16 pb-8 border-b border-slate-100 dark:border-white/5">
                   <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black uppercase">{settings.siteName.charAt(0)}</div>
                   <div>
                     <p className="text-sm font-black dark:text-white">{selectedArticle.author}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedArticle.date} • {selectedArticle.readTime}</p>
                   </div>
                </div>
                <div className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed space-y-8 whitespace-pre-line font-medium">
                  {selectedArticle.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans flex flex-col transition-colors duration-500" dir="rtl">
        <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 p-6 sticky top-0 z-50 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20 uppercase">{settings.siteName.charAt(0)}</div>
            <div>
               <h1 className="text-xl font-black dark:text-white">لوحة تحكم {settings.siteName}</h1>
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">نمط المشرف النشط</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button onClick={() => setAdminTab('articles')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${adminTab === 'articles' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}>المقالات</button>
              <button onClick={() => setAdminTab('settings')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${adminTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}>الإعدادات</button>
            </nav>
            <button onClick={() => setIsAdmin(false)} className="bg-red-50 dark:bg-red-500/10 text-red-500 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">خروج</button>
          </div>
        </header>

        <main className="container mx-auto p-8 max-w-6xl flex-1">
          {adminTab === 'articles' ? (
            <div className="space-y-8 animate-reveal">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black dark:text-white">إدارة المحتوى ({articles.length})</h2>
                <button 
                  onClick={() => setEditingArticle({
                    id: Date.now().toString(),
                    title: '', excerpt: '', content: '', author: settings.siteName,
                    date: new Date().toLocaleDateString('ar-MA'), category: BlogCategory.TECH,
                    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200', readTime: '5 دقائق'
                  })}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition"
                >
                  + إضافة تدوينة جديدة
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(a => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border dark:border-white/5 flex flex-col gap-4 shadow-sm group">
                    <img src={a.image} className="w-full h-32 object-cover rounded-[1.5rem]" />
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase mb-2 block">{a.category}</span>
                      <h3 className="font-bold dark:text-white line-clamp-1">{a.title}</h3>
                    </div>
                    <div className="flex gap-2 mt-auto pt-4 border-t dark:border-white/5">
                      <button onClick={() => setEditingArticle(a)} className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white py-3 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all">تعديل</button>
                      <button onClick={() => deleteArticle(a.id)} className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-12 animate-reveal pb-20">
              <h2 className="text-3xl font-black dark:text-white">إعدادات المنصة المتقدمة</h2>
              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-white/5">
                  <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                    <span className="text-emerald-500">🎨</span> الهوية العامة
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم الموقع</label>
                      <input 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white outline-none focus:ring-2 ring-emerald-500" 
                        value={settings.siteName} 
                        onChange={e => setSettings({...settings, siteName: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوصف الرئيسي</label>
                      <textarea 
                        required
                        rows={2} 
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white outline-none focus:ring-2 ring-emerald-500" 
                        value={settings.siteTagline} 
                        onChange={e => setSettings({...settings, siteTagline: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تغيير كلمة المرور</label>
                      <div className="relative">
                        <input 
                          type={showNewPass ? "text" : "password"} 
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white outline-none focus:ring-2 ring-emerald-500" 
                          placeholder="اتركه فارغاً لعدم التغيير" 
                          value={newPass} 
                          onChange={e => setNewPass(e.target.value)} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowNewPass(!showNewPass)} 
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {showNewPass ? '👁️' : '🙈'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-white/5">
                  <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                    <span className="text-yellow-500">💰</span> Google AdSense
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <span className="text-xs font-black dark:text-white">تفعيل الإعلانات</span>
                      <button 
                        type="button"
                        onClick={() => setSettings({...settings, adsenseEnabled: !settings.adsenseEnabled})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.adsenseEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.adsenseEnabled ? 'left-1' : 'left-7'}`} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كود الإعلان (Script)</label>
                      <textarea 
                        rows={6} 
                        className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-mono text-[10px] dark:text-emerald-400 outline-none focus:ring-2 ring-emerald-500" 
                        placeholder="الصق كود AdSense هنا..."
                        value={settings.adsenseCode} 
                        onChange={e => setSettings({...settings, adsenseCode: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className={`w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all text-lg flex items-center justify-center gap-4 ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الحفظ...
                      </>
                    ) : 'حفظ كافة الإعدادات وتحديث الموقع'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {editingArticle && (
          <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-reveal">
              <div className="p-8 border-b dark:border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white">تحرير المقال</h2>
                <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
              </div>
              <form onSubmit={handleUpdateArticle} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">العنوان</label>
                    <input required className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">التصنيف</label>
                    <select className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500" value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value as BlogCategory})}>
                      {Object.values(BlogCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">المحتوى</label>
                  <textarea required className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-medium dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500" rows={10} value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">رابط الصورة</label>
                  <input required className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500" value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl">نشر التغييرات</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-700">
      <nav className="sticky top-0 z-[100] glass-nav border-b border-slate-200/50 dark:border-white/5">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl group-hover:rotate-6 transition-transform shadow-lg shadow-emerald-500/20 uppercase">{settings.siteName.charAt(0)}</div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">{settings.siteName}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-[20px]">
            <button onClick={() => setActiveCategory('All')} className={`px-6 py-2.5 text-xs font-black rounded-[14px] transition-all ${activeCategory === 'All' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}>الكل</button>
            {Object.values(BlogCategory).map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-6 py-2.5 text-xs font-black rounded-[14px] transition-all ${activeCategory === c ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}>{c}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm text-xl">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button onClick={() => setIsAssistantOpen(true)} className="px-6 h-12 flex items-center gap-2 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">
               <span>🤖</span>
               <span className="hidden sm:inline">المساعد الذكي</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 lg:py-20 flex-1">
        {activeCategory === 'All' && featuredArticle && (
          <section className="mb-24 animate-reveal">
            <div onClick={() => setSelectedArticle(featuredArticle)} className="group relative h-[70vh] rounded-[4rem] overflow-hidden cursor-pointer shadow-3xl">
              <img src={featuredArticle.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/20 to-transparent"></div>
              <div className="absolute bottom-16 right-16 left-16">
                <div className="max-w-3xl">
                  <span className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase mb-6 inline-block">مقال مميز</span>
                  <h1 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">{featuredArticle.title}</h1>
                  <p className="text-xl text-slate-300 line-clamp-2 font-medium mb-10 max-w-2xl">{featuredArticle.excerpt}</p>
                  <div className="flex items-center gap-4 text-emerald-400 font-black uppercase tracking-widest text-sm">
                    <span>اقرأ الآن</span>
                    <div className="w-10 h-1 bg-emerald-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-between items-end mb-16 animate-reveal" style={{animationDelay: '0.2s'}}>
          <div>
            <h2 className="text-4xl lg:text-6xl font-black dark:text-white tracking-tighter mb-4">{activeCategory === 'All' ? 'أحدث التدوينات' : activeCategory}</h2>
            <div className="w-24 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <p className="hidden md:block text-slate-500 dark:text-slate-400 max-w-xs font-bold leading-relaxed text-sm">{settings.siteTagline}</p>
        </div>

        <AdBanner />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {filteredArticles.map((a, i) => (
            <div key={a.id} className="animate-reveal" style={{animationDelay: `${0.3 + (i * 0.1)}s`}}>
              <ArticleCard article={a} onClick={() => setSelectedArticle(a)} />
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 py-32 mt-20 text-center">
        <div className="container mx-auto px-6">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl mx-auto mb-10 shadow-2xl shadow-emerald-500/20 uppercase">{settings.siteName.charAt(0)}</div>
          <h2 className="text-3xl font-black mb-6 dark:text-white uppercase tracking-tighter">{settings.siteName}</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-md mx-auto mb-16 font-bold leading-relaxed">منصتك الأولى لمواكبة التطورات التقنية في المملكة المغربية والعالم العربي.</p>
          <div className="flex justify-center gap-12 mb-16">
            <a href="#" className="text-slate-400 hover:text-emerald-500 font-black transition-colors uppercase text-sm tracking-widest">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-emerald-500 font-black transition-colors uppercase text-sm tracking-widest">Facebook</a>
            <a href="#" className="text-slate-400 hover:text-emerald-500 font-black transition-colors uppercase text-sm tracking-widest">LinkedIn</a>
          </div>
          <p className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">{settings.footerText}</p>
          <button onClick={() => setShowAdminAuth(true)} className="mt-12 text-[10px] font-black text-slate-300 dark:text-slate-700 hover:text-emerald-500 transition-colors uppercase tracking-[0.3em]">Admin Dashboard</button>
        </div>
      </footer>

      {showAdminAuth && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-12 text-center shadow-2xl animate-reveal border dark:border-white/5">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto mb-10 shadow-xl shadow-emerald-500/30 uppercase">{settings.siteName.charAt(0)}</div>
            <h2 className="text-2xl font-black mb-10 dark:text-white uppercase tracking-tighter">منطقة المشرفين</h2>
            <div className="relative mb-10">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full bg-slate-50 dark:bg-slate-800 border-b-4 border-slate-100 dark:border-white/10 p-5 text-center text-3xl font-black dark:text-white outline-none focus:border-emerald-500 transition-all rounded-2xl" 
                placeholder="••••"
                value={adminPassInput}
                onChange={e => setAdminPassInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginAdmin()}
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={loginAdmin} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all">دخول</button>
              <button onClick={() => { setShowAdminAuth(false); setAdminPassInput(''); setShowPassword(false); }} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest py-2">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <ArticleReader />
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={[]} />
    </div>
  );
};

export default App;
