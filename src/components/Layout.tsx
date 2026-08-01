import { ShoppingBag, Store, LogIn, LogOut } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import type { Route } from '@/lib/router';

interface HeaderProps {
  route: Route;
  navigate: (to: string) => void;
}

export function Header({ route, navigate }: HeaderProps) {
  const { count } = useCart();
  const { isAdmin, signOut } = useAuth();
  const isHome = route.path === '/' || route.path === '';

  const links = [
    { label: 'Kryesore', to: '/' },
    { label: 'Produktet', to: '/menu' },
    { label: 'Ofertat', to: '/ofertat' },
    { label: 'Rreth Nesh', to: '/rreth' },
    { label: 'Kontakt', to: '/kontakt' },
  ];

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome ? 'bg-transparent' : 'bg-neutral-900/95 backdrop-blur shadow-lg'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#/" onClick={go('/')} className="flex items-center gap-2.5 group">
            <span className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </span>
            <span className={`font-bold text-lg tracking-tight ${isHome ? 'text-white' : 'text-white'}`}>
              Elite <span className="text-red-500">Store</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.to}
                href={`#${l.to}`}
                onClick={go(l.to)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  route.path === l.to
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={go('/shporta')}
              className="relative p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
              aria-label="Shporta"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-green-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            {isAdmin ? (
              <button
                onClick={(e) => { e.preventDefault(); signOut().then(() => navigate('/')); }}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-medium text-white bg-red-700 hover:bg-red-800 transition-colors"
                aria-label="Dilni"
              >
                <LogOut className="w-4 h-4" /> Dilni
              </button>
            ) : (
              <a
                href="#/admin"
                onClick={go('/admin')}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <LogIn className="w-4 h-4" /> Hyr
              </a>
            )}

          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {links.map((l) => (
            <a
              key={l.to}
              href={`#${l.to}`}
              onClick={go(l.to)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                route.path === l.to ? 'text-white bg-white/10' : 'text-white/70 hover:text-white'
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

export function Footer({ navigate }: { navigate: (to: string) => void }) {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-red-700 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </span>
              <span className="font-bold text-white text-lg">
                Elite <span className="text-red-500">Store</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Elite Store Albania - dyqani online juaj me cilësi dhe shërbim të shpejtë.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Navigim</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/menu" onClick={(e) => { e.preventDefault(); navigate('/menu'); }} className="hover:text-white transition-colors">Produktet</a></li>
              <li><a href="#/ofertat" onClick={(e) => { e.preventDefault(); navigate('/ofertat'); }} className="hover:text-white transition-colors">Ofertat</a></li>
              <li><a href="#/rreth" onClick={(e) => { e.preventDefault(); navigate('/rreth'); }} className="hover:text-white transition-colors">Rreth Nesh</a></li>
              <li><a href="#/kontakt" onClick={(e) => { e.preventDefault(); navigate('/kontakt'); }} className="hover:text-white transition-colors">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Kontakt</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>WhatsApp: 0693079134</li>
              <li>Email: elitestore@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-neutral-500 text-center">
          © {new Date().getFullYear()} Elite Store Albania. Te gjitha te drejtat e rezervuara.
        </div>
      </div>
    </footer>
  );
}
