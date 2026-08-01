import { WHATSAPP_NUMBER } from './supabase';
import type { Order } from './types';
import { formatPrice } from './format';

function normalizeNumber(num: string): string {
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('0')) return '355' + digits.slice(1);
  return digits;
}

export function buildOrderMessage(order: {
  customer_name: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  note?: string | null;
  items: { name: string; price: number; qty: number }[];
  total: number;
  shipping?: number;
}): string {
  const lines: string[] = [];
  lines.push('*Porosi e re - Elite Store Albania*');
  lines.push('');
  lines.push(`Klienti: ${order.customer_name}`);
  lines.push(`Telefon: ${order.phone}`);
  if (order.address) lines.push(`Adresa: ${order.address}`);
  if (order.city) lines.push(`Qyteti: ${order.city}`);
  lines.push('');
  lines.push('*Artikujt:*');
  order.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name} x${it.qty} - ${formatPrice(it.price * it.qty)}`);
  });
  lines.push('');
  const subtotal = order.items.reduce((s, it) => s + it.price * it.qty, 0);
  lines.push(`Nentotali: ${formatPrice(subtotal)}`);
  if (order.shipping != null) lines.push(`Transporti: ${formatPrice(order.shipping)}`);
  lines.push(`*Totali: ${formatPrice(order.total)}*`);
  if (order.note) {
    lines.push('');
    lines.push(`Shenim: ${order.note}`);
  }
  return lines.join('\n');
}

export function whatsappOrderUrl(order: {
  customer_name: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  note?: string | null;
  items: { name: string; price: number; qty: number }[];
  total: number;
  shipping?: number;
}): string {
  const msg = buildOrderMessage(order);
  return `https://wa.me/${normalizeNumber(WHATSAPP_NUMBER)}?text=${encodeURIComponent(msg)}`;
}

export function whatsappOrderUrlFromDb(order: Order): string {
  return whatsappOrderUrl({
    customer_name: order.customer_name,
    phone: order.phone,
    address: order.address,
    city: order.city,
    note: order.note,
    items: order.items,
    total: order.total,
  });
}

export function shareProductUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}#/produkt/${slug}`;
}

export function shareCategoryUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}#/kategori/${slug}`;
}

export function shareOfferUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}#/oferta/${slug}`;
}

export function nativeShare(title: string, url: string): Promise<void> {
  if (navigator.share) {
    return navigator.share({ title, url }).then(() => undefined);
  }
  return navigator.clipboard.writeText(url).then(() => undefined);
}
