import { useEffect, useState } from 'react';
import { LayoutDashboard, FolderTree, Package, ShoppingCart, Tag, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { Route } from '@/lib/router';
import { Button } from '@/components/Button';
import { AdminDashboard } from '@/admin/Dashboard';
import { AdminCategories } from '@/admin/Categories';
import { AdminProducts } from '@/admin/Products';
import { AdminOrders } from '@/admin/Orders';
import { AdminOffers } from '@/admin/Offers';

interface AdminProps {
  route: Route;
  navigate: (to: string) => void;
}

export function Admin({ route, navigate }: AdminProps) {
  const { isAdmin, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin navigate={navigate} />;
  }

  const links = [
    { label: 'Paneli', to: '/admin', icon: LayoutDashboard },
    { label: 'Kategorite', to: '/admin/kategorite', icon: FolderTree },
    { label: 'Produktet', to: '/admin/produktet', icon: Package },
    { label: 'Porosite', to: '/admin/porosite', icon: ShoppingCart },
    { label: 'Ofertat', to: '/admin/ofertat', icon: Tag },
  ];

  const isActive = (to: string) => route.path === to;

  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    setSidebarOpen(false);
  };

  let content: React.ReactNode = null;
  if (route.path === '/admin') content = <AdminDashboard navigate={navigate} />;
  else if (route.path === '/admin/kategorite') content = <AdminCategories />;
  else if (route.path === '/admin/produktet') content = <AdminProducts />;
  else if (route.path === '/admin/porosite') content = <AdminOrders />;
  else if (route.path === '/admin/ofertat') content = <AdminOffers />;
  else content = <AdminDashboard navigate={navigate} />;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-neutral-900 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <span className="font-bold text-lg">Elite Store <span className="text-red-500">Admin</span></span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <a
              key={l.to}
              href={`#${l.to}`}
              onClick={go(l.to)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(l.to) ? 'bg-red-700 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <l.icon className="w-4.5 h-4.5" /> {l.label}
            </a>
          ))}
          <a
            href="#/"
            onClick={go('/')}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4.5 h-4.5" /> Shiko dyqanin
          </a>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" /> Dilni
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-neutral-200 flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-neutral-700">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-neutral-900">Admin</span>
          <span className="w-9" />
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">{content}</main>
      </div>
    </div>
  );
}

function AdminLogin({ navigate }: { navigate: (to: string) => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email.trim(), password);
      if (error) setError(error);
      else setInfo('Llogaria u krijua. Tani mund te hyni.');
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{mode === 'login' ? 'Hyrja e Adminit' : 'Krijo Llogari Admini'}</h1>
          <p className="text-neutral-400 text-sm mt-1">Vetem adresa casaitalia@gmail.com ka qasje.</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="casaitalia@gmail.com"
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Fjalekalimi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {info}
            </div>
          )}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            {mode === 'login' ? 'Hyr' : 'Krijo llogarine'}
          </Button>
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
            className="block w-full text-center text-sm text-neutral-500 hover:text-neutral-800 pt-1"
          >
            {mode === 'login' ? 'S\'keni llogari? Krijoni nje' : 'Keni tashme llogari? Hyni'}
          </button>
        </form>
        <button
          onClick={() => navigate('/')}
          className="block mx-auto mt-5 text-sm text-neutral-400 hover:text-white"
        >
          ← Kthehu te dyqani
        </button>
      </div>
    </div>
  );
}
