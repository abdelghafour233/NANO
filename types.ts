
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: BlogCategory;
  image: string;
  readTime: string;
}

export enum BlogCategory {
  TECH = 'تقنية وتكنولوجيا',
  MOROCCO = 'أخبار المغرب',
  PRODUCTS = 'مراجعات المنتجات',
  AFFILIATE = 'افلييت',
  SELF_IMPROVEMENT = 'تطوير الذات'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Product {
  id: string;
  nameAr: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}
