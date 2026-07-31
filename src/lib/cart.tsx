import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem } from './types';

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'casa-italia-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartContextValue['add'] = (item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.product_id === item.product_id);
      if (existing) {
        return prev.map((p) =>
          p.product_id === item.product_id ? { ...p, qty: p.qty + item.qty } : p
        );
      }
      return [...prev, item];
    });
  };

  const remove: CartContextValue['remove'] = (productId) => {
    setItems((prev) => prev.filter((p) => p.product_id !== productId));
  };

  const setQty: CartContextValue['setQty'] = (productId, qty) => {
    if (qty <= 0) {
      remove(productId);
      return;
    }
    setItems((prev) => prev.map((p) => (p.product_id === productId ? { ...p, qty } : p)));
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
