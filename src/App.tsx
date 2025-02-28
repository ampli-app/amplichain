
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { SocialProvider } from '@/contexts/SocialContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Page imports
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Marketplace from '@/pages/Marketplace';
import ProductDetail from '@/pages/ProductDetail';
import Feed from '@/pages/Feed';
import SocialFeed from '@/pages/SocialFeed';
import Connections from '@/pages/Connections';
import Mentorship from '@/pages/Mentorship';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Discovery from '@/pages/Discovery';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocialProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ProductDetail />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/social" element={<SocialFeed />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </SocialProvider>
    </AuthProvider>
  );
}

export default App;
