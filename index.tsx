
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
}

const CATEGORIES = ['الكل', 'برمجة', 'ذكاء اصطناعي', 'تصميم', 'أمن معلومات'];

const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'مستقبل تطوير الويب في 2025',
    excerpt: 'تعرف على أهم التقنيات التي ستسيطر على عالم البرمجة في السنوات القادمة وكيف تستعد لها.',
    content: 'في عام 2025، سنشهد تحولاً جذرياً في كيفية بناء المواقع. الذكاء الاصطناعي لن يكتب الكود فحسب، بل سيقوم بتصميم واجهات المستخدم بشكل ديناميكي بناءً على سلوك الزائر. تقنيات مثل WebGPU ستجعل الرسوميات ثلاثية الأبعاد في المتصفح أسرع بمراحل...',
    author: 'عبدو',
    date: '24 ماي 2024',
    category: 'برمجة',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
    readTime: '5 دقائق'
  },
  {
    id: '2',
    title: 'دليلك الشامل لتعلم React المستوي المتقدم',
    excerpt: 'أهم المفاهيم التي يجب أن يعرفها كل مطور React محترف لزيادة أداء تطبيقاته.',
    content: 'تعلم استخدام Server Components و Actions في React 19. اكتشف كيف يمكنك تقليل حجم حزمة الجافاسكريبت وتحسين تجربة المستخدم عبر استخدام تقنيات الـ Streaming...',
    author: 'عبدو',
    date: '22 ماي 2024',
    category: 'برمجة',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
    readTime: '8 دقائق'
  },
  {
    id: '3',
    title: 'كيف غير الذكاء الاصطناعي مفهوم التصميم؟',
    excerpt: 'لم يعد التصميم مجرد ألوان وأشكال، بل أصبح تجربة ذكية تتفاعل مع المستخدم لحظياً.',
    content: 'أدوات مثل Midjourney و Figma AI بدأت في تغيير قواعد اللعبة. المصمم اليوم يحتاج إلى مهارات توجيه الذكاء الاصطناعي (Prompt Engineering) أكثر من مهارات الرسم اليدوي...',
    author: 'عبدو',
    date: '20 ماي 2024',
    category: 'تصميم',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=600&auto=format&fit=crop',
    readTime: '4 دقائق'
  }
];

