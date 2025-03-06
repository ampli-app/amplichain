
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GroupMember } from '@/types/group';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';

interface GroupMembersListProps {
  members: GroupMember[];
  searchQuery: string;
}

export function GroupMembersList({ members, searchQuery }: GroupMembersListProps) {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (filteredMembers.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">Brak członków</h3>
            <p className="text-muted-foreground">Ta grupa nie ma jeszcze członków.</p>
          </>
        )}
      </div>
    );
  }
  
  const toggleFollow = (memberId: string) => {
    setFollowStates(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };
  
  const getRoleBadge = (role: 'admin' | 'moderator' | 'member') => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary">Administrator</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500">Moderator</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="p-4">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${member.id}`} className="font-medium hover:underline">
                  {member.name}
                </Link>
                {getRoleBadge(member.role)}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Dołączył(a): {new Date(member.joinedAt).toLocaleDateString()}
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  variant={followStates[member.id] ? "outline" : "default"} 
                  size="sm"
                  className="gap-1.5"
                  onClick={() => toggleFollow(member.id)}
                >
                  {followStates[member.id] ? 'Obserwujesz' : 'Obserwuj'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  asChild
                >
                  <Link to={`/messages/user/${member.id}`}>
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
