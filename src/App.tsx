import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { ToastProvider } from '@/components/Toast';
import { Header, Footer } from '@/components/Layout';
import { useRouter, matchRoute } from '@/lib/router';
import { Home } from '@/pages/Home';
import { Menu, CategoryPage } from '@/pages/Menu';
import { ProductPage } from '@/pages/Product';
import { Offers, OfferPage } from '@/pages/Offers';
import { Cart } from '@/pages/Cart';
import { Checkout } from '@/pages/Checkout';
import { About, Contact } from '@/pages/Info';
import { Admin } from '@/pages/Admin';

function Routes() {
  const { route, navigate } = useRouter();

  // Admin routes: no header/footer
  if (route.path.startsWith('/admin')) {
    return <Admin route={route} navigate={navigate} />;
  }

  let page: React.ReactNode;
  if (route.path === '/' || route.path === '') page = <Home route={route} navigate={navigate} />;
  else if (route.path === '/menu') page = <Menu route={route} navigate={navigate} />;
  else if (matchRoute(route.path, '/kategori/:slug')) page = <CategoryPage route={route} navigate={navigate} />;
  else if (matchRoute(route.path, '/produkt/:slug')) page = <ProductPage route={route} navigate={navigate} />;
  else if (route.path === '/ofertat') page = <Offers route={route} navigate={navigate} />;
  else if (matchRoute(route.path, '/oferta/:slug')) page = <OfferPage route={route} navigate={navigate} />;
  else if (route.path === '/shporta') page = <Cart route={route} navigate={navigate} />;
  else if (route.path === '/porosi') page = <Checkout route={route} navigate={navigate} />;
  else if (route.path === '/rreth') page = <About route={route} navigate={navigate} />;
  else if (route.path === '/kontakt') page = <Contact route={route} navigate={navigate} />;
  else
    page = (
      <div className="pt-24 text-center py-20">
        <h1 className="text-2xl font-bold text-neutral-900">Faqja nuk u gjet</h1>
        <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-red-700 font-medium mt-3 inline-block">Kthehu te kryesore</a>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header route={route} navigate={navigate} />
      <div className="flex-1">{page}</div>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Routes />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
