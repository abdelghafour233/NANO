
export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: Category;
  image: string;
  rating: number;
  reviews: number;
  isFeatured?: boolean;
}

export enum Category {
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  HOME = 'Home & Kitchen',
  BEAUTY = 'Beauty & Health',
  TRADITIONAL = 'Traditional Moroccan'
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
