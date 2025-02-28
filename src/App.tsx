
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
import Mentorship from '@/pages/Mentorship';
import Connections from '@/pages/Connections';
import Discovery from '@/pages/Discovery';
import Messages from '@/pages/Messages';
import Marketplace from '@/pages/Marketplace';
import ProductDetail from '@/pages/ProductDetail';
import EditProduct from '@/pages/EditProduct';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import SocialFeed from '@/pages/SocialFeed';

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
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ProductDetail />} />
            <Route path="/edit-product/:id" element={<EditProduct />} />
            
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
