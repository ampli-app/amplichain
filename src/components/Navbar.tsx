
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Notifications } from '@/components/Notifications';
import { 
  Menu, 
  X, 
  Rss, 
  Users,
  ShoppingBag,
  MessageSquare,
  User,
  LogOut,
  Settings,
  Compass,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { NavItem } from '@/components/navigation/NavItem';
import { MobileNavItem } from '@/components/navigation/MobileNavItem';
import { UserMenu } from '@/components/navigation/UserMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const { users } = useSocial();
  
  const userProfile = user ? users.find(u => u.id === user.id) : null;
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/discover');
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
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <img 
              src="/lovable-uploads/aa463c52-7637-4ee5-a553-736e045af0aa.png"
              alt="Amplichain logo" 
              className="h-8 w-auto object-contain flex-shrink-0"
            />
          </div>
          
          <nav className="hidden md:flex items-center gap-1 h-14">
            <NavItem to="/feed" text="Feed" icon={Rss} active={isActive('/feed')} />
            <NavItem to="/marketplace" text="Marketplace" icon={ShoppingBag} active={isActive('/marketplace')} />
            <NavItem to="/groups" text="Grupy" icon={Users} active={isActive('/groups')} />
            <NavItem to="/connections" text="Sieć" icon={Users} active={isActive('/connections')} />
          </nav>
          
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Notifications />
                
                <Button asChild variant="ghost" size="icon">
                  <Link to="/messages">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                </Button>
                
                <div className="hidden md:block">
                  <UserMenu avatarUrl={userProfile?.avatar} />
                </div>
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
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {isLoggedIn && (
              <div className="pb-4 mb-4 border-b">
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile?.avatar || "/placeholder.svg"} alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Moje konto</p>
                  </div>
                </div>
                
                <MobileNavItem 
                  to="/profile" 
                  label="Profil" 
                  icon={<User className="h-4 w-4" />} 
                  active={isActive('/profile')} 
                />
                
                <MobileNavItem 
                  to="/messages" 
                  label="Wiadomości" 
                  icon={<MessageSquare className="h-4 w-4" />} 
                  active={isActive('/messages')} 
                />
                
                <MobileNavItem 
                  to="/favorites" 
                  label="Ulubione" 
                  icon={<Heart className="h-4 w-4" />} 
                  active={isActive('/favorites')} 
                />
                
                <MobileNavItem 
                  to="/discover" 
                  label="Odkrywaj" 
                  icon={<Compass className="h-4 w-4" />} 
                  active={isActive('/discover')} 
                />
                
                <MobileNavItem 
                  to="/settings" 
                  label="Ustawienia" 
                  icon={<Settings className="h-4 w-4" />} 
                  active={isActive('/settings')} 
                />
                
                <Button 
                  variant="ghost"
                  className="w-full justify-start gap-1.5 h-12 text-red-500 hover:text-red-500"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  Wyloguj się
                </Button>
              </div>
            )}
            
            <MobileNavItem to="/feed" label="Feed" icon={<Rss className="h-4 w-4" />} active={isActive('/feed')} />
            <MobileNavItem to="/marketplace" label="Marketplace" icon={<ShoppingBag className="h-4 w-4" />} active={isActive('/marketplace')} />
            <MobileNavItem to="/groups" label="Grupy" icon={<Users className="h-4 w-4" />} active={isActive('/groups')} />
            <MobileNavItem to="/connections" label="Sieć" icon={<Users className="h-4 w-4" />} active={isActive('/connections')} />
            
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
