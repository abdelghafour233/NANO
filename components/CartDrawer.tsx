
import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, q: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-white shadow-xl flex flex-col text-right">
          <div className="flex items-center justify-between p-6 border-b flex-row-reverse">
            <h2 className="text-xl font-bold text-gray-900">سلة التسوق</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">السلة فارغة حالياً.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 flex-row-reverse">
                    <img src={item.image} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{item.nameAr}</h4>
                      <p className="text-sm text-emerald-600 font-bold">{item.price} درهم</p>
                      <div className="mt-2 flex items-center gap-2 flex-row-reverse">
                        <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-6 h-6 border rounded flex items-center justify-center">-</button>
                        <span className="text-sm">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 border rounded flex items-center justify-center">+</button>
                        <button onClick={() => onRemove(item.id)} className="mr-auto text-[10px] text-red-500 font-bold underline">حذف</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-6 bg-gray-50 space-y-4">
            <div className="flex justify-between text-lg font-bold text-gray-900 flex-row-reverse">
              <p>المجموع</p>
              <p>{total} MAD</p>
            </div>
            <button 
              disabled={items.length === 0}
              onClick={onCheckout}
              className={`w-full py-4 rounded-xl font-bold transition shadow-lg ${items.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
            >
              إتمام الطلب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
