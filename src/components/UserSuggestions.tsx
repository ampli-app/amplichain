
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSocial, SocialUser } from '@/contexts/SocialContext';
import { UserPlus, User } from 'lucide-react';

export function UserSuggestions() {
  const { users, followUser, loading } = useSocial();
  const [suggestedUsers, setSuggestedUsers] = useState<SocialUser[]>([]);
  
  useEffect(() => {
    // Filtruj i ustaw sugerowanych użytkowników
    const nonConnectedUsers = users
      .filter(user => !user.isCurrentUser && user.connectionStatus === 'none')
      .slice(0, 3); // Tylko 3 sugestie
    
    setSuggestedUsers(nonConnectedUsers);
  }, [users]);
  
  if (loading) {
    return (
      <div className="glass-card rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Sugerowane dla Ciebie</h3>
        <div className="space-y-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="animate-pulse flex items-center gap-3">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (suggestedUsers.length === 0) return null;
  
  return (
    <div className="glass-card rounded-xl border p-5">
      <h3 className="font-semibold mb-4">Sugerowane dla Ciebie</h3>
      <div className="space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-rhythm-500 truncate">{user.role}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-shrink-0 gap-1.5"
              onClick={() => followUser(user.id)}
            >
              <UserPlus className="h-4 w-4" />
              Obserwuj
            </Button>
          </div>
        ))}
      </div>
      <Button variant="link" size="sm" className="w-full mt-2" asChild>
        <a href="/connections">Zobacz więcej sugestii</a>
      </Button>
    </div>
  );
}
