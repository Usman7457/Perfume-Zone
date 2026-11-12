import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CookieBanner from './components/CookieBanner.jsx';

// Pages
import Home from './pages/Home.jsx';
import Collection from './pages/Collection.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Wishlist from './pages/Wishlist.jsx';
import ImportProducts from './pages/ImportProducts.jsx';
import Search from './pages/Search.jsx';
import Account from './pages/Account.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import Faq from './pages/Faq.jsx';
import Wholesale from './pages/Wholesale.jsx';
import Offers from './pages/Offers.jsx';
import StaticPage from './pages/StaticPage.jsx';
import Blog from './pages/Blog.jsx';
import Stores from './pages/Stores.jsx';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:handle" element={<Collection key={pathname} />} />
          <Route path="/collections" element={<Collection key={pathname} />} />
          <Route path="/products/:handle" element={<Product key={pathname} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation key={pathname} />} />
          <Route path="/order-confirmation" element={<OrderConfirmation key={pathname} />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/import" element={<ImportProducts />} />
          <Route path="/admin/import" element={<ImportProducts />} />
          <Route path="/search" element={<Search />} />
          <Route path="/account" element={<Account />} />
          
          {/* Dedicated Informational Pages */}
          <Route path="/pages/contact-us" element={<Contact />} />
          <Route path="/pages/about-us" element={<About />} />
          <Route path="/pages/faqs" element={<Faq />} />
          <Route path="/pages/wholesale" element={<Wholesale />} />
          <Route path="/pages/dxb-wholesale" element={<Wholesale />} />
          <Route path="/pages/perfume-offers" element={<Offers />} />

          {/* Dynamic Page & Policy Catchers */}
          <Route path="/pages/:slug" element={<StaticPage key={pathname} kind="pages" />} />
          <Route path="/policies/:slug" element={<StaticPage key={pathname} kind="policies" />} />
          <Route path="/blogs/fragrance-insights" element={<Blog />} />
          <Route path="/tools/locations" element={<Stores />} />

          {/* 404 Page */}
          <Route path="*" element={<StaticPage key={pathname} kind="404" />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <CookieBanner />
    </>
  );
}
