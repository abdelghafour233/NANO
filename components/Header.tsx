
import React from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onAssistantClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick, onAssistantClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">MATJAR</span>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">MAROC</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition">الرئيسية</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition">المنتجات التقليدية</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition">العروض</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onAssistantClick}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="hidden sm:inline">المساعد الذكي</span>
          </button>
          
          <button 
            onClick={onCartClick}
            className="relative p-2 text-gray-600 hover:text-emerald-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
