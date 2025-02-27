
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notifications } from '@/components/Notifications';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  MessageSquare, 
  Rss, 
  Users 
} from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <SocialProvider>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isMobileMenuOpen 
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold flex items-center gap-1.5">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span>SoundConnect</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem to="/feed" label="Feed" icon={<Rss className="h-4 w-4" />} />
              <NavItem to="/mentorship" label="Mentorship" />
              <NavItem to="/marketplace" label="Marketplace" />
              <NavItem to="/connections" label="Network" icon={<Users className="h-4 w-4" />} />
            </nav>
            
            {/* Auth Buttons / User Menu */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Notifications />
                  
                  <Button asChild variant="ghost" size="icon">
                    <Link to="/messages">
                      <MessageSquare className="h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild className="hidden sm:flex">
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </>
              )}
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <MobileNavItem to="/feed" label="Feed" icon={<Rss className="h-4 w-4" />} />
              <MobileNavItem to="/mentorship" label="Mentorship" />
              <MobileNavItem to="/marketplace" label="Marketplace" />
              <MobileNavItem to="/connections" label="Network" icon={<Users className="h-4 w-4" />} />
              
              {!isLoggedIn && (
                <Button asChild className="mt-4 sm:hidden">
                  <Link to="/signup">Sign up</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>
    </SocialProvider>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Button 
      asChild 
      variant={isActive ? "default" : "ghost"} 
      className={`gap-1.5 ${isActive ? '' : 'hover:bg-accent/50'}`}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

function MobileNavItem({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Button 
      asChild 
      variant={isActive ? "default" : "ghost"} 
      className={`w-full justify-start gap-1.5 ${isActive ? '' : ''}`}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

function UserMenu() {
  const { logout } = useAuth();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages" className="flex items-center cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
