import { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { nativeShare } from '@/lib/whatsapp';
import { useToast } from './Toast';

interface ShareButtonProps {
  title: string;
  url: string;
  variant?: 'button' | 'icon';
}

export function ShareButton({ title, url, variant = 'button' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { notify } = useToast();

  const handleNative = async () => {
    try {
      await nativeShare(title, url);
      notify('Linku u kopjua.', 'success');
    } catch {
      // user cancelled
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify('Linku u kopjua.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('Nuk u kopjua dot.', 'error');
    }
  };

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  return (
    <div className="relative">
      {variant === 'button' ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Shperndaj
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2.5 rounded-full bg-white/90 backdrop-blur text-neutral-700 hover:bg-white shadow-sm border border-neutral-200 transition-colors"
          aria-label="Shperndaj"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 p-2 animate-[fadeIn_0.1s_ease-out]">
            <button
              onClick={handleNative}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 text-sm text-neutral-800 text-left"
            >
              <Share2 className="w-4 h-4 text-neutral-500" />
              Shperndaj...
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 text-sm text-neutral-800"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </a>
            <a
              href={fbUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 text-sm text-neutral-800"
            >
              <Facebook className="w-4 h-4 text-red-700" />
              Facebook
            </a>
            <a
              href={twUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 text-sm text-neutral-800"
            >
              <Twitter className="w-4 h-4 text-neutral-700" />
              Twitter
            </a>
            <button
              onClick={copy}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 text-sm text-neutral-800 text-left"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-500" />
              )}
              {copied ? 'U kopjua!' : 'Kopjo linkun'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
