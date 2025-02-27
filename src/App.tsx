
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import SocialFeed from './pages/SocialFeed';
import Profile from './pages/Profile';
import Discovery from './pages/Discovery';
import Messages from './pages/Messages';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Connections from './pages/Connections';
import Mentorship from './pages/Mentorship';

import { AuthProvider } from './contexts/AuthContext';
import { SocialProvider } from './contexts/SocialContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <SocialProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/social-feed" element={<SocialFeed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </SocialProvider>
    </AuthProvider>
  )
}

export default App
