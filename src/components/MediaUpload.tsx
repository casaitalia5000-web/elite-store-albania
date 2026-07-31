import { useRef, useState, type ReactNode } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Film } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MediaUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: 'image' | 'video' | 'both';
  hint?: string;
}

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/');
}

function fileKind(file: File): 'image' | 'video' | 'other' {
  if (isImageFile(file)) return 'image';
  if (isVideoFile(file)) return 'video';
  return 'other';
}

export function MediaUpload({ label, value, onChange, accept = 'both', hint }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptAttr =
    accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*';

  const handleFile = async (file: File) => {
    setError(null);
    const kind = fileKind(file);
    if (kind === 'other') {
      setError('Lejohen vetem foto ose video.');
      return;
    }
    if (accept === 'image' && kind === 'video') {
      setError('Ketu mund te ngarkoni vetem foto.');
      return;
    }
    if (accept === 'video' && kind === 'image') {
      setError('Ketu mund te ngarkoni vetem video.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${kind}s/${safeName}`;
      const { error: upErr } = await supabase.storage
        .from('product-media')
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('product-media').getPublicUrl(path);
      onChange(pub.publicUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ngarkimi deshtoi.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const isVideoVal = value.match(/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i);
  const isImageVal = value && !isVideoVal;

  let preview: ReactNode = null;
  if (value) {
    if (isImageVal) {
      preview = (
        <img src={value} alt="preview" className="w-full h-full object-cover" />
      );
    } else if (isVideoVal) {
      preview = (
        <video src={value} className="w-full h-full object-cover" muted playsInline />
      );
    }
  }

  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-800 mb-1.5">{label}</span>
      <div className="flex gap-3 items-start">
        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shrink-0 flex items-center justify-center">
          {preview}
          {!value && !uploading && <ImageIcon className="w-8 h-8 text-neutral-300" />}
          {uploading && <Loader2 className="w-6 h-6 text-red-700 animate-spin" />}
          {value && !uploading && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(''); }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Hiq"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            onChange={onPick}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition-colors"
            >
              <Upload className="w-4 h-4" /> Ngarko
            </button>
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ose ngjit nje URL..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
          {value && isVideoVal && (
            <p className="text-xs text-neutral-500 inline-flex items-center gap-1">
              <Film className="w-3.5 h-3.5" /> Video
            </p>
          )}
          {value && isImageVal && (
            <p className="text-xs text-neutral-500 inline-flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> Foto
            </p>
          )}
        </div>
      </div>
    </label>
  );
}
