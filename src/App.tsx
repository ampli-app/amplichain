import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { Register } from '@/pages/Register';
import { Login } from '@/pages/Login';
import { Profile } from '@/pages/Profile';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { Discover } from '@/pages/Discover';
import { Marketplace } from '@/pages/Marketplace';
import { ProductDetail } from '@/pages/ProductDetail';
import { EditProduct } from '@/pages/EditProduct';
import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import ConsultationDetail from './pages/ConsultationDetail';
import { EditConsultation } from './pages/EditConsultation';

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
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Dodajemy nową ścieżkę do edycji konsultacji */}
          <Route path="/edit-consultation/:id" element={<EditConsultation />} />
          
          <Route path="/consultations/:id" element={<ConsultationDetail />} />
        </Routes>
        <Footer />
        <Toaster />
      </Router>
    </div>
  );
}

export default App;
