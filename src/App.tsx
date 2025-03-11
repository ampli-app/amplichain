
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Discover from './pages/Discover';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Mentorship from './pages/Mentorship';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Messages from './pages/Messages';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Connections from './pages/Connections';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import ConsultationDetail from './pages/ConsultationDetail';
import EditProduct from './pages/EditProduct';
import EditConsultation from './pages/EditConsultation';
import { AuthProvider } from './contexts/AuthContext';
import { SocialProvider } from './contexts/SocialContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <SocialProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:id" element={<ProductDetail />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:id" element={<GroupDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/consultation/:id" element={<ConsultationDetail />} />
              <Route path="/edit-consultation/:id?" element={<EditConsultation />} />
              <Route path="/edit-product/:id?" element={<EditProduct />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </SocialProvider>
    </AuthProvider>
  );
}

export default App;
