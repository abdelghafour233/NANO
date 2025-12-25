
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  isTrending?: boolean;
}

interface AdSettings {
  isEnabled: boolean;
  publisherId: string;
  headerSlotId: string;
  sidebarSlotId: string;
  articleBottomSlotId: string;
}

const CATEGORIES = ['الكل', 'أخبار المغرب التقنية', 'تطوير الذات', 'مراجعات المنتجات', 'برمجة وذكاء اصطناعي'];

const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'المغرب يستعد لإطلاق أول منطقة تجارة حرة رقمية بالكامل',
    excerpt: 'مشروع ضخم في الدار البيضاء يهدف لاستقطاب عمالقة التكنولوجيا العالميين وتسهيل الاستثمار في القطاع الرقمي.',
    content: 'في خطوة استراتيجية نحو تعزيز السيادة الرقمية، أعلنت السلطات المغربية عن ملامح منطقة التجارة الحرة الرقمية الجديدة. المشروع سيوفر بنية تحتية من الجيل الخامس وتسهيلات ضريبية للمقاولات الناشئة المبتكرة. يتوقع الخبراء أن تساهم هذه الخطوة في خلق آلاف فرص الشغل للشباب المطورين المغاربة...',
    author: 'عبدو ويب',
    date: '25 ماي 2024',
    category: 'أخبار المغرب التقنية',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800',
    readTime: '4 دقائق',
    isTrending: true
  },
  {
    id: '2',
    title: '5 عادات صباحية غيرت مساري كمهندس برمجيات',
    excerpt: 'تطوير الذات يبدأ من الصباح. كيف تبرمج عقلك على النجاح والتركيز الفائق في عالم مليء بالمشتتات.',
    content: 'الانضباط الذاتي هو الوقود الذي يحرك الموهبة. بدأت بتطبيق تقنية "العمل العميق" (Deep Work) لمدة ساعتين كل صباح قبل تفقد البريد الإلكتروني. النتائج كانت مذهلة على مستوى الإنتاجية وجودة الكود. في هذا المقال أشارككم روتيني اليومي الذي ساعدني على التوازن بين العمل والحياة...',
    author: 'عبدو',
    date: '23 ماي 2024',
    category: 'تطوير الذات',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800',
    readTime: '6 دقائق'
  }
];

