
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSocial } from '@/contexts/SocialContext';
import { UserPlus, User } from 'lucide-react';

export function UserSuggestions() {
  const { users, followUser } = useSocial();
  
  // Filter to show only users not being followed or connected
  const suggestedUsers = users
    .filter(user => !user.isCurrentUser && user.connectionStatus === 'none')
    .slice(0, 3); // Show only 3 suggestions
  
  if (suggestedUsers.length === 0) return null;
  
  return (
    <div className="glass-card rounded-xl border p-5">
      <h3 className="font-semibold mb-4">Suggested for you</h3>
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
              Follow
            </Button>
          </div>
        ))}
      </div>
      <Button variant="link" size="sm" className="w-full mt-2">
        View more suggestions
      </Button>
    </div>
  );
}
