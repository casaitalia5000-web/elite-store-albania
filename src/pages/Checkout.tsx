import { useState } from 'react';
import { ArrowLeft, CheckCircle2, MessageCircle, Truck } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import type { Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';
import { whatsappOrderUrl } from '@/lib/whatsapp';
import { shippingFor, isTirana, SHIPPING_INSIDE_TIRANA, SHIPPING_OUTSIDE_TIRANA } from '@/lib/shipping';
import { Button } from '@/components/Button';
import { Field, Input, Textarea } from '@/components/Form';
import { useToast } from '@/components/Toast';

interface CheckoutProps {
  route: Route;
  navigate: (to: string) => void;
}

interface FormState {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  note: string;
}

export function Checkout({ navigate }: CheckoutProps) {
  const { items, total, clear } = useCart();
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>({
    customer_name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ waUrl: string } | null>(null);

  const shipping = shippingFor(form.city);
  const grandTotal = total + shipping;
  const tirana = isTirana(form.city);

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Emri eshte i detyrueshem.';
    if (!form.phone.trim()) e.phone = 'Telefoni eshte i detyrueshem.';
    else if (!/^[0-9+\s-]{6,}$/.test(form.phone)) e.phone = 'Numer i pavlefshem.';
    if (!form.city.trim()) e.city = 'Qyteti eshte i detyrueshem per te llogaritur transportin.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      notify('Shporta eshte bosh.', 'error');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from('orders').insert({
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      note: form.note.trim() || null,
      items,
      total: grandTotal,
      status: 'new',
    }).select().single();
    setSubmitting(false);

    if (error || !data) {
      notify('Porosia nuk u ruaj. Provo perseri.', 'error');
      return;
    }

    const waUrl = whatsappOrderUrl({
      customer_name: form.customer_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      note: form.note,
      items,
      total: grandTotal,
      shipping,
    });

    clear();
    setDone({ waUrl });
  };

  if (done) {
    return (
      <div className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Porosia u regjistrua!</h1>
        <p className="text-neutral-500 mt-2 max-w-md mx-auto">
          Faleminderit {form.customer_name.split(' ')[0]}! Per te konfirmuar porosine tek ne,
          klikoni butonin me poshte dhe dergoni mesazhin ne WhatsApp.
        </p>
        <a
          href={done.waUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 mt-6 h-12 px-6 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
        >
          <MessageCircle className="w-5 h-5" /> Konfirmo ne WhatsApp
        </a>
        <a href="#/" onClick={go('/')} className="block mt-4 text-sm text-neutral-500 hover:text-neutral-800">
          Kthehu te kryesore
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 text-center py-20">
        <p className="text-neutral-500">Shporta eshte bosh.</p>
        <a href="#/menu" onClick={go('/menu')} className="inline-flex items-center gap-1 mt-4 text-red-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kthehu te menu
        </a>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Detajet e Porosise</h1>

        <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Field label="Emri dhe Mbiemri *" error={errors.customer_name}>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                placeholder="Shkruani emrin tuaj"
              />
            </Field>
            <Field label="Telefon *" error={errors.phone}>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="06xxxxxxxx"
                inputMode="tel"
              />
            </Field>
            <Field label="Adresa">
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Rruga, numri, etj."
              />
            </Field>
            <Field label="Qyteti *" error={errors.city} hint="Transporti llogaritet automatikisht sipas qytetit.">
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Shkruani qytetin (psh. Tirane)"
              />
            </Field>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                <Truck className="w-4 h-4 text-red-700" />
                Transporti
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{tirana ? 'Brenda Tiranes' : 'Jashte Tiranes'}</span>
                <span className="font-medium text-neutral-900">{formatPrice(shipping)}</span>
              </div>
              <p className="text-xs text-neutral-500">
                {tirana
                  ? `Tarifa fiks ${formatPrice(SHIPPING_INSIDE_TIRANA)} per dorezim brenda Tiranes.`
                  : `Tarifa fiks ${formatPrice(SHIPPING_OUTSIDE_TIRANA)} per dorezim ne qytete te tjera.`}
              </p>
            </div>
            <Field label="Shenim (opsionale)">
              <Textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Cdo shenim shtese per porosine..."
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <div className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm sticky top-24">
              <h2 className="font-semibold text-neutral-900 mb-3">Permbledhje</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((it) => (
                  <div key={it.product_id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{it.name} x{it.qty}</span>
                    <span className="font-medium text-neutral-900">{formatPrice(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Nentotali</span>
                  <span className="font-medium text-neutral-900">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Transporti</span>
                  <span className="font-medium text-neutral-900">{formatPrice(shipping)}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-neutral-600">Totali</span>
                <span className="text-xl font-bold text-red-700">{formatPrice(grandTotal)}</span>
              </div>
              <Button type="submit" size="lg" loading={submitting} className="w-full mt-5">
                Regjistro porosine
              </Button>
              <p className="text-xs text-neutral-500 mt-3 text-center">
                Pas regjistrimit do te keni mundesi te konfirmoni ne WhatsApp.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
