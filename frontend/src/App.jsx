import { Routes, Route, BrowserRouter, Navigate, Outlet } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

// Auth
import Register          from './views/auth/Register'
import Login             from './views/auth/Login'
import Logout            from './views/auth/Logout'
import ForgotPassword    from './views/auth/ForgotPassword'
import CreateNewPassword from './views/auth/CreateNewPassword'

// Layout
import Navbar       from './views/components/Navbar'
import Footer       from './views/components/Footer'
import MainWrapper  from './layout/MainWrapper'
import AdminRoute   from './layout/AdminRoute'

// Screens
import HomeScreen          from './views/screens/HomeScreen'
import CatalogueScreen     from './views/screens/CatalogueScreen'
import ProductDetailScreen from './views/screens/ProductDetailScreen'
import CartScreen          from './views/screens/CartScreen'
import CheckoutScreen      from './views/screens/CheckoutScreen'
import AboutScreen          from './views/screens/AboutScreen'
import FAQScreen            from './views/screens/FAQScreen'
import LivraisonScreen      from './views/screens/LivraisonScreen'
import ContactScreen        from './views/screens/ContactScreen'
import PolicyScreen         from './views/screens/PolicyScreen'
import PaymentSuccessScreen from './views/screens/PaymentSuccessScreen'
import PaymentFailedScreen  from './views/screens/PaymentFailedScreen'

// Admin
import AdminLayout       from './views/admin/AdminLayout'
import DashboardHome     from './views/admin/DashboardHome'
import ProductsAdmin     from './views/admin/ProductsAdmin'
import CategoriesAdmin   from './views/admin/CategoriesAdmin'
import OrdersAdmin       from './views/admin/OrdersAdmin'
import PromoCodes        from './views/admin/PromoCodes'
import ClientsAdmin      from './views/admin/ClientsAdmin'
import NewsletterAdmin   from './views/admin/NewsletterAdmin'

// Account
import AccountScreen    from './views/screens/AccountScreen'
import OrdersScreen     from './views/screens/OrdersScreen'
import AnalyticsAdmin   from './views/admin/AnalyticsAdmin'

import AnalyticsProvider from './analytics/AnalyticsProvider'
import WelcomePopup from './views/components/WelcomePopup'

// Wrapper boutique publique (Navbar + Footer autour des routes enfants)
function PublicLayout() {
  return (
    <MainWrapper>
      <WelcomePopup />
      <Navbar />
      <Outlet />
      <Footer />
    </MainWrapper>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
      <Routes>

        {/* ── Boutique publique ─────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"               element={<HomeScreen />} />
          <Route path="/catalogue"      element={<CatalogueScreen />} />
          <Route path="/product/:slug"  element={<ProductDetailScreen />} />
          <Route path="/cart"           element={<CartScreen />} />
          <Route path="/checkout"       element={<CheckoutScreen />} />

          {/* Auth */}
          <Route path="/register"            element={<Register />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/logout"              element={<Logout />} />
          <Route path="/forgot-password"     element={<ForgotPassword />} />
          <Route path="/create-new-password" element={<CreateNewPassword />} />

          {/* Raccourcis catalogue */}
          <Route path="/nouveautes" element={<Navigate to="/catalogue?sort=recent" replace />} />
          <Route path="/soldes"     element={<Navigate to="/catalogue?sort=price_asc" replace />} />

          {/* Paiement Stripe */}
          <Route path="/payment-success/:order_number" element={<PaymentSuccessScreen />} />
          <Route path="/payment-failed/:order_number"  element={<PaymentFailedScreen />} />

          {/* Compte client */}
          <Route path="/account" element={<AccountScreen />} />
          <Route path="/orders"  element={<OrdersScreen />} />

          {/* Info */}
          <Route path="/about"     element={<AboutScreen />} />
          <Route path="/faq"       element={<FAQScreen />} />
          <Route path="/livraison" element={<LivraisonScreen />} />
          <Route path="/contact"   element={<ContactScreen />} />
          <Route path="/policy"    element={<PolicyScreen />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── Admin (layout propre, sans Navbar/Footer boutique) ── */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index                element={<DashboardHome />} />
          <Route path="products"      element={<ProductsAdmin />} />
          <Route path="categories"    element={<CategoriesAdmin />} />
          <Route path="orders"        element={<OrdersAdmin />} />
          <Route path="promos"        element={<PromoCodes />} />
          <Route path="clients"       element={<ClientsAdmin />} />
          <Route path="newsletter"    element={<NewsletterAdmin />} />
          <Route path="analytics"     element={<AnalyticsAdmin />} />
        </Route>

      </Routes>
      </AnalyticsProvider>
    </BrowserRouter>
  )
}

export default App