const App = () => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [category, setCategory] = useState('الكل');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // AI Chat
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'أهلاً بك في مدونة عبدو ويب! أنا مساعدك الذكي، كيف أساعدك اليوم في عالم التقنية؟' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const filteredPosts = useMemo(() => 
    category === 'الكل' ? posts : posts.filter(p => p.category === category)
  , [category, posts]);

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
    setPosts(posts.map(p => p.id === editingPost.id ? editingPost : p));
    setEditingPost(null);
  };

  const handleAddPost = () => {
    const newP: BlogPost = {
      id: Date.now().toString(),
      title: 'عنوان المقال الجديد',
      excerpt: 'مقتطف قصير...',
      content: 'محتوى المقال الكامل هنا...',
      author: 'عبدو',
      date: new Date().toLocaleDateString('ar-MA'),
      category: 'برمجة',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=600',
      readTime: '5 دقائق'
    };
    setPosts([newP, ...posts]);
    setEditingPost(newP);
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
        contents: `أنت مساعد تقني لمدونة "عبدو ويب". أجب على سؤال المستخدم بأسلوب تقني مبسط وممتع باللغة العربية: ${msg}`
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ تقني.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-right flex flex-col" dir="rtl">
        <header className="bg-indigo-950 text-white p-5 flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-indigo-400">لوحة تحكم الكاتب - عبدو ويب</h1>
          </div>
          <button onClick={() => setIsAdmin(false)} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl text-xs font-bold transition">خروج</button>
        </header>
        <main className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-slate-800">إدارة المقالات</h2>
            <button onClick={handleAddPost} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl transition-all">+ كتابة مقال جديد</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col">
                <h4 className="font-black text-lg mb-2 truncate">{p.title}</h4>
                <p className="text-xs text-slate-400 mb-6">{p.date} | {p.category}</p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setEditingPost(p)} className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-100 transition">تعديل</button>
                  <button onClick={() => setPosts(posts.filter(x => x.id !== p.id))} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 transition">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </main>
        {editingPost && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-in">
              <div className="p-8 bg-indigo-950 text-white flex justify-between items-center">
                <h3 className="text-xl font-black">تحرير المقال</h3>
                <button onClick={() => setEditingPost(null)} className="text-2xl opacity-50 hover:opacity-100 transition">✕</button>
              </div>
              <form onSubmit={handleUpdatePost} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <input required className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-indigo-500" value={editingPost.title} placeholder="عنوان المقال" onChange={e => setEditingPost({...editingPost, title: e.target.value})} />
                <textarea required className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold h-32 outline-indigo-500" value={editingPost.excerpt} placeholder="مقتطف قصير" onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} />
                <textarea required className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold h-64 outline-indigo-500" value={editingPost.content} placeholder="محتوى المقال الكامل" onChange={e => setEditingPost({...editingPost, content: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold" value={editingPost.category} onChange={e => setEditingPost({...editingPost, category: e.target.value})}>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold" value={editingPost.image} placeholder="رابط الصورة" onChange={e => setEditingPost({...editingPost, image: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl transition-all">حفظ المقال</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200 text-right overflow-x-hidden" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter cursor-default">
            abdouweb
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-indigo-400 transition">الرئيسية</a>
              <a href="#" className="hover:text-indigo-400 transition">بودكاست</a>
              <a href="#" className="hover:text-indigo-400 transition">عن عبدو</a>
            </nav>
            <button onClick={() => setIsAiOpen(true)} className="bg-indigo-600/10 text-indigo-400 px-6 py-2.5 rounded-full text-sm font-black border border-indigo-500/30 hover:bg-indigo-600/20 transition shadow-lg">🤖 مساعد عبدو</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 text-center px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">نكتشف <span className="text-indigo-400">الويب</span> معاً</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed opacity-80">مدونة تقنية متخصصة في تطوير الويب، الذكاء الاصطناعي، وأحدث اتجاهات التكنولوجيا الحديثة.</p>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-6 py-12 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setCategory(c)}
            className={`px-10 py-3 rounded-2xl whitespace-nowrap text-sm font-black transition-all duration-300 border-2 ${category === c ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-500/20 -translate-y-1' : 'bg-white/5 border-white/5 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <main className="container mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredPosts.map(p => (
          <article 
            key={p.id} 
            onClick={() => setSelectedPost(p)}
            className="group bg-white/5 rounded-[40px] border border-white/5 overflow-hidden hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-500 flex flex-col cursor-pointer"
          >
            <div className="aspect-[16/10] overflow-hidden relative">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={p.title} />
              <div className="absolute bottom-4 right-4 bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl">{p.category}</div>
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold mb-4 uppercase tracking-widest">
                <span>{p.date}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <span>{p.readTime} قراءة</span>
              </div>
              <h3 className="font-black text-2xl mb-4 leading-tight group-hover:text-indigo-400 transition">{p.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-3 mb-8 font-medium leading-relaxed opacity-70">{p.excerpt}</p>
              <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-400/20 flex items-center justify-center text-indigo-400 font-black">ع</div>
                    <span className="text-sm font-bold text-slate-300">بواسطة {p.author}</span>
                </div>
                <div className="text-indigo-400 group-hover:translate-x-[-8px] transition">←</div>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Reading Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6">
            <div className="bg-[#1e293b] w-full max-w-4xl rounded-[50px] shadow-2xl overflow-hidden animate-slide-in flex flex-col h-[90vh]">
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#1e293b]">
                    <h2 className="text-3xl font-black text-white">{selectedPost.title}</h2>
                    <button onClick={() => setSelectedPost(null)} className="text-4xl text-slate-500 hover:text-white transition">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-12 space-y-10">
                    <img src={selectedPost.image} className="w-full h-96 object-cover rounded-[40px] shadow-2xl" alt="" />
                    <div className="flex items-center gap-4 text-indigo-400 font-bold text-sm">
                        <span># {selectedPost.category}</span>
                        <span className="text-slate-600">|</span>
                        <span>{selectedPost.date}</span>
                    </div>
                    <div className="text-slate-300 text-xl leading-[2] font-medium whitespace-pre-wrap selection:bg-indigo-500/30">
                        {selectedPost.content}
                    </div>
                </div>
                <div className="p-10 border-t border-white/5 bg-[#0f172a]/50 text-center">
                    <p className="text-slate-500 font-bold mb-4">هل أعجبك المقال؟ شاركه مع أصدقائك التقنيين!</p>
                    <button onClick={() => setSelectedPost(null)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-500/20">العودة للمقالات</button>
                </div>
            </div>
        </div>
      )}

      {/* Admin Auth */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-6">
          <div className="bg-white p-12 rounded-[50px] shadow-2xl w-full max-w-xs animate-slide-in text-center text-slate-900">
            <div className="mb-6 text-indigo-600 text-5xl">🔑</div>
            <h2 className="text-2xl font-black mb-8 uppercase tracking-widest">لوحة الكاتب</h2>
            <input 
              type="password" 
              placeholder="كلمة السر" 
              className="w-full border-2 border-slate-100 rounded-[25px] p-5 text-center mb-8 text-2xl font-black outline-indigo-500 tracking-[0.4em]"
              autoFocus
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            />
            <button onClick={handleAdminLogin} className="w-full bg-indigo-600 text-white py-5 rounded-[25px] font-black text-lg shadow-2xl active:scale-95">دخول</button>
            <button onClick={() => setShowAdminLogin(false)} className="mt-8 text-slate-400 text-xs font-black hover:text-indigo-600 transition">إلغاء</button>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsAiOpen(false)} />
          <div className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-[45px] shadow-2xl flex flex-col h-[75vh] overflow-hidden animate-slide-in">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">🤖 <h3 className="font-black text-xl">مساعد عبدو التقني</h3></div>
              <button onClick={() => setIsAiOpen(false)} className="text-3xl opacity-70 hover:opacity-100">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-900/50 flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-5 rounded-[30px] text-sm font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#334155] border border-white/5 text-slate-200 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-indigo-400 font-black animate-pulse mr-2">جاري التفكير...</div>}
            </div>
            <div className="p-8 border-t border-white/5 bg-[#1e293b] flex gap-3">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} placeholder="اسألني عن أي تقنية.." className="flex-1 bg-white/5 border-2 border-white/5 rounded-[22px] px-6 py-4 text-sm font-black outline-indigo-500 text-slate-200" />
              <button onClick={handleAiSend} className="bg-indigo-600 text-white p-4 rounded-[22px] hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20">
                <svg className="w-6 h-6 transform -rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-24 bg-[#0f172a] border-t border-white/5 text-center">
        <div className="container mx-auto px-6">
            <p className="font-black text-indigo-400 text-4xl mb-6 tracking-tighter">abdouweb</p>
            <p className="text-sm font-bold text-slate-500 mb-12">صنع بحب لمجتمع التقنية المغربي والعربي 🇲🇦</p>
            <div className="flex flex-wrap justify-center gap-10">
                <button onClick={() => setShowAdminLogin(true)} className="text-[11px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-[0.2em] transition">لوحة الكاتب</button>
                <a href="#" className="text-[11px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-[0.2em] transition">يوتيوب</a>
                <a href="#" className="text-[11px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-[0.2em] transition">لينكد إن</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
