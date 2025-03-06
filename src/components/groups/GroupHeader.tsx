
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/group';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Bell, BellOff, Share2, User, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GroupHeaderProps {
  group: Group;
}

export function GroupHeader({ group }: GroupHeaderProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isJoined, setIsJoined] = useState(group.isMember);
  const [joinRequestPending, setJoinRequestPending] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
        
        // Sprawdź bezpośrednio członkostwo w grupie przy ładowaniu
        if (user.id) {
          const checkMembership = async () => {
            try {
              const { data, error } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', group.id)
                .eq('user_id', user.id)
                .maybeSingle();
                
              if (error) {
                console.error('Błąd podczas sprawdzania członkostwa:', error);
                return;
              }
              
              // Aktualizuj stan na podstawie bezpośredniego sprawdzenia w bazie
              setIsJoined(!!data);
              
              // Pobierz ustawienia powiadomień, jeśli użytkownik jest członkiem
              if (data) {
                setIsNotificationsEnabled(data.notifications_enabled);
              }
            } catch (err) {
              console.error('Nieoczekiwany błąd podczas sprawdzania członkostwa:', err);
            }
          };
          checkMembership();
          
          // Sprawdź czy istnieje oczekująca prośba dołączenia do grupy
          if (group.isPrivate) {
            const checkJoinRequest = async () => {
              try {
                const { data, error } = await supabase
                  .from('group_join_requests')
                  .select('status')
                  .eq('group_id', group.id)
                  .eq('user_id', user.id)
                  .eq('status', 'pending')
                  .maybeSingle();
                  
                if (error) {
                  console.error('Błąd podczas sprawdzania prośby o dołączenie:', error);
                  return;
                }
                
                setJoinRequestPending(!!data);
              } catch (err) {
                console.error('Nieoczekiwany błąd podczas sprawdzania prośby o dołączenie:', err);
              }
            };
            checkJoinRequest();
          }
        }
      }
    };
    
    checkUser();
  }, [group.id, group.isPrivate]);
  
  const handleJoinGroup = async () => {
    if (!isLoggedIn || !currentUser) {
      toast({
        title: "Wymagane logowanie",
        description: "Zaloguj się, aby dołączyć do grupy",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Sprawdź najpierw czy użytkownik już jest członkiem
      const { data: existingMembership, error: checkError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .eq('user_id', currentUser)
        .maybeSingle();
        
      if (checkError) {
        console.error('Błąd podczas sprawdzania członkostwa:', checkError);
      }
      
      // Jeśli użytkownik już jest członkiem, zaktualizuj stan i zakończ
      if (existingMembership) {
        setIsJoined(true);
        toast({
          title: "Już jesteś członkiem",
          description: `Już należysz do grupy "${group.name}"`,
        });
        return;
      }
      
      // Sprawdź czy grupa jest prywatna
      if (group.isPrivate) {
        // Sprawdź czy już istnieje prośba o dołączenie
        const { data: existingRequest, error: requestCheckError } = await supabase
          .from('group_join_requests')
          .select('*')
          .eq('group_id', group.id)
          .eq('user_id', currentUser)
          .maybeSingle();
          
        if (requestCheckError) {
          console.error('Błąd podczas sprawdzania prośby o dołączenie:', requestCheckError);
        }
        
        // Jeśli prośba już istnieje, poinformuj użytkownika
        if (existingRequest) {
          if (existingRequest.status === 'pending') {
            setJoinRequestPending(true);
            toast({
              title: "Prośba już wysłana",
              description: `Twoja prośba o dołączenie do "${group.name}" oczekuje na akceptację.`
            });
          } else if (existingRequest.status === 'rejected') {
            toast({
              title: "Prośba odrzucona",
              description: `Twoja prośba o dołączenie do "${group.name}" została wcześniej odrzucona.`,
              variant: "destructive"
            });
          }
          return;
        }
        
        // Dodaj prośbę o dołączenie dla grupy prywatnej
        const { error: requestError } = await supabase
          .from('group_join_requests')
          .insert({
            group_id: group.id,
            user_id: currentUser,
            status: 'pending'
          });
          
        if (requestError) {
          console.error('Błąd podczas wysyłania prośby o dołączenie:', requestError);
          toast({
            title: "Błąd",
            description: "Nie udało się wysłać prośby o dołączenie do grupy",
            variant: "destructive"
          });
          return;
        }
        
        setJoinRequestPending(true);
        toast({
          title: "Prośba wysłana",
          description: `Twoja prośba o dołączenie do "${group.name}" została wysłana.`
        });
        return;
      }
      
      // Dla grup publicznych, dodaj użytkownika od razu
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: currentUser,
          role: 'member'
        });
        
      if (error) {
        console.error('Błąd podczas dołączania do grupy:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się dołączyć do grupy",
          variant: "destructive"
        });
        return;
      }
      
      setIsJoined(true);
      toast({
        title: "Dołączono do grupy",
        description: `Zostałeś członkiem grupy "${group.name}"`,
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
  
  const handleLeaveGroup = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', currentUser);
        
      if (error) {
        console.error('Błąd podczas opuszczania grupy:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się opuścić grupy",
          variant: "destructive"
        });
        return;
      }
      
      setIsJoined(false);
      toast({
        title: "Opuszczono grupę",
        description: `Opuściłeś grupę "${group.name}"`,
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
  
  const toggleNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ notifications_enabled: !isNotificationsEnabled })
        .eq('group_id', group.id)
        .eq('user_id', currentUser);
        
      if (error) {
        console.error('Błąd podczas aktualizacji powiadomień:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować ustawień powiadomień",
          variant: "destructive"
        });
        return;
      }
      
      setIsNotificationsEnabled(!isNotificationsEnabled);
      toast({
        title: isNotificationsEnabled ? "Powiadomienia wyłączone" : "Powiadomienia włączone",
        description: isNotificationsEnabled 
          ? "Nie będziesz otrzymywać powiadomień z tej grupy" 
          : "Będziesz otrzymywać powiadomienia z tej grupy",
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
  
  const handleShareGroup = () => {
    const groupUrl = `${window.location.origin}/groups/${group.id}`;
    navigator.clipboard.writeText(groupUrl);
    toast({
      title: "Link skopiowany",
      description: "Link do grupy został skopiowany do schowka.",
    });
  };
  
  const handleViewMembers = () => {
    // When clicking on members, scroll to members tab or open members modal
    document.getElementById('members-tab')?.click();
  };

  return (
    <div className="relative">
      {/* Cover image */}
      <div className="h-48 md:h-64 lg:h-80 w-full overflow-hidden relative">
        <img 
          src={group.coverImage}
          alt={`Okładka grupy ${group.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      {/* Group info */}
      <div className="container px-4 mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end -mt-20 md:-mt-16 pb-4 relative z-10">
          {/* Profile image */}
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-background shadow-lg">
              <AvatarImage 
                src={group.profileImage || group.coverImage} 
                alt={group.name} 
                className="object-cover"
              />
              <AvatarFallback className="text-4xl">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Group details */}
          <div className="flex-grow">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
                    {group.isPrivate && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={group.isPrivate ? "outline" : "secondary"}>
                      {group.isPrivate ? 'Prywatna' : 'Publiczna'}
                    </Badge>
                    <div 
                      className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={handleViewMembers}
                    >
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount} {group.memberCount === 1 ? 'członek' : 
                        group.memberCount % 10 >= 2 && group.memberCount % 10 <= 4 && 
                        (group.memberCount % 100 < 10 || group.memberCount % 100 > 20) ? 
                        'członków' : 'członków'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => {/* Open group settings */}}
                    >
                      <Settings className="h-4 w-4" />
                      Ustawienia
                    </Button>
                  )}
                  
                  {isJoined ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={toggleNotifications}
                      >
                        {isNotificationsEnabled ? (
                          <>
                            <BellOff className="h-4 w-4" />
                            <span className="hidden sm:inline">Wyłącz powiadomienia</span>
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Włącz powiadomienia</span>
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 hover:bg-red-100 dark:hover:bg-red-950"
                        onClick={handleLeaveGroup}
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Opuść grupę</span>
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="gap-1"
                      onClick={handleJoinGroup}
                      disabled={joinRequestPending}
                    >
                      <User className="h-4 w-4" />
                      {group.isPrivate 
                        ? (joinRequestPending ? 'Prośba wysłana' : 'Poproś o dołączenie') 
                        : 'Dołącz do grupy'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleShareGroup}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