const App = () => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [category, setCategory] = useState('الكل');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Site Settings & AdSense
  const [ads, setAds] = useState<AdSettings>({
    isEnabled: true,
    publisherId: 'ca-pub-xxxxxxxxxxxxxxxx',
    headerSlotId: '1234567890',
    sidebarSlotId: '0987654321',
    articleBottomSlotId: '1122334455'
  });

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminTab, setAdminTab] = useState<'overview' | 'articles' | 'ads' | 'settings'>('overview');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // AI Chat
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'مرحباً بك في عبدو ويب! أنا مساعدك الشخصي. هل تريد نصيحة في تطوير الذات، أو سؤالاً عن أحدث المنتجات التقنية، أو معرفة أخبار التقنية في المغرب؟' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const filteredPosts = useMemo(() => 
    category === 'الكل' ? posts : posts.filter(p => p.category === category)
  , [category, posts]);

  const trendingPost = useMemo(() => posts.find(p => p.isTrending) || posts[0], [posts]);

  const handleAdminLogin = () => {
    if (adminPass === 'abdou2025') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPass('');
    } else {
      alert('كلمة السر خاطئة!');
    }
  };

  const handleUpdatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (posts.find(p => p.id === editingPost.id)) {
        setPosts(posts.map(p => p.id === editingPost.id ? editingPost : p));
    } else {
        setPosts([editingPost, ...posts]);
    }
    setEditingPost(null);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت خبير تقني ومستشار تطوير ذات لمدونة "عبدو ويب". أجب بلهجة مغربية عصرية أو عربية بيضاء: ${msg}`
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، هناك ضغط على المساعد حالياً.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Ad Placeholder Component ---
  const AdPlaceholder = ({ type, slotId }: { type: string, slotId: string }) => {
    if (!ads.isEnabled) return null;
    return (
      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 my-8 text-center flex flex-col items-center justify-center min-h-[120px]">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">إعلان Google AdSense</span>
        <div className="text-xs text-slate-500 italic">Slot ID: {slotId}</div>
      </div>
    );
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-right flex flex-col text-slate-900" dir="rtl">
        {/* Sidebar Nav */}
        <div className="flex flex-1">
          <aside className="w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col border-l border-white/10">
            <h1 className="text-2xl font-black text-cyan-400 mb-12">لوحة عبدو ويب</h1>
            <nav className="space-y-2 flex-1">
              {[
                { id: 'overview', label: 'الإحصائيات', icon: '📊' },
                { id: 'articles', label: 'المقالات', icon: '📝' },
                { id: 'ads', label: 'إعدادات AdSense', icon: '💰' },
                { id: 'settings', label: 'الإعدادات العامة', icon: '⚙️' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${adminTab === tab.id ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <button onClick={() => setIsAdmin(false)} className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition">خروج آمن</button>
          </aside>

          <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
            <header className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-black text-slate-900">
                {adminTab === 'overview' && 'نظرة عامة'}
                {adminTab === 'articles' && 'إدارة المقالات'}
                {adminTab === 'ads' && 'تحقيق الربح - AdSense'}
                {adminTab === 'settings' && 'إعدادات الموقع'}
              </h2>
              {adminTab === 'articles' && (
                <button 
                  onClick={() => setEditingPost({ id: Date.now().toString(), title: '', excerpt: '', content: '', author: 'عبدو', date: new Date().toLocaleDateString('ar-MA'), category: 'أخبار المغرب التقنية', image: '', readTime: '5 دقائق' })} 
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 shadow-xl transition"
                >+ مقال جديد</button>
              )}
            </header>

            {adminTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">إجمالي المقالات</div>
                  <div className="text-5xl font-black text-slate-900">{posts.length}</div>
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">حالة الإعلانات</div>
                  <div className={`text-2xl font-black ${ads.isEnabled ? 'text-emerald-500' : 'text-red-500'}`}>{ads.isEnabled ? 'نشطة ومتوفرة' : 'متوقفة حالياً'}</div>
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">المساعد الذكي</div>
                  <div className="text-2xl font-black text-indigo-500">متصل وجاهز (Gemini)</div>
                </div>
              </div>
            )}

            {adminTab === 'articles' && (
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-6">المقال</th>
                      <th className="p-6">التصنيف</th>
                      <th className="p-6">التاريخ</th>
                      <th className="p-6 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {posts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-6">
                            <div className="font-black text-slate-800">{p.title}</div>
                            <div className="text-xs text-slate-400 truncate max-w-xs">{p.excerpt}</div>
                        </td>
                        <td className="p-6 text-sm font-bold text-cyan-600">{p.category}</td>
                        <td className="p-6 text-xs font-medium text-slate-400">{p.date}</td>
                        <td className="p-6 text-left space-x-2 space-x-reverse">
                          <button onClick={() => setEditingPost(p)} className="p-3 text-indigo-500 hover:bg-indigo-50 rounded-xl transition">تعديل</button>
                          <button onClick={() => setPosts(posts.filter(x => x.id !== p.id))} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition">حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'ads' && (
              <div className="max-w-2xl bg-white p-12 rounded-[50px] shadow-sm border border-slate-100 space-y-10">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <div>
                    <h4 className="font-black text-lg">تفعيل Google AdSense</h4>
                    <p className="text-xs text-slate-400 font-medium">تحكم في ظهور الإعلانات في جميع أنحاء الموقع</p>
                   </div>
                   <button 
                    onClick={() => setAds({...ads, isEnabled: !ads.isEnabled})}
                    className={`w-16 h-8 rounded-full transition-all relative ${ads.isEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                   >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${ads.isEnabled ? 'right-9' : 'right-1'}`} />
                   </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Publisher ID (معرف الناشر)</label>
                        <input className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-cyan-500" value={ads.publisherId} onChange={e => setAds({...ads, publisherId: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Header Ad Slot</label>
                            <input className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-cyan-500" value={ads.headerSlotId} onChange={e => setAds({...ads, headerSlotId: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Sidebar Ad Slot</label>
                            <input className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-cyan-500" value={ads.sidebarSlotId} onChange={e => setAds({...ads, sidebarSlotId: e.target.value})} />
                        </div>
                    </div>
                </div>
                <button onClick={() => alert('تم حفظ إعدادات AdSense')} className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black text-lg shadow-xl shadow-slate-200">حفظ الإعدادات</button>
              </div>
            )}
          </main>
        </div>

        {/* Modal Editor */}
        {editingPost && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
            <div className="bg-white w-full max-w-3xl rounded-[50px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xl font-black">تحرير محتوى عبدو ويب</h3>
                <button onClick={() => setEditingPost(null)} className="text-2xl opacity-50 hover:opacity-100 transition">✕</button>
              </div>
              <form onSubmit={handleUpdatePost} className="p-10 space-y-6 overflow-y-auto flex-1 no-scrollbar">
                <input required className="w-full border-b-2 border-slate-100 p-4 text-2xl font-black outline-none focus:border-cyan-500" value={editingPost.title} placeholder="عنوان المقال.." onChange={e => setEditingPost({...editingPost, title: e.target.value})} />
                <textarea required className="w-full border-2 border-slate-50 rounded-3xl p-6 font-bold h-24 outline-cyan-500 bg-slate-50/50" value={editingPost.excerpt} placeholder="نبذة مختصرة تظهر في الواجهة الرئيسية" onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} />
                <textarea required className="w-full border-2 border-slate-50 rounded-3xl p-6 font-medium h-96 outline-cyan-500 bg-slate-50/50 leading-relaxed" value={editingPost.content} placeholder="اكتب المقال بالكامل هنا.. استخدم لغة جذابة" onChange={e => setEditingPost({...editingPost, content: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <select className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold" value={editingPost.category} onChange={e => setEditingPost({...editingPost, category: e.target.value})}>
                      {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold" value={editingPost.image} placeholder="رابط الصورة (URL)" onChange={e => setEditingPost({...editingPost, image: e.target.value})} />
                </div>
              </form>
              <div className="p-8 border-t border-slate-100 flex gap-4">
                  <button onClick={handleUpdatePost} className="flex-1 bg-cyan-500 text-slate-950 py-5 rounded-3xl font-black text-xl hover:bg-cyan-400 shadow-xl shadow-cyan-500/10">نشر التعديلات</button>
                  <button onClick={() => setEditingPost(null)} className="px-10 py-5 rounded-3xl font-black text-slate-400 hover:text-slate-600 transition">إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 text-right overflow-x-hidden font-sans" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0b0e14]/95 backdrop-blur-2xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => setCategory('الكل')}
            className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter cursor-pointer"
          >
            abdouweb
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex gap-10 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <button onClick={() => setCategory('أخبار المغرب التقنية')} className={`hover:text-cyan-400 transition ${category === 'أخبار المغرب التقنية' ? 'text-cyan-400' : ''}`}>أخبار التقنية</button>
              <button onClick={() => setCategory('تطوير الذات')} className={`hover:text-cyan-400 transition ${category === 'تطوير الذات' ? 'text-cyan-400' : ''}`}>تطوير الذات</button>
              <button onClick={() => setCategory('مراجعات المنتجات')} className={`hover:text-cyan-400 transition ${category === 'مراجعات المنتجات' ? 'text-cyan-400' : ''}`}>المراجعات</button>
            </div>
            <button onClick={() => setIsAiOpen(true)} className="bg-white/5 text-cyan-400 px-6 py-2.5 rounded-full text-[10px] font-black border border-cyan-500/20 hover:bg-cyan-500/10 transition">🤖 مساعد ذكي</button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      {category === 'الكل' && trendingPost && (
        <section className="container mx-auto px-6 pt-10 pb-6">
            <div 
                onClick={() => setSelectedPost(trendingPost)}
                className="relative h-[550px] w-full rounded-[60px] overflow-hidden cursor-pointer group shadow-2xl border border-white/5"
            >
                <img src={trendingPost.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-50" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-16 right-16 left-16 max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="bg-cyan-500 text-slate-950 text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em]">عاجل وحصري</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{trendingPost.date}</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter group-hover:text-cyan-400 transition-colors">{trendingPost.title}</h2>
                    <p className="text-slate-300 text-xl opacity-70 line-clamp-2 max-w-3xl leading-relaxed">{trendingPost.excerpt}</p>
                </div>
            </div>
        </section>
      )}

      {/* AdSense Top */}
      <div className="container mx-auto px-6">
        <AdPlaceholder type="header" slotId={ads.headerSlotId} />
      </div>

      {/* Grid Content */}
      <main className="container mx-auto px-6 pb-40">
        <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-10">
            <h2 className="text-4xl font-black tracking-tighter">آخر الاستكشافات</h2>
            <div className="flex gap-4">
              {CATEGORIES.slice(0, 3).map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full border transition ${category === c ? 'bg-white text-slate-950 border-white' : 'border-white/10 text-slate-500 hover:text-white'}`}>{c}</button>
              ))}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {filteredPosts.map((p, idx) => (
            <article key={p.id} onClick={() => setSelectedPost(p)} className="group flex flex-col cursor-pointer animate-slide-in">
              <div className="aspect-[1.2] rounded-[50px] overflow-hidden mb-10 border border-white/5 relative bg-slate-900 shadow-xl">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100" alt="" />
                <div className="absolute bottom-8 right-8">
                    <span className="bg-slate-950/80 backdrop-blur-xl text-white border border-white/10 px-5 py-2.5 rounded-3xl text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                </div>
              </div>
              <div className="px-2">
                <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                    <span>{p.date}</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    <span>{p.readTime}</span>
                </div>
                <h3 className="text-3xl font-black mb-6 leading-tight group-hover:text-cyan-400 transition-colors tracking-tight">{p.title}</h3>
                <p className="text-slate-400 text-base leading-[1.8] line-clamp-3 opacity-60 group-hover:opacity-100 transition-opacity font-medium">{p.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-4 md:p-12">
            <div className="bg-[#0b0e14] w-full max-w-6xl h-full rounded-[60px] border border-white/5 shadow-2xl overflow-hidden animate-slide-in flex flex-col">
                <div className="p-10 md:p-16 border-b border-white/5 flex justify-between items-start bg-[#0b0e14]/50">
                    <div className="max-w-4xl">
                        <span className="text-cyan-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 block">في قسم {selectedPost.category}</span>
                        <h2 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter">{selectedPost.title}</h2>
                    </div>
                    <button onClick={() => setSelectedPost(null)} className="text-5xl text-slate-700 hover:text-white transition-all p-4">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-16 no-scrollbar bg-[#0b0e14]">
                    <img src={selectedPost.image} className="w-full h-[500px] object-cover rounded-[50px] shadow-2xl border border-white/5" alt="" />
                    <div className="max-w-3xl mx-auto">
                        <div className="text-slate-300 text-2xl leading-[2.2] font-medium whitespace-pre-wrap selection:bg-cyan-500/20 first-letter:text-5xl first-letter:font-black first-letter:text-cyan-400">
                            {selectedPost.content}
                        </div>
                        {/* Ad Inside Article */}
                        <AdPlaceholder type="article_bottom" slotId={ads.articleBottomSlotId} />
                    </div>
                </div>
                <div className="p-12 border-t border-white/5 bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-black text-2xl shadow-xl">ع</div>
                        <div>
                            <div className="text-lg font-black text-white">كتبه {selectedPost.author}</div>
                            <div className="text-xs text-slate-500 font-bold">خبير تقني في منصة عبدو ويب</div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedPost(null)} className="bg-white text-slate-950 px-12 py-5 rounded-[25px] font-black text-sm hover:bg-cyan-400 transition-all shadow-xl shadow-white/5">إغلاق القراءة</button>
                </div>
            </div>
        </div>
      )}

      {/* AI Assistant */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[55px] shadow-2xl flex flex-col h-[80vh] overflow-hidden animate-slide-in">
            <div className="p-10 bg-slate-900 border-b border-white/5 text-white flex justify-between items-center">
              <div className="flex items-center gap-5 text-cyan-400">✨ <h3 className="font-black text-xl text-white">مساعد عبدو التقني</h3></div>
              <button onClick={() => setIsAiOpen(false)} className="text-3xl text-slate-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 flex flex-col no-scrollbar bg-[#0f172a]/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-6 rounded-[35px] text-base font-bold leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-cyan-400 font-black animate-pulse uppercase tracking-[0.3em] mr-4">جاري تحليل البيانات..</div>}
            </div>
            <div className="p-10 border-t border-white/5 bg-slate-900/50 flex gap-4">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} placeholder="اسأل عن أي شيء تقني.." className="flex-1 bg-white/5 border-2 border-white/5 rounded-[25px] px-8 py-5 text-sm font-bold outline-cyan-500 text-slate-100 placeholder:text-slate-600" />
              <button onClick={handleAiSend} className="bg-cyan-600 text-slate-950 p-5 rounded-[25px] hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20">
                <svg className="w-6 h-6 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login UI */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/99 backdrop-blur-3xl p-6">
          <div className="bg-white p-16 rounded-[65px] shadow-2xl w-full max-w-sm animate-slide-in text-center text-slate-950">
            <div className="mb-10 text-indigo-600 text-7xl">🛡️</div>
            <h2 className="text-3xl font-black mb-10 tracking-tighter uppercase">بوابة الإدارة</h2>
            <input 
              type="password" 
              placeholder="كلمة السر" 
              className="w-full border-2 border-slate-100 rounded-[30px] p-6 text-center mb-10 text-3xl font-black outline-indigo-500 tracking-[0.5em] bg-slate-50"
              autoFocus
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            />
            <button onClick={handleAdminLogin} className="w-full bg-slate-950 text-white py-6 rounded-[30px] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">فتح اللوحة</button>
            <button onClick={() => setShowAdminLogin(false)} className="mt-10 text-slate-400 text-xs font-black hover:text-indigo-600 uppercase tracking-widest transition">تراجع</button>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="py-32 bg-slate-950 border-t border-white/5 text-center">
        <div className="container mx-auto px-6">
            <p className="font-black text-cyan-400 text-5xl mb-10 tracking-tighter">abdouweb</p>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed mb-20 font-medium">بوابة المعرفة الرقمية في المغرب. نحن نصنع المحتوى الذي يغير حياتك التقنية والشخصية.</p>
            <div className="flex flex-wrap justify-center gap-12 mb-32">
                {['تويتر', 'إنستغرام', 'تيك توك', 'يوتيوب'].map(social => (
                    <a key={social} href="#" className="text-xs font-black text-slate-700 hover:text-cyan-400 uppercase tracking-[0.3em] transition-colors">{social}</a>
                ))}
            </div>
            <div className="flex flex-col items-center gap-8">
                <button onClick={() => setShowAdminLogin(true)} className="bg-white/5 hover:bg-white/10 text-slate-600 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 transition-all">إدارة البوابة</button>
                <div className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">© 2024 عبدو ويب - الدار البيضاء، المغرب</div>
            </div>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
