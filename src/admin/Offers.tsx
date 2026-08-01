import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Offer } from '@/lib/types';
import { slugify } from '@/lib/format';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Field, Input, Textarea } from '@/components/Form';
import { MediaUpload } from '@/components/MediaUpload';
import { useToast } from '@/components/Toast';

export function AdminOffers() {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    supabase.from('offers').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (o: Offer) => { setEditing(o); setOpen(true); };

  const save = async (form: Partial<Offer>) => {
    const payload = {
      slug: form.slug || slugify(form.title || ''),
      title: form.title || '',
      description: form.description || null,
      image_url: form.image_url || null,
      active: form.active ?? true,
    };
    if (editing) {
      const { error } = await supabase.from('offers').update(payload).eq('id', editing.id);
      if (error) { notify('Nuk u perditesua.', 'error'); return; }
      notify('Oferta u perdtesua.', 'success');
    } else {
      const { error } = await supabase.from('offers').insert(payload);
      if (error) { notify('Nuk u shtua: ' + error.message, 'error'); return; }
      notify('Oferta u shtua.', 'success');
    }
    setOpen(false);
    load();
  };

  const remove = async (o: Offer) => {
    if (!confirm(`Te fshihet "${o.title}"?`)) return;
    const { error } = await supabase.from('offers').delete().eq('id', o.id);
    if (error) { notify('Nuk u fshi.', 'error'); return; }
    notify('Oferta u fshi.', 'success');
    load();
  };

  const toggleActive = async (o: Offer) => {
    const { error } = await supabase.from('offers').update({ active: !o.active }).eq('id', o.id);
    if (error) { notify('Nuk u ndryshua.', 'error'); return; }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ofertat</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Menaxho ofertat dhe promocionet</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Shto oferte</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[0,1].map((i) => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Tag className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          Nuk ka oferta ende.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((o) => (
            <div key={o.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-neutral-100 shadow-sm">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                {o.image_url && <img src={o.image_url} alt={o.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900">{o.title}</p>
                <p className="text-xs text-neutral-500 truncate">/{o.slug}</p>
              </div>
              <button onClick={() => toggleActive(o)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${o.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {o.active ? 'Aktive' : 'Jo aktive'}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(o)} className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(o)} className="p-2 rounded-lg text-neutral-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Perdteso oferten' : 'Shto oferte'}>
        <OfferForm initial={editing} onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function OfferForm({ initial, onSave, onCancel }: { initial: Offer | null; onSave: (f: Partial<Offer>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image_url, setImageUrl] = useState(initial?.image_url || '');
  const [active, setActive] = useState(initial?.active ?? true);

  return (
    <div className="space-y-4">
      <Field label="Titulli *"><Input value={title} onChange={(e) => { setTitle(e.target.value); if (!initial) setSlug(slugify(e.target.value)); }} placeholder="Menu Familjare" /></Field>
      <Field label="Slug (linku)" hint="Leket bosh per te gjeneruar automatikisht"><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="menu-familjare" /></Field>
      <Field label="Pershkrimi"><Textarea value={description || ''} onChange={(e) => setDescription(e.target.value)} /></Field>
      <MediaUpload label="Foto e ofertes" value={image_url} onChange={setImageUrl} accept="image" hint="Zgjidh nje foto nga galeria ose ngjit nje URL." />
      <Field label="Statusi">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded accent-red-700" />
          Aktive (e dukshme ne dyqan)
        </label>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Anulo</Button>
        <Button onClick={() => onSave({ title, slug, description, image_url, active })}>Ruaj</Button>
      </div>
    </div>
  );
}
