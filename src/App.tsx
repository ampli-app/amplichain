
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Feed from '@/pages/Feed';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Groups from '@/pages/Groups';
import Connections from '@/pages/Connections';
import Discovery from '@/pages/Discovery';
import Messages from '@/pages/Messages';
import Marketplace from '@/pages/Marketplace';
import ProductDetail from '@/pages/ProductDetail';
import EditProduct from '@/pages/EditProduct';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import SocialFeed from '@/pages/SocialFeed';

// Import i18n configuration
import '@/i18n';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocialProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/social" element={<SocialFeed />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/product/:id" element={<Messages />} />
            <Route path="/messages/service/:id" element={<Messages />} />
            <Route path="/messages/consultation/:id" element={<Messages />} />
            <Route path="/messages/user/:id" element={<Messages />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ProductDetail />} />
            <Route path="/services/:id" element={<ProductDetail />} />
            <Route path="/consultations/:id" element={<ProductDetail />} />
            <Route path="/edit-product/:id" element={<EditProduct />} />
            <Route path="/edit-service/:id" element={<EditProduct />} />
            <Route path="/edit-consultation/:id" element={<EditProduct />} />
            
            {/* Ścieżki dla finalizacji zamówienia */}
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/checkout/:id/test" element={<Checkout />} />
            <Route path="/checkout/success/:id" element={<CheckoutSuccess />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </SocialProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
