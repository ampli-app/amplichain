
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Shield, User, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Member = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
};

interface GroupMembersListProps {
  groupId: string;
  searchQuery: string;
}

export function GroupMembersList({ groupId, searchQuery }: GroupMembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Pobierz ID zalogowanego użytkownika
        const { data: { user } } = await supabase.auth.getUser();
        
        // Pobierz członków grupy
        const { data: membersData, error } = await supabase
          .from('group_members')
          .select(`
            id,
            role,
            joined_at,
            user_id,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .order('joined_at', { ascending: true });
          
        if (error) {
          console.error('Błąd podczas pobierania członków:', error);
          return;
        }
        
        // Sprawdź, czy zalogowany użytkownik jest administratorem grupy
        if (user) {
          const isAdmin = membersData.some(member => 
            member.user_id === user.id && member.role === 'admin'
          );
          setIsGroupAdmin(isAdmin);
        }
        
        // Przetwórz dane na format Member
        const formattedMembers: Member[] = membersData.map(member => {
          const profile = member.profiles;
          return {
            id: member.id,
            user: {
              id: member.user_id,
              name: profile.full_name || 'Użytkownik',
              avatar: profile.avatar_url || '',
            },
            role: member.role as 'admin' | 'moderator' | 'member',
            joinedAt: new Date(member.joined_at).toLocaleDateString(),
          };
        });
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [groupId]);
  
  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('id', memberId);
        
      if (error) {
        console.error('Błąd podczas zmiany roli:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zmienić roli użytkownika",
          variant: "destructive"
        });
        return;
      }
      
      // Aktualizuj lokalny stan
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole } 
          : member
      ));
      
      toast({
        title: "Sukces",
        description: "Rola użytkownika została zmieniona",
      });
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveMember = async (memberId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);
        
      if (error) {
        console.error('Błąd podczas usuwania członka:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć użytkownika z grupy",
          variant: "destructive"
        });
        return;
      }
      
      // Aktualizuj lokalny stan
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Sukces",
        description: `${userName} został usunięty z grupy`,
      });
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive"
      });
    }
  };

  // Filtrowanie członków na podstawie zapytania
  const filteredMembers = members.filter(member => 
    member.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
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
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-2">Brak członków</h3>
            <p className="text-muted-foreground">Ta grupa nie ma jeszcze członków</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMembers.map(member => (
        <Card key={member.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {member.user.name}
                    {member.role === 'admin' && (
                      <Badge variant="default" className="bg-red-500 text-xs py-0 px-1.5">
                        Admin
                      </Badge>
                    )}
                    {member.role === 'moderator' && (
                      <Badge variant="outline" className="text-xs py-0 px-1.5 border-blue-500 text-blue-500">
                        Moderator
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dołączył {member.joinedAt}
                  </div>
                </div>
              </div>
              
              {/* Dropdown menu z opcjami zarządzania */}
              {isGroupAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== 'admin' && (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                        <Shield className="h-4 w-4 mr-2 text-red-500" />
                        Uczyń administratorem
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'moderator' && member.role !== 'admin' && (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'moderator')}>
                        <Shield className="h-4 w-4 mr-2 text-blue-500" />
                        Uczyń moderatorem
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'member' && (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                        <User className="h-4 w-4 mr-2" />
                        Ustaw jako zwykłego członka
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleRemoveMember(member.id, member.user.name)}
                      className="text-red-500"
                    >
                      Usuń z grupy
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
