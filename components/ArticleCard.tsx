
import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  return (
    <article 
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] hover:-translate-y-2"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <img 
          src={article.image} 
          alt={`غلاف مقال: ${article.title}`} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        <div className="absolute top-6 right-6">
          <span className="bg-white/90 dark:bg-emerald-500/90 backdrop-blur-md text-emerald-900 dark:text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-xl">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="p-8 flex-1 flex flex-col text-right">
        <div className="flex items-center gap-2 mb-4 justify-end">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {article.date} • {article.readTime}
          </span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
        
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-4 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-8 flex-1">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 group-hover:underline">اكتشف المزيد</span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
