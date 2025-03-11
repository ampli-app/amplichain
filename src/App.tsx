
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Discover from '@/pages/Discover';
import Marketplace from '@/pages/Marketplace';
import ProductDetail from '@/pages/ProductDetail';
import EditProduct from '@/pages/EditProduct';
import ConsultationDetail from './pages/ConsultationDetail';
import { EditConsultation } from './pages/EditConsultation';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<ProductDetail />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/edit-consultation/:id" element={<EditConsultation />} />
        <Route path="/consultations/:id" element={<ConsultationDetail />} />
      </Routes>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
