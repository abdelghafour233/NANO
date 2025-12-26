
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ArticleCard from './components/ArticleCard';
import AssistantModal from './components/AssistantModal';
import { ARTICLES as INITIAL_ARTICLES } from './constants';
import { Article, BlogCategory } from './types';

const App: React.FC = () => {
  // --- 1. حالة البيانات (Data State) ---
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('abdouweb_articles_v2');
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  const [settings, setSettings] = useState({
    siteName: localStorage.getItem('sw_name') || 'ABDOUWEB',
    siteTagline: localStorage.getItem('sw_tagline') || 'بوابة المغرب الأولى للتقنية والتحول الرقمي وتطوير الذات.',
    footerText: localStorage.getItem('footer_text') || '© 2024 جميع الحقوق محفوظة لمدونة عبدو ويب',
    adsenseCode: localStorage.getItem('adsense_code') || '',
    adsenseEnabled: localStorage.getItem('adsense_enabled') === 'true'
  });

  // --- 2. حالة النظام (System State) ---
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('admin_password') || 'abdou2025');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminTab, setAdminTab] = useState<'articles' | 'settings'>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All'>('All');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [newPass, setNewPass] = useState('');

  // --- 3. تحسين السيو والأرشفة (SEO & Performance) ---
  useEffect(() => {
    localStorage.setItem('abdouweb_articles_v2', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // تحديث الميتا تاقز ديناميكياً للسيو
  useEffect(() => {
    if (selectedArticle) {
      document.title = `${selectedArticle.title} | ${settings.siteName}`;
      updateMetaTag('description', selectedArticle.excerpt);
      updateMetaTag('og:title', selectedArticle.title);
      updateMetaTag('og:description', selectedArticle.excerpt);
      updateMetaTag('og:image', selectedArticle.image);
    } else {
      document.title = `${settings.siteName} | ${settings.siteTagline}`;
      updateMetaTag('description', settings.siteTagline);
    }
  }, [selectedArticle, settings]);

  const updateMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (tag) {
      tag.setAttribute('content', content);
    }
  };

  // --- 4. وظائف التحكم (Admin Logic) ---
  const handleLogin = () => {
    if (adminPassInput === adminPassword) {
      setIsAdmin(true);
      setShowAdminAuth(false);
      setAdminPassInput('');
    } else {
      alert('⚠️ كلمة السر غير صحيحة!');
    }
  };

  const saveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800)); // مظهر احترافي

    localStorage.setItem('sw_name', settings.siteName);
    localStorage.setItem('sw_tagline', settings.siteTagline);
    localStorage.setItem('footer_text', settings.footerText);
    localStorage.setItem('adsense_code', settings.adsenseCode);
    localStorage.setItem('adsense_enabled', String(settings.adsenseEnabled));
    
    if (newPass.trim()) {
      localStorage.setItem('admin_password', newPass);
      setAdminPassword(newPass);
      setNewPass('');
    }
    
    setIsSaving(false);
    alert('✅ تم حفظ التعديلات وتحديث الموقع فوراً!');
  };

  const handleUpdateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    
    const isNew = !articles.find(a => a.id === editingArticle.id);
    if (isNew) {
      setArticles([editingArticle, ...articles]);
    } else {
      setArticles(articles.map(a => a.id === editingArticle.id ? editingArticle : a));
    }
    setEditingArticle(null);
    alert('✅ تم النشر بنجاح!');
  };

  const deleteArticle = useCallback((id: string) => {
    if (window.confirm('🗑️ هل تريد حذف هذا المقال نهائياً من قاعدة البيانات؟')) {
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  }, []);

  const filteredArticles = useMemo(() => {
    return activeCategory === 'All' 
      ? articles 
      : articles.filter(a => a.category === activeCategory);
  }, [activeCategory, articles]);

  const featuredArticle = articles[0];

  // --- 5. المكونات الفرعية (Sub-components) ---
  const AdminView = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col font-sans" dir="rtl">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 p-6 sticky top-0 z-[100] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{settings.siteName.charAt(0)}</div>
          <h1 className="text-xl font-black dark:text-white">لوحة تحكم {settings.siteName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button onClick={() => setAdminTab('articles')} className={`px-6 py-2 rounded-xl text-xs font-black transition ${adminTab === 'articles' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}>المقالات</button>
            <button onClick={() => setAdminTab('settings')} className={`px-6 py-2 rounded-xl text-xs font-black transition ${adminTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow-sm dark:text-white' : 'text-slate-400'}`}>الإعدادات</button>
          </nav>
          <button onClick={() => setIsAdmin(false)} className="bg-red-500 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-red-600">خروج</button>
        </div>
      </header>

      <main className="container mx-auto p-8 max-w-6xl">
        {adminTab === 'articles' ? (
          <div className="space-y-8 animate-reveal">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black dark:text-white">إدارة المحتوى ({articles.length})</h2>
              <button onClick={() => setEditingArticle({ id: Date.now().toString(), title: '', excerpt: '', content: '', author: settings.siteName, date: new Date().toLocaleDateString('ar-MA'), category: BlogCategory.TECH, image: '', readTime: '5 دقائق' })} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl">+ إضافة تدوينة</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => (
                <div key={a.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border dark:border-white/5 flex flex-col shadow-sm">
                  <img src={a.image || 'https://via.placeholder.com/400x200'} className="w-full h-36 object-cover rounded-[1.5rem] mb-4" />
                  <h3 className="font-bold dark:text-white line-clamp-1 mb-4">{a.title || 'بدون عنوان'}</h3>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => setEditingArticle(a)} className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white py-3 rounded-xl text-xs font-black">تعديل</button>
                    <button onClick={() => deleteArticle(a.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 animate-reveal">
            <form onSubmit={saveAllSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-white/5 space-y-6">
                <h3 className="font-black dark:text-white text-lg">🎨 الهوية</h3>
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} placeholder="اسم الموقع" />
                <textarea rows={2} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white" value={settings.siteTagline} onChange={e => setSettings({...settings, siteTagline: e.target.value})} placeholder="وصف الموقع" />
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold dark:text-white" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="تغيير كلمة السر..." type="password" />
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-white/5 space-y-6">
                <h3 className="font-black dark:text-white text-lg">💰 الإعلانات</h3>
                <button type="button" onClick={() => setSettings({...settings, adsenseEnabled: !settings.adsenseEnabled})} className={`w-full p-4 rounded-xl font-black transition ${settings.adsenseEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {settings.adsenseEnabled ? 'الإعلانات: مفعلة ✅' : 'الإعلانات: معطلة ❌'}
                </button>
                <textarea rows={5} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-mono text-[10px] dark:text-emerald-400" value={settings.adsenseCode} onChange={e => setSettings({...settings, adsenseCode: e.target.value})} placeholder="<script>...</script>" />
              </div>
              <button type="submit" disabled={isSaving} className="md:col-span-2 w-full bg-emerald-600 text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl disabled:opacity-50">
                {isSaving ? 'جاري الحفظ...' : 'حفظ كافة الإعدادات'}
              </button>
            </form>
          </div>
        )}
      </main>

      {editingArticle && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-reveal">
            <div className="p-8 border-b dark:border-white/5 flex justify-between items-center bg-emerald-600/5">
              <h2 className="text-2xl font-black dark:text-white">تعديل المقال</h2>
              <button onClick={() => setEditingArticle(null)} className="text-3xl text-slate-400">✕</button>
            </div>
            <form onSubmit={handleUpdateArticle} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input required className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold dark:bg-slate-800" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} placeholder="العنوان" />
                <select className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold dark:bg-slate-800" value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value as BlogCategory})}>
                  {Object.values(BlogCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input required className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-mono text-xs dark:bg-slate-800" value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} placeholder="رابط الصورة" />
                <textarea rows={2} className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-medium dark:bg-slate-800" value={editingArticle.excerpt} onChange={e => setEditingArticle({...editingArticle, excerpt: e.target.value})} placeholder="وصف مختصر للسيو" />
              </div>
              <textarea required className="w-full border-2 border-slate-100 dark:border-white/5 rounded-2xl p-5 font-medium dark:bg-slate-800" rows={10} value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} placeholder="المحتوى الكامل للمقال" />
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl">تأكيد ونشر</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isAdmin) return <AdminView />;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-700">
      {/* نافذة القراءة */}
      {selectedArticle && (
        <article className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 lg:p-12 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl animate-reveal relative">
            <button onClick={() => setSelectedArticle(null)} className="absolute top-8 left-8 z-50 bg-white/10 text-white w-14 h-14 rounded-full flex items-center justify-center">✕</button>
            <div className="flex flex-col lg:flex-row min-h-[80vh]">
              <div className="lg:w-2/5 h-64 lg:h-auto">
                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
              </div>
              <div className="lg:w-3/5 p-8 lg:p-24 overflow-y-auto text-right">
                <div className="max-w-2xl ml-auto">
                  <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-2xl text-xs font-black mb-8">{selectedArticle.category}</span>
                  <h2 className="text-4xl lg:text-6xl font-black mb-12 dark:text-white">{selectedArticle.title}</h2>
                  <div className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">{selectedArticle.content}</div>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* الناف بار */}
      <nav className="sticky top-0 z-[100] glass-nav border-b border-slate-200/50 dark:border-white/5">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg uppercase">{settings.siteName.charAt(0)}</div>
            <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">{settings.siteName}</span>
          </div>
          <div className="hidden lg:flex bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-[20px]">
            <button onClick={() => setActiveCategory('All')} className={`px-6 py-2.5 text-xs font-black rounded-[14px] transition-all ${activeCategory === 'All' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}>الكل</button>
            {Object.values(BlogCategory).map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-6 py-2.5 text-xs font-black rounded-[14px] transition-all ${activeCategory === c ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xl hover:scale-110 transition-all">{isDarkMode ? '🌞' : '🌙'}</button>
            <button onClick={() => setIsAssistantOpen(true)} className="px-6 h-12 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20">🤖 المساعد</button>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-6 py-12 lg:py-20 flex-1">
        {activeCategory === 'All' && featuredArticle && (
          <section className="mb-24 animate-reveal">
            <div onClick={() => setSelectedArticle(featuredArticle)} className="group relative h-[70vh] rounded-[4rem] overflow-hidden cursor-pointer shadow-3xl">
              <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/20 to-transparent"></div>
              <div className="absolute bottom-16 right-16 left-16 text-right">
                <span className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black mb-6 inline-block">مقال مميز</span>
                <h1 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">{featuredArticle.title}</h1>
                <p className="text-xl text-slate-300 line-clamp-2 mb-10 max-w-2xl ml-auto">{featuredArticle.excerpt}</p>
                <div className="flex items-center gap-4 text-emerald-400 font-black justify-end">
                   <span>اقرأ الآن</span>
                   <div className="w-10 h-1 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-between items-end mb-16 animate-reveal">
          <div className="text-right w-full">
            <h2 className="text-4xl lg:text-6xl font-black dark:text-white tracking-tighter">{activeCategory === 'All' ? 'أحدث التدوينات' : activeCategory}</h2>
            <div className="w-24 h-2 bg-emerald-500 rounded-full mt-4 ml-auto mr-0"></div>
          </div>
        </div>

        {settings.adsenseEnabled && settings.adsenseCode && (
           <div className="w-full my-12 p-4 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center min-h-[150px]" dangerouslySetInnerHTML={{ __html: settings.adsenseCode }} />
        )}
        
        <div className="article-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {filteredArticles.map((a, i) => (
            <div key={a.id} className="animate-reveal" style={{animationDelay: `${i * 0.1}s`}}>
              <ArticleCard article={a} onClick={() => setSelectedArticle(a)} />
            </div>
          ))}
        </div>
      </main>

      {/* الفوتر */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 py-24 text-center">
        <div className="container mx-auto px-6">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl mx-auto mb-10 shadow-2xl uppercase">{settings.siteName.charAt(0)}</div>
          <h2 className="text-3xl font-black mb-6 dark:text-white uppercase tracking-tighter">{settings.siteName}</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-md mx-auto mb-16 font-bold">{settings.siteTagline}</p>
          <p className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">{settings.footerText}</p>
          <button onClick={() => setShowAdminAuth(true)} className="mt-12 text-[10px] font-black text-slate-300 dark:text-slate-700 hover:text-emerald-500 transition-colors uppercase">Admin Dashboard</button>
        </div>
      </footer>

      {/* مودال الدخول للأدمن */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-12 text-center shadow-2xl animate-reveal border dark:border-white/5">
            <h2 className="text-2xl font-black mb-10 dark:text-white">منطقة المشرفين</h2>
            <div className="relative mb-10">
              <input type={showPassword ? "text" : "password"} className="w-full bg-slate-50 dark:bg-slate-800 border-b-4 border-slate-100 dark:border-white/10 p-5 text-center text-3xl font-black dark:text-white outline-none focus:border-emerald-500 rounded-2xl" placeholder="••••" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? '👁️' : '🙈'}</button>
            </div>
            <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 transition-all">دخول</button>
            <button onClick={() => setShowAdminAuth(false)} className="mt-4 w-full text-slate-400 font-bold text-xs uppercase">إلغاء</button>
          </div>
        </div>
      )}

      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} cartItems={[]} />
    </div>
  );
};

export default App;
