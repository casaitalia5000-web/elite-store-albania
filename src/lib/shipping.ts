export const SHIPPING_INSIDE_TIRANA = 200;
export const SHIPPING_OUTSIDE_TIRANA = 300;

export function isTirana(city: string): boolean {
  const c = city.trim().toLowerCase();
  if (!c) return false;
  return c === 'tirane' || c === 'tirana' || c === 'tiranë' || c.startsWith('tir');
}

export function shippingFor(city: string): number {
  if (!city.trim()) return SHIPPING_INSIDE_TIRANA;
  return isTirana(city) ? SHIPPING_INSIDE_TIRANA : SHIPPING_OUTSIDE_TIRANA;
}
