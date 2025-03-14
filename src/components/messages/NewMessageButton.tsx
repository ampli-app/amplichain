
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, User, Loader2 } from 'lucide-react';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';

interface NewMessageButtonProps {
  onSelectUser: (userId: string) => void;
  isLoading?: boolean;
}

export function NewMessageButton({ onSelectUser, isLoading = false }: NewMessageButtonProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectingUser, setSelectingUser] = useState(false);
  const { users } = useSocial();
  
  // Filtruj użytkowników na podstawie wyszukiwania
  const filteredUsers = users.filter(user => 
    !user.isCurrentUser && 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  const handleSelectUser = async (userId: string) => {
    try {
      setSelectingUser(true); // Ustawienie stanu ładowania dla konkretnego użytkownika
      await onSelectUser(userId);
      setOpen(false);
      setSearchTerm('');
    } catch (error: any) {
      console.error('Błąd podczas wybierania użytkownika:', error);
      toast({
        title: 'Błąd',
        description: `Nie udało się rozpocząć konwersacji: ${error.message || 'Nieznany błąd'}`,
        variant: 'destructive',
      });
    } finally {
      setSelectingUser(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isLoading) { // Nie pozwalaj na zamknięcie, jeśli trwa ładowanie
        setOpen(newOpen);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Nowa wiadomość
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nowa wiadomość</DialogTitle>
          <DialogDescription>
            Wybierz użytkownika, aby rozpocząć konwersację
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="recipient" className="text-sm text-gray-500">Do:</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="recipient"
                placeholder="Wyszukaj użytkownika"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={selectingUser || isLoading}
              />
            </div>
          </div>
          
          <div className="max-h-72 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              <div className="space-y-1">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSelectUser(user.id)}
                    disabled={selectingUser || isLoading}
                  >
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <p className="font-medium">{user.name}</p>
                      {user.role && (
                        <p className="text-sm text-gray-500">{user.role}</p>
                      )}
                    </div>
                    {selectingUser && (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Nie znaleziono użytkowników</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
