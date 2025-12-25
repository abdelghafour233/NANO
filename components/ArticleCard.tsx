
import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col animate-slide-in bg-white dark:bg-[#1E293B] p-3 rounded-[40px] border border-[#E5E0D3] dark:border-white/5 hover:border-[#1B4332] dark:hover:border-emerald-500 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/5 dark:hover:shadow-emerald-500/10"
    >
      <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-6 bg-[#F2EFE6] dark:bg-[#0F172A]">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-[#1B4332]/90 dark:bg-emerald-500/90 backdrop-blur-md text-[#FCF9F1] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            {article.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/40 dark:from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3 mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#1B4332]/30 dark:text-slate-500">
          <span className="text-emerald-600 dark:text-emerald-400">جديد</span>
          <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
          <span>{article.date}</span>
          <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
          <span>{article.readTime}</span>
        </div>
        
        <h3 className="text-xl md:text-2xl font-black text-[#1B4332] dark:text-white mb-5 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 tracking-tight">
          {article.title}
        </h3>
        
        <p className="text-sm text-[#1B4332]/50 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-6">
          {article.excerpt}
        </p>
        
        <div className="mt-auto pt-5 border-t border-[#F2EFE6] dark:border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1B4332]/40 dark:text-slate-500 group-hover:text-[#1B4332] dark:group-hover:text-white transition-colors">اقرأ المزيد</span>
          <div className="w-10 h-10 rounded-full bg-[#FCF9F1] dark:bg-[#0F172A] flex items-center justify-center dark:text-white group-hover:bg-[#1B4332] dark:group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:-rotate-45">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
