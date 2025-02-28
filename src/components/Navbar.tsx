
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useSocial } from '@/contexts/SocialContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  MessageSquare, 
  Rss, 
  Users,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { users } = useSocial();
  
  // Pobierz dane profilu użytkownika
  const userProfile = user ? users.find(u => u.id === user.id) : null;
  
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
  
  // Check if the current path is active
  const isActive = (path: string) => location.pathname === path;
  
  // Handle logo click based on login status
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/discovery');
    } else {
      navigate('/');
    }
  };
  
  return (
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
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <img 
              src="/lovable-uploads/f8ca029f-1e5e-42c9-ae3a-01ffb67072b4.png"
              alt="Amplichain logo" 
              className="h-8"
            />
          </div>
          
          {/* Desktop Navigation - Ustaw ją na stałą wysokość i szerokość */}
          <nav className="hidden md:flex items-center gap-1 h-14">
            <NavItem to="/feed" label="Aktualności" icon={<Rss className="h-4 w-4" />} active={isActive('/feed')} />
            <NavItem to="/marketplace" label="Produkty" icon={<ShoppingBag className="h-4 w-4" />} active={isActive('/marketplace')} />
            <NavItem to="/mentorship" label="Mentorzy" icon={<GraduationCap className="h-4 w-4" />} active={isActive('/mentorship')} />
            <NavItem to="/connections" label="Kontakty" icon={<Users className="h-4 w-4" />} active={isActive('/connections')} />
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
                
                <UserMenu avatarUrl={userProfile?.avatar} />
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Zaloguj się</Link>
                </Button>
                <Button asChild className="hidden sm:flex">
                  <Link to="/signup">Zarejestruj się</Link>
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
      
      {/* Mobile Navigation - Dodajemy stałą wysokość przyciskom */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <MobileNavItem to="/feed" label="Aktualności" icon={<Rss className="h-4 w-4" />} active={isActive('/feed')} />
            <MobileNavItem to="/marketplace" label="Produkty" icon={<ShoppingBag className="h-4 w-4" />} active={isActive('/marketplace')} />
            <MobileNavItem to="/mentorship" label="Mentorzy" icon={<GraduationCap className="h-4 w-4" />} active={isActive('/mentorship')} />
            <MobileNavItem to="/connections" label="Kontakty" icon={<Users className="h-4 w-4" />} active={isActive('/connections')} />
            
            {!isLoggedIn && (
              <Button asChild className="mt-4 sm:hidden">
                <Link to="/signup">Zarejestruj się</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, label, icon, active }: { to: string; label: string; icon?: React.ReactNode; active: boolean }) {
  return (
    <Button 
      asChild 
      variant={active ? "default" : "ghost"} 
      className={`gap-1.5 h-10 ${active ? '' : 'hover:bg-accent/50'}`}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

function MobileNavItem({ to, label, icon, active }: { to: string; label: string; icon?: React.ReactNode; active: boolean }) {
  return (
    <Button 
      asChild 
      variant={active ? "default" : "ghost"} 
      className={`w-full justify-start gap-1.5 h-12 ${active ? '' : ''}`}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

function UserMenu({ avatarUrl }: { avatarUrl?: string }) {
  const { logout } = useAuth();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="User" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages" className="flex items-center cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            Wiadomości
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/discovery" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Odkrywaj
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Ustawienia
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Wyloguj się
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
