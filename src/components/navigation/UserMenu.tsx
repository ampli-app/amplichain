
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  LogOut,
  Heart,
  MessageSquare,
  Users,
  Package,
  ShoppingBag
} from 'lucide-react';

export interface UserMenuProps {
  avatarUrl?: string;
  className?: string;
}

export function UserMenu({ avatarUrl, className }: UserMenuProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-10 w-10 rounded-full ${className}`}
          title="Menu użytkownika"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Avatar" />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { navigate('/profile'); setIsOpen(false); }}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigate('/favorites'); setIsOpen(false); }}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Ulubione</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigate('/messages'); setIsOpen(false); }}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Wiadomości</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigate('/connections'); setIsOpen(false); }}>
          <Users className="mr-2 h-4 w-4" />
          <span>Sieć</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { navigate('/orders'); setIsOpen(false); }}>
          <Package className="mr-2 h-4 w-4" />
          <span>Zamówienia</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigate('/edit-product'); setIsOpen(false); }}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>Sprzedaj produkt</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Wyloguj się</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
