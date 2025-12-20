
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.nameAr} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.oldPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
            تخفيض
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col text-right">
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">{product.nameAr}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between flex-row-reverse">
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">{product.price} درهم</span>
            {product.oldPrice && (
              <span className="mr-2 text-xs text-gray-400 line-through">{product.oldPrice} درهم</span>
            )}
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
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
