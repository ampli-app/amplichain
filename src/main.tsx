import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SocialProvider } from './contexts/SocialContext.tsx'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import Profile from './pages/Profile.tsx'
import Settings from './pages/Settings.tsx'
import EditProfile from './pages/EditProfile.tsx'
import Marketplace from './pages/Marketplace.tsx'
import ProductDetails from './pages/ProductDetails.tsx'
import EditProduct from './pages/EditProduct.tsx'
import Messages from './pages/Messages.tsx'
import Discovery from './pages/Discovery.tsx'
import Connections from './pages/Connections.tsx'
import Groups from './pages/Groups.tsx'
import Feed from './pages/Feed.tsx'
import Favorites from './pages/Favorites';

const routes = [
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/profile/:userId?',
    element: <Profile />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/edit-profile',
    element: <EditProfile />,
  },
  {
    path: '/marketplace',
    element: <Marketplace />,
  },
  {
    path: '/marketplace/:productId',
    element: <ProductDetails />,
  },
  {
    path: '/edit-product/:productId',
    element: <EditProduct />,
  },
  {
    path: '/messages',
    element: <Messages />,
  },
  {
    path: '/discovery',
    element: <Discovery />,
  },
  {
    path: '/connections',
    element: <Connections />,
  },
  {
    path: '/groups',
    element: <Groups />,
  },
  {
    path: '/feed',
    element: <Feed />,
  },
  {
    path: '/favorites',
    element: <Favorites />,
  },
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocialProvider>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </SocialProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
