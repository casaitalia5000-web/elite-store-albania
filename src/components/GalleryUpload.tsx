import { useRef, useState, type ReactNode } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GalleryUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  hint?: string;
}

export function GalleryUpload({ label, value, onChange, max = 4, hint }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = max - value.length;

  const uploadFiles = async (files: FileList) => {
    setError(null);
    const slots = Math.min(files.length, remaining);
    if (slots <= 0) {
      setError(`Maksimumi eshte ${max} foto.`);
      return;
    }
    setUploading(true);
    try {
      const next = [...value];
      for (let i = 0; i < slots; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setError('Lejohen vetem foto.');
          continue;
        }
        const ext = file.name.split('.').pop() || 'bin';
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const path = `images/${safeName}`;
        const { error: upErr } = await supabase.storage
          .from('product-media')
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('product-media').getPublicUrl(path);
        next.push(pub.publicUrl);
      }
      onChange(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ngarkimi deshtoi.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
    e.target.value = '';
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  let preview: ReactNode = null;
  if (value.length > 0) {
    preview = (
      <div className="grid grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 group">
            <img src={url} alt={`galeria ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Hiq"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-800 mb-1.5">{label}</span>
      <div className="space-y-2">
        {preview}
        {value.length < max && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPick}
            className="hidden"
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {value.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Po ngarkon...' : 'Shto foto'}
            </button>
          )}
          {value.length === 0 && !uploading && (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
              <ImageIcon className="w-4 h-4" /> Asnje foto shtese
            </span>
          )}
          <span className="text-xs text-neutral-500">{value.length}/{max} foto</span>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    </label>
  );
}
