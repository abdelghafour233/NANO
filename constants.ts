
import { Product, Category } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Modern Smart Watch Pro',
    nameAr: 'ساعة ذكية برو',
    description: 'High-definition AMOLED display with health monitoring.',
    price: 499,
    oldPrice: 799,
    category: Category.ELECTRONICS,
    image: 'https://picsum.photos/seed/watch/600/600',
    rating: 4.8,
    reviews: 124,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Premium Leather Handbag',
    nameAr: 'حقيبة يد جلدية فاخرة',
    description: 'Elegant handcrafted leather bag for daily use.',
    price: 350,
    category: Category.FASHION,
    image: 'https://picsum.photos/seed/bag/600/600',
    rating: 4.5,
    reviews: 89
  },
  {
    id: '3',
    name: 'Pure Argan Oil - 100ml',
    nameAr: 'زيت أركان أصلي - 100 مل',
    description: '100% Organic culinary and cosmetic argan oil.',
    price: 120,
    oldPrice: 150,
    category: Category.TRADITIONAL,
    image: 'https://picsum.photos/seed/argan/600/600',
    rating: 5.0,
    reviews: 450,
    isFeatured: true
  },
  {
    id: '4',
    name: 'Wireless Noise Cancelling Earbuds',
    nameAr: 'سماعات لاسلكية عازلة للضوضاء',
    description: 'Crystal clear sound with 30 hours battery life.',
    price: 299,
    category: Category.ELECTRONICS,
    image: 'https://picsum.photos/seed/buds/600/600',
    rating: 4.7,
    reviews: 210
  },
  {
    id: '5',
    name: 'Handwoven Berber Carpet',
    nameAr: 'زربية أمازيغية منسوجة يدوياً',
    description: 'Authentic traditional Moroccan rug.',
    price: 1200,
    category: Category.TRADITIONAL,
    image: 'https://picsum.photos/seed/rug/600/600',
    rating: 4.9,
    reviews: 56
  },
  {
    id: '6',
    name: 'Air Fryer XL - 5.5L',
    nameAr: 'مقلاة هوائية حجم كبير',
    description: 'Healthy cooking with little to no oil.',
    price: 850,
    oldPrice: 1100,
    category: Category.HOME,
    image: 'https://picsum.photos/seed/fryer/600/600',
    rating: 4.6,
    reviews: 332
  },
  {
    id: '7',
    name: 'Silk Embroidered Kaftan',
    nameAr: 'قفطان مطرز بالحرير',
    description: 'Exquisite traditional evening wear.',
    price: 950,
    category: Category.FASHION,
    image: 'https://picsum.photos/seed/kaftan/600/600',
    rating: 4.8,
    reviews: 74
  },
  {
    id: '8',
    name: 'Smart Home Hub',
    nameAr: 'جهاز تحكم منزلي ذكي',
    description: 'Voice control for all your smart devices.',
    price: 450,
    category: Category.ELECTRONICS,
    image: 'https://picsum.photos/seed/hub/600/600',
    rating: 4.4,
    reviews: 118
  }
];
