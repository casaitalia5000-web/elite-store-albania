import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/lib/types';
import type { Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';
import { getCategoryIcon } from '@/lib/icons';

interface MenuProps {
  route: Route;
  navigate: (to: string) => void;
}

export function Menu({ navigate }: MenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
    ]).then(([c, p]) => {
      setCategories(c.data ?? []);
      setProducts(p.data ?? []);
      setLoading(false);
    });
  }, []);

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  const filtered = active === 'all' ? products : products.filter((p) => p.category_id === active);

  return (
    <div className="pt-20 sm:pt-24">
      <div className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Produktet</h1>
          <p className="text-neutral-400 mt-2">Te gjitha produktet tona te zgjedhura</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActive('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === 'all' ? 'bg-red-700 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Te gjitha
          </button>
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active === c.id ? 'bg-red-700 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.name}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-neutral-500 py-16">Nuk ka produkte ne kete kategori.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
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
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900">{p.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{p.description || ''}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-red-700">{formatPrice(p.price)}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-red-700">
                      Detaje <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoryPage({ route, navigate }: { route: Route; navigate: (to: string) => void }) {
  const slug = route.params.slug || '';
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from('categories').select('*').eq('slug', slug).maybeSingle().then(({ data }) => {
      setCategory(data);
      if (data) {
        supabase.from('products').select('*').eq('category_id', data.id).eq('active', true).order('created_at', { ascending: false }).then(({ data: ps }) => {
          setProducts(ps ?? []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <div className="pt-20 sm:pt-24">
      <div className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-neutral-400 mb-2">
            <a href="#/" onClick={go('/')} className="hover:text-white">Kryesore</a> <span className="mx-1">/</span>
            <a href="#/menu" onClick={go('/menu')} className="hover:text-white">Produktet</a> <span className="mx-1">/</span>
            <span className="text-white">{category?.name || slug}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold">{category?.name || 'Kategori'}</h1>
          {category?.description && <p className="text-neutral-400 mt-2">{category.description}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-neutral-500 py-16">Nuk ka produkte ne kete kategori.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
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
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900">{p.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{p.description || ''}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-red-700">{formatPrice(p.price)}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-red-700">
                      Detaje <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
