import { useEffect, useState } from 'react';
import { ShoppingCart, Package, FolderTree, Tag, ArrowRight, Clock, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/format';
import { MediaUpload } from '@/components/MediaUpload';
import { useToast } from '@/components/Toast';

interface DashboardProps {
  navigate: (to: string) => void;
}

export function AdminDashboard({ navigate }: DashboardProps) {
  const [stats, setStats] = useState({ orders: 0, products: 0, categories: 0, offers: 0, newOrders: 0 });
  const [recent, setRecent] = useState<{ id: string; customer_name: string; total: number; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState('');
  const [heroSaving, setHeroSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('offers').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('settings').select('hero_image').eq('id', 1).maybeSingle(),
    ]).then(([o, p, c, of, r, s]) => {
      setStats({
        orders: o.count ?? 0,
        products: p.count ?? 0,
        categories: c.count ?? 0,
        offers: of.count ?? 0,
        newOrders: 0,
      });
      setRecent((r.data as never) ?? []);
      setHeroImage((s.data as { hero_image: string | null } | null)?.hero_image || '');
      setLoading(false);
    });
  }, []);

  const saveHero = async () => {
    setHeroSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, hero_image: heroImage || null }, { onConflict: 'id' });
    setHeroSaving(false);
    if (error) notify('Ndodhi nje gabim gjate ruajtjes.', 'error');
    else notify('Foto e sfondit u ruajt me sukses.', 'success');
  };

  const cards = [
    { label: 'Porosi totale', value: stats.orders, icon: ShoppingCart, to: '/admin/porosite', color: 'bg-red-700' },
    { label: 'Produkte', value: stats.products, icon: Package, to: '/admin/produktet', color: 'bg-neutral-900' },
    { label: 'Kategori', value: stats.categories, icon: FolderTree, to: '/admin/kategorite', color: 'bg-green-700' },
    { label: 'Oferta', value: stats.offers, icon: Tag, to: '/admin/ofertat', color: 'bg-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Paneli i Kontrollit</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <a
            key={c.label}
            href={`#${c.to}`}
            onClick={(e) => { e.preventDefault(); navigate(c.to); }}
            className="group p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{loading ? '…' : c.value}</p>
            <p className="text-sm text-neutral-500 mt-0.5">{c.label}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-red-700" />
          <h2 className="text-lg font-semibold text-neutral-900">Foto e sfondit te faqes kryesore</h2>
        </div>
        <p className="text-sm text-neutral-500 mb-4">Zgjidh foton qe shfaqet ne sfondin e faqes kryesore te dyqanit.</p>
        <MediaUpload label="Foto e sfondit" value={heroImage} onChange={setHeroImage} accept="image" hint="Rekomandohet nje foto horizontale me rezolucion te larte." />
        <div className="mt-4">
          <button
            type="button"
            onClick={saveHero}
            disabled={heroSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
          >
            {heroSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {heroSaving ? 'Po ruhet...' : 'Ruaj foton'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Porosite e fundit</h2>
          <a href="#/admin/porosite" onClick={(e) => { e.preventDefault(); navigate('/admin/porosite'); }} className="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800">
            Te gjitha <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {recent.length === 0 ? (
            <p className="text-center text-neutral-500 py-10">Nuk ka porosi ende.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-medium text-neutral-900">{o.customer_name}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-900">{o.total} L</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      o.status === 'new' ? 'bg-red-100 text-red-700' :
                      o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {o.status === 'new' ? 'Re' : o.status === 'confirmed' ? 'Konfirmuar' : o.status === 'delivered' ? 'Dorezuar' : 'Anulluar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
