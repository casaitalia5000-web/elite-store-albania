import { useEffect, useState } from 'react';
import { ShoppingCart, Phone, MapPin, Clock, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/format';
import { whatsappOrderUrlFromDb } from '@/lib/whatsapp';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Re',
  confirmed: 'Konfirmuar',
  delivered: 'Dorezuar',
  cancelled: 'Anulluar',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-red-100 text-red-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-neutral-100 text-neutral-500',
};

export function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [viewing, setViewing] = useState<Order | null>(null);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setItems((data as never) ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { notify('Nuk u perditesua.', 'error'); return; }
    notify('Statusi u perditesua.', 'success');
    setViewing((v) => (v && v.id === id ? { ...v, status } : v));
    load();
  };

  const filtered = filter === 'all' ? items : items.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Porosite</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Te gjitha porosite e marra nga klientet</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'new', 'confirmed', 'delivered', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-red-700 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {s === 'all' ? 'Te gjitha' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[0,1,2].map((i) => <div key={i} className="h-20 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          Nuk ka porosi.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-neutral-100 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-900">{o.customer_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                </div>
                <p className="text-xs text-neutral-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.phone}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(o.created_at)}</span>
                </p>
              </div>
              <span className="font-bold text-neutral-900 whitespace-nowrap">{formatPrice(o.total)}</span>
              <a
                href={whatsappOrderUrlFromDb(o)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                title="Konfirmo ne WhatsApp"
              >
                <MessageCircle className="w-4 h-4" /> Konfirmo
              </a>
              <button onClick={() => setViewing(o)} className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"><Eye className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Detajet e porosise" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-neutral-500">Klienti:</span> <span className="font-medium text-neutral-900">{viewing.customer_name}</span></div>
              <div><span className="text-neutral-500">Telefon:</span> <span className="font-medium text-neutral-900">{viewing.phone}</span></div>
              <div><span className="text-neutral-500">Adresa:</span> <span className="font-medium text-neutral-900">{viewing.address || '-'}</span></div>
              <div><span className="text-neutral-500">Qyteti:</span> <span className="font-medium text-neutral-900">{viewing.city || '-'}</span></div>
              <div className="sm:col-span-2"><span className="text-neutral-500">Shenim:</span> <span className="font-medium text-neutral-900">{viewing.note || '-'}</span></div>
              <div><span className="text-neutral-500">Data:</span> <span className="font-medium text-neutral-900">{formatDate(viewing.created_at)}</span></div>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Artikujt</h4>
              <div className="space-y-1.5">
                {viewing.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">{it.name} x{it.qty}</span>
                    <span className="font-medium text-neutral-900">{formatPrice(it.price * it.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100">
                  <span className="font-semibold text-neutral-900">Totali</span>
                  <span className="font-bold text-red-700">{formatPrice(viewing.total)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Ndrysho statusin</h4>
              <div className="flex flex-wrap gap-2">
                {(['new', 'confirmed', 'delivered', 'cancelled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(viewing.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      viewing.status === s ? 'bg-red-700 text-white border-red-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={whatsappOrderUrlFromDb(viewing)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Konfirmo ne WhatsApp
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
