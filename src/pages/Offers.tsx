import { useEffect, useState } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Offer } from '@/lib/types';
import type { Route } from '@/lib/router';
import { ShareButton } from '@/components/ShareButton';
import { shareOfferUrl } from '@/lib/whatsapp';

export function Offers({ route, navigate }: { route: Route; navigate: (to: string) => void }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('offers').select('*').eq('active', true).order('created_at', { ascending: false }).then(({ data }) => {
      setOffers(data ?? []);
      setLoading(false);
    });
  }, []);

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <div className="pt-20 sm:pt-24">
      <div className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Ofertat</h1>
          <p className="text-neutral-400 mt-2">Kushte speciale per nje kohe te kufizuar</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />)}
          </div>
        ) : offers.length === 0 ? (
          <p className="text-center text-neutral-500 py-16">Nuk ka oferta aktive.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((o) => (
              <a
                key={o.id}
                href={`#/oferta/${o.slug}`}
                onClick={go(`/oferta/${o.slug}`)}
                className="group rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative h-48 bg-neutral-900 overflow-hidden">
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
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-red-700">
                    Shiko detajet <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OfferPage({ route, navigate }: { route: Route; navigate: (to: string) => void }) {
  const slug = route.params.slug || '';
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from('offers').select('*').eq('slug', slug).maybeSingle().then(({ data }) => {
      setOffer(data);
      setLoading(false);
    });
  }, [slug]);

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  if (loading) {
    return <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6"><div className="h-80 rounded-2xl bg-neutral-100 animate-pulse" /></div>;
  }

  if (!offer) {
    return (
      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
        <p className="text-neutral-500">Oferta nuk u gjet.</p>
        <a href="#/ofertat" onClick={go('/ofertat')} className="inline-flex items-center gap-1 mt-4 text-red-700 font-medium">Kthehu te ofertat</a>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <nav className="text-sm text-neutral-500 mb-4">
          <a href="#/" onClick={go('/')} className="hover:text-neutral-800">Kryesore</a> <span className="mx-1">/</span>
          <a href="#/ofertat" onClick={go('/ofertat')} className="hover:text-neutral-800">Ofertat</a> <span className="mx-1">/</span>
          <span className="text-neutral-800">{offer.title}</span>
        </nav>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-10">
          <div className="relative rounded-2xl overflow-hidden bg-neutral-100 aspect-square">
            <img
              src={offer.image_url || 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-700 text-white text-xs font-bold shadow">
              OFERTE
            </span>
            <div className="absolute top-3 right-3">
              <ShareButton title={offer.title} url={shareOfferUrl(offer.slug)} variant="icon" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{offer.title}</h1>
            {offer.description && <p className="text-neutral-600 mt-4 leading-relaxed">{offer.description}</p>}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={go('/menu')}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-red-700 text-white font-medium hover:bg-red-800 transition-colors"
              >
                <Tag className="w-4 h-4" /> Porosit tani
              </button>
              <ShareButton title={offer.title} url={shareOfferUrl(offer.slug)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
