import {
  Smartphone, Shirt, Home, Sparkles, Dumbbell, Watch,
  Laptop, Headphones, ShoppingBag, Palette, Heart, Camera,
  Book, Gamepad2, Car, Baby, Package, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Smartphone, Shirt, Home, Sparkles, Dumbbell, Watch,
  Laptop, Headphones, ShoppingBag, Palette, Heart, Camera,
  Book, Gamepad2, Car, Baby, Package,
};

export function getCategoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Package;
  return ICONS[name] ?? Package;
}

export const CATEGORY_ICON_OPTIONS = Object.keys(ICONS);
