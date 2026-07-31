import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/lib/types';
import { slugify, formatPrice } from '@/lib/format';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Field, Input, Textarea, Select } from '@/components/Form';
import { MediaUpload } from '@/components/MediaUpload';
import { GalleryUpload } from '@/components/GalleryUpload';
import { useToast } from '@/components/Toast';

export function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data ?? []));
  }, []);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setOpen(true); };

  const save = async (form: Partial<Product>) => {
    const payload = {
      slug: form.slug || slugify(form.name || ''),
      name: form.name || '',
      description: form.description || null,
      price: Number(form.price) || 0,
      image_url: form.image_url || null,
      video_url: form.video_url || null,
      gallery: form.gallery || [],
      category_id: form.category_id || null,
      active: form.active ?? true,
    };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { notify('Nuk u perditesua.', 'error'); return; }
      notify('Produkti u perdtesua.', 'success');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { notify('Nuk u shtua: ' + error.message, 'error'); return; }
      notify('Produkti u shtua.', 'success');
    }
    setOpen(false);
    load();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Te fshihet "${p.name}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { notify('Nuk u fshi.', 'error'); return; }
    notify('Produkti u fshi.', 'success');
    load();
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from('products').update({ active: !p.active }).eq('id', p.id);
    if (error) { notify('Nuk u ndryshua.', 'error'); return; }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Produktet</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Menaxho produktet e menus</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Shto produkt</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[0,1,2].map((i) => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Package className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          Nuk ka produkte ende.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((p) => {
            const cat = categories.find((c) => c.id === p.category_id);
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-neutral-100 shadow-sm">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900">{p.name}</p>
                  <p className="text-xs text-neutral-500 truncate">/{p.slug} · {cat?.name || 'Pa kategori'} · {formatPrice(p.price)}</p>
                </div>
                <button onClick={() => toggleActive(p)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {p.active ? 'Aktiv' : 'Jo aktiv'}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p)} className="p-2 rounded-lg text-neutral-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Perditeso produktin' : 'Shto produkt'} size="lg">
        <ProductForm initial={editing} categories={categories} onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function ProductForm({ initial, categories, onSave, onCancel }: { initial: Product | null; categories: Category[]; onSave: (f: Partial<Product>) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [image_url, setImageUrl] = useState(initial?.image_url || '');
  const [video_url, setVideoUrl] = useState(initial?.video_url || '');
  const [gallery, setGallery] = useState<string[]>(initial?.gallery || []);
  const [category_id, setCategoryId] = useState(initial?.category_id || '');
  const [active, setActive] = useState(initial?.active ?? true);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Emri *"><Input value={name} onChange={(e) => { setName(e.target.value); if (!initial) setSlug(slugify(e.target.value)); }} placeholder="Pizza Margherita" /></Field>
        <Field label="Cmimi (Leke) *"><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="550" /></Field>
      </div>
      <Field label="Slug (linku)" hint="Leket bosh per te gjeneruar automatikisht"><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="margherita" /></Field>
      <Field label="Kategoria">
        <Select value={category_id || ''} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— Pa kategori —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </Field>
      <Field label="Pershkrimi"><Textarea value={description || ''} onChange={(e) => setDescription(e.target.value)} /></Field>
      <MediaUpload label="Foto e produktit" value={image_url} onChange={setImageUrl} accept="image" hint="Foto kryesore. Zgjidh nga galeria ose ngjit nje URL." />
      <GalleryUpload label="Galeria (deri 4 foto)" value={gallery} onChange={setGallery} hint="Shto deri ne 4 foto shtese per produktin." />
      <MediaUpload label="Video e produktit" value={video_url} onChange={setVideoUrl} accept="video" hint="Opsionale. Zgjidh nje video nga galeria ose ngjit nje URL." />
      <Field label="Statusi">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded accent-red-700" />
          Aktiv (i dukshem ne dyqan)
        </label>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Anulo</Button>
        <Button onClick={() => onSave({ name, slug, description, price, image_url, video_url, gallery, category_id: category_id || null, active })}>Ruaj</Button>
      </div>
    </div>
  );
}
