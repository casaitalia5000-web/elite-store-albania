import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import type { Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/cart';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { ShareButton } from '@/components/ShareButton';
import { shareProductUrl } from '@/lib/whatsapp';

interface ProductPageProps {
  route: Route;
  navigate: (to: string) => void;
}

export function ProductPage({ route, navigate }: ProductPageProps) {
  const slug = route.params.slug || '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { add } = useCart();
  const { notify } = useToast();

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    supabase.from('products').select('*').eq('slug', slug).maybeSingle().then(({ data }) => {
      setProduct(data);
      setLoading(false);
    });
  }, [slug]);

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  if (loading) {
    return (
      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-80 rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
        <p className="text-neutral-500">Produkti nuk u gjet.</p>
        <a href="#/menu" onClick={go('/menu')} className="inline-flex items-center gap-1 mt-4 text-red-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kthehu te menu
        </a>
      </div>
    );
  }

  const handleAdd = () => {
    add({ product_id: product.id, name: product.name, price: product.price, qty });
    notify(`${product.name} u shtua ne shporte.`, 'success');
    navigate('/shporta');
  };

  const shareUrl = shareProductUrl(product.slug);
  const gallery = product.gallery || [];
  const allImages = [product.image_url, ...gallery].filter(Boolean) as string[];
  const currentImage = allImages[activeImage] || allImages[0] || 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <nav className="text-sm text-neutral-500 mb-4">
          <a href="#/" onClick={go('/')} className="hover:text-neutral-800">Kryesore</a> <span className="mx-1">/</span>
          <a href="#/menu" onClick={go('/menu')} className="hover:text-neutral-800">Menu</a> <span className="mx-1">/</span>
          <span className="text-neutral-800">{product.name}</span>
        </nav>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-10">
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-neutral-100 aspect-square">
              {product.video_url ? (
                <video
                  src={product.video_url}
                  poster={currentImage}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 right-3">
                <ShareButton title={product.name} url={shareUrl} variant="icon" />
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                      i === activeImage ? 'border-red-600' : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>
            <p className="text-2xl font-bold text-red-700 mt-2">{formatPrice(product.price)}</p>
            {product.description && (
              <p className="text-neutral-600 mt-4 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <span className="text-sm font-medium text-neutral-700">Sasia</span>
              <div className="flex items-center border border-neutral-200 rounded-xl">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-xl">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-xl">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Button onClick={handleAdd} size="lg">
                <ShoppingBag className="w-4 h-4" /> Shto ne shporte
              </Button>
              <ShareButton title={product.name} url={shareUrl} />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <p className="text-sm text-neutral-600">
                <Tag className="w-4 h-4 inline -mt-0.5 mr-1 text-red-600" />
                Porosit online dhe konfirmo direkt ne WhatsApp me nje klikim.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
