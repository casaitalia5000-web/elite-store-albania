import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/lib/cart';
import type { Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';
import { SHIPPING_INSIDE_TIRANA } from '@/lib/shipping';
import { Button } from '@/components/Button';

export function Cart({ navigate }: { route: Route; navigate: (to: string) => void }) {
  const { items, setQty, remove, total, count } = useCart();

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7 text-neutral-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Shporta eshte bosh</h1>
        <p className="text-neutral-500 mt-2">Shto produkte per te vazhduar me porosine.</p>
        <a href="#/menu" onClick={go('/menu')} className="inline-flex items-center gap-2 mt-6 h-11 px-5 rounded-xl bg-red-700 text-white font-medium hover:bg-red-800 transition-colors">
          Shiko menun <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Shporta ({count})</h1>

        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.product_id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-neutral-100 shadow-sm">
              <div className="flex-1">
                <p className="font-medium text-neutral-900">{it.name}</p>
                <p className="text-sm text-neutral-500">{formatPrice(it.price)} cdo nje</p>
              </div>
              <div className="flex items-center border border-neutral-200 rounded-lg">
                <button onClick={() => setQty(it.product_id, it.qty - 1)} className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-lg">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                <button onClick={() => setQty(it.product_id, it.qty + 1)} className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-lg">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="font-bold text-neutral-900 w-20 text-right">{formatPrice(it.price * it.qty)}</span>
              <button onClick={() => remove(it.product_id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Nentotali</span>
            <span className="text-2xl font-bold text-neutral-900">{formatPrice(total)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Truck className="w-4 h-4 text-red-700" />
              Transporti llogaritet automatikisht ne hapin e porosise (nga {formatPrice(SHIPPING_INSIDE_TIRANA)})
            </div>
          </div>
          <Button onClick={go('/porosi')} size="lg" className="w-full mt-4">
            Vazhdo te porosia <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
