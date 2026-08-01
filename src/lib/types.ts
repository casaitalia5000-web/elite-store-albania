export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  video_url: string | null;
  gallery: string[];
  active: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
}

export type OrderStatus = 'new' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  city: string | null;
  note: string | null;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
}
