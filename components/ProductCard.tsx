
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-[45px] border border-[#F2EFE6] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col p-2">
      <div className="relative aspect-[10/11] overflow-hidden rounded-[40px] bg-[#FCF9F1]">
        <img 
          src={product.image} 
          alt={product.nameAr} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {product.oldPrice && (
          <div className="absolute top-5 right-5 bg-[#1B4332] text-[#FCF9F1] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
            عرض خاص
          </div>
        )}
      </div>
      
      <div className="p-8 flex-1 flex flex-col text-right">
        <div className="text-[10px] font-black text-[#1B4332]/40 uppercase tracking-[0.2em] mb-3">
          {product.category}
        </div>
        <h3 className="text-xl font-black text-[#1B4332] line-clamp-1 mb-2 tracking-tight group-hover:text-emerald-800 transition-colors">{product.nameAr}</h3>
        <p className="text-xs text-[#1B4332]/50 mb-6 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between flex-row-reverse border-t border-[#F2EFE6] pt-6">
          <div className="text-right">
            <span className="text-2xl font-black text-[#1B4332]">{product.price} درهم</span>
            {product.oldPrice && (
              <span className="mr-3 text-xs text-[#1B4332]/30 line-through font-bold">{product.oldPrice} درهم</span>
            )}
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="w-12 h-12 bg-[#1B4332] text-[#FCF9F1] rounded-2xl flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all shadow-lg shadow-[#1B4332]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
