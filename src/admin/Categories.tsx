import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/format';
import { getCategoryIcon, CATEGORY_ICON_OPTIONS } from '@/lib/icons';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Field, Input, Textarea } from '@/components/Form';
import { MediaUpload } from '@/components/MediaUpload';
import { useToast } from '@/components/Toast';

export function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setOpen(true); };

  const save = async (form: Partial<Category>) => {
    const payload = {
      slug: form.slug || slugify(form.name || ''),
      name: form.name || '',
      description: form.description || null,
      image_url: form.image_url || null,
      icon: form.icon || null,
      sort_order: form.sort_order ?? 0,
    };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) { notify('Nuk u perditesua.', 'error'); return; }
      notify('Kategoria u perditesua.', 'success');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { notify('Nuk u shtua: ' + error.message, 'error'); return; }
      notify('Kategoria u shtua.', 'success');
    }
    setOpen(false);
    load();
  };

  const remove = async (c: Category) => {
    if (!confirm(`Te fshihet "${c.name}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) { notify('Nuk u fshi.', 'error'); return; }
    notify('Kategoria u fshi.', 'success');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Kategorite</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Menaxho kategorite kryesore te menus</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Shto kategori</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[0,1,2].map((i) => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <FolderTree className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          Nuk ka kategori ende.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-neutral-100 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-red-700 flex items-center justify-center shrink-0">
                {(() => { const Icon = getCategoryIcon(c.icon); return <Icon className="w-6 h-6 text-white" />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900">{c.name}</p>
                <p className="text-xs text-neutral-500 truncate">/{c.slug} · renditja {c.sort_order}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(c)} className="p-2 rounded-lg text-neutral-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Perditeso kategorine' : 'Shto kategori'}>
        <CategoryForm initial={editing} onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function CategoryForm({ initial, onSave, onCancel }: { initial: Category | null; onSave: (f: Partial<Category>) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image_url, setImageUrl] = useState(initial?.image_url || '');
  const [icon, setIcon] = useState(initial?.icon || '');
  const [sort_order, setSortOrder] = useState(initial?.sort_order ?? 0);

  return (
    <div className="space-y-4">
      <Field label="Emri *"><Input value={name} onChange={(e) => { setName(e.target.value); if (!initial) setSlug(slugify(e.target.value)); }} placeholder="Pizza" /></Field>
      <Field label="Slug (linku)" hint="Leket bosh per te gjeneruar automatikisht"><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="pizza" /></Field>
      <Field label="Pershkrimi"><Textarea value={description || ''} onChange={(e) => setDescription(e.target.value)} /></Field>
      <MediaUpload label="Foto e kategorise" value={image_url} onChange={setImageUrl} accept="image" hint="Zgjidh nje foto nga galeria ose ngjit nje URL." />
      <Field label="Ikona" hint="Zgjidh nje ikone per kategorine">
        <select value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
          <option value="">— Pa ikone —</option>
          {CATEGORY_ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
        </select>
      </Field>
      <Field label="Renditja"><Input type="number" value={sort_order} onChange={(e) => setSortOrder(Number(e.target.value))} /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Anulo</Button>
        <Button onClick={() => onSave({ name, slug, description, image_url, icon, sort_order })}>Ruaj</Button>
      </div>
    </div>
  );
}
