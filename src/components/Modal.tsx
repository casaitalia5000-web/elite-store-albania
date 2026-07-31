import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col animate-[slideUp_0.2s_ease-out]`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
