import { useEffect, useState } from 'react';
import { ArrowRight, Tag, ShoppingBag, Clock, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Offer, Product } from '@/lib/types';
import type { Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';
import { getCategoryIcon } from '@/lib/icons';

interface HomeProps {
  route: Route;
  navigate: (to: string) => void;
}

export function Home({ navigate }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('offers').select('*').eq('active', true).order('created_at', { ascending: false }).limit(3),
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).limit(6),
      supabase.from('settings').select('hero_image').eq('id', 1).maybeSingle(),
    ]).then(([c, o, p, s]) => {
      setCategories(c.data ?? []);
      setOffers(o.data ?? []);
      setPopular(p.data ?? []);
      setHeroImage((s.data as { hero_image: string | null } | null)?.hero_image || null);
      setLoading(false);
    });
  }, []);

  const heroBg = heroImage || 'https://images.pexels.com/photos/7857496/pexels-photo-7857496.jpeg?auto=compress&cs=tinysrgb&w=1600';

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Dyqan online"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full pt-24 pb-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-700/20 border border-red-500/30 text-red-300 text-xs font-medium mb-5 backdrop-blur">
              <ShoppingBag className="w-3.5 h-3.5" /> Dyqan Online me Cilesi
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight">
              Shito te <span className="text-red-500">Elite Store Albania</span>
            </h1>
            <p className="mt-5 text-lg text-neutral-300 leading-relaxed max-w-xl">
              Produktet me te zgjedhura me cmime te arsyeshme.
              Porosit online dhe konfirmo direkt ne WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={go('/menu')}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-red-700 text-white font-medium hover:bg-red-800 transition-colors shadow-lg shadow-red-900/30"
              >
                Shiko Produktet <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={go('/ofertat')}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/10 text-white font-medium border border-white/20 hover:bg-white/20 transition-colors backdrop-blur"
              >
                <Tag className="w-4 h-4" /> Ofertat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-neutral-900 text-white border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-px">
          {[
            { icon: Clock, title: 'Hapur cdo dite', text: '10:00 - 23:00' },
            { icon: MapPin, title: 'Adresa', text: 'Rruga Italia, Tiranë' },
            { icon: Phone, title: 'WhatsApp', text: '0693079134' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 py-5 sm:justify-center">
              <f.icon className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-neutral-400">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">Kategoritë Kryesore</h2>
            <p className="text-neutral-500 mt-1">Zgjidh nga kategorite tona te preferuara</p>
          </div>
          <a href="#/menu" onClick={go('/menu')} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800">
            Te gjitha <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <a
                  key={c.id}
                  href={`#/kategori/${c.slug}`}
                  onClick={go(`/kategori/${c.slug}`)}
                  className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-start"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{c.name}</h3>
                  <p className="text-sm text-white/60 line-clamp-2 mt-1">{c.description || ''}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-red-400 group-hover:text-red-300">
                    Shiko produktet <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="bg-neutral-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">Ofertat e Fundit</h2>
                <p className="text-neutral-500 mt-1">Kushte speciale per nje kohe te kufizuar</p>
              </div>
              <a href="#/ofertat" onClick={go('/ofertat')} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800">
                Te gjitha <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((o) => (
                <a
                  key={o.id}
                  href={`#/oferta/${o.slug}`}
                  onClick={go(`/oferta/${o.slug}`)}
                  className="group rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative h-44 bg-neutral-900 overflow-hidden">
                    <img
                      src={o.image_url || 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={o.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-700 text-white text-xs font-bold shadow">
                      OFERTE
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900">{o.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{o.description || ''}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8">Më të Kërkuarat</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popular.map((p) => (
            <a
              key={p.id}
              href={`#/produkt/${p.slug}`}
              onClick={go(`/produkt/${p.slug}`)}
              className="group rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative h-48 bg-neutral-100 overflow-hidden">
                <img
                  src={p.image_url || 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900">{p.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">{p.description || ''}</p>
                </div>
                <span className="font-bold text-red-700 whitespace-nowrap">{formatPrice(p.price)}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
