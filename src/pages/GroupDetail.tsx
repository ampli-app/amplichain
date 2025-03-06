
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupPostCreate } from '@/components/groups/GroupPostCreate';
import { GroupTabs } from '@/components/groups/GroupTabs';
import { Group } from '@/types/group';
import { Loader2, Lock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, user } = useAuth();
  const { loading: socialLoading } = useSocial();
  const [group, setGroup] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinRequestPending, setJoinRequestPending] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Pobierz dane grupy z Supabase
    const fetchGroup = async () => {
      if (!id) return;
      
      setLoadingGroup(true);
      try {
        console.log('Pobieranie grupy o ID:', id);
        
        // Pobierz dane grupy
        const { data: groupData, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error('Błąd podczas pobierania grupy:', error);
          setLoadingGroup(false);
          return;
        }
        
        if (!groupData) {
          console.log('Grupa nie znaleziona');
          setLoadingGroup(false);
          return;
        }
        
        console.log('Pobrane dane grupy:', groupData);
        
        // Pobierz liczbę członków w osobnym zapytaniu
        const { count: memberCount, error: membersError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', id);
          
        if (membersError) {
          console.error('Błąd podczas pobierania liczby członków:', membersError);
        }
        
        console.log('Liczba członków:', memberCount);
        
        // Sprawdź, czy zalogowany użytkownik jest członkiem grupy i jaką ma rolę
        let userIsMember = false;
        let userIsAdmin = false;
        let hasJoinRequest = false;
        
        if (user?.id) {
          try {
            // Bezpośrednie zapytanie o członkostwo zamiast funkcji SQL
            const { data: memberData, error: memberError } = await supabase
              .from('group_members')
              .select('role')
              .eq('group_id', id)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (memberError) {
              console.error('Błąd podczas sprawdzania członkostwa:', memberError);
            } else {
              console.log('Dane członkostwa użytkownika:', memberData);
              userIsMember = !!memberData;
              userIsAdmin = memberData?.role === 'admin';
            }
            
            // Sprawdź czy istnieje oczekująca prośba o dołączenie
            if (groupData.is_private && !userIsMember) {
              const { data: requestData, error: requestError } = await supabase
                .from('group_join_requests')
                .select('status')
                .eq('group_id', id)
                .eq('user_id', user.id)
                .eq('status', 'pending')
                .maybeSingle();
                
              if (!requestError && requestData) {
                hasJoinRequest = true;
              }
            }
          } catch (memberError) {
            console.error('Błąd podczas sprawdzania członkostwa:', memberError);
          }
        }
        
        setIsMember(userIsMember);
        setIsAdmin(userIsAdmin);
        setJoinRequestPending(hasJoinRequest);
        
        // Przetwórz dane na format Group
        const formattedGroup: Group = {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description || '',
          coverImage: groupData.cover_image || '',
          profileImage: groupData.profile_image || '',
          memberCount: memberCount || 0,
          category: groupData.category || '',
          isPrivate: groupData.is_private || false,
          isMember: userIsMember,
          isAdmin: userIsAdmin,
          createdAt: new Date(groupData.created_at).toISOString(),
          posts: [],
          members: [],
          media: [],
          files: []
        };
        
        console.log('Sformatowana grupa:', formattedGroup);
        setGroup(formattedGroup);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoadingGroup(false);
      }
    };
    
    fetchGroup();
  }, [id, user?.id]);

  if (loadingGroup) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-medium">Ładowanie grupy...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Grupa nie została znaleziona</h2>
            <p className="mb-6">Przepraszamy, ale grupa o podanym identyfikatorze nie istnieje lub została usunięta.</p>
            <Link 
              to="/groups" 
              className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Wróć do listy grup
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Wyświetlenie ograniczonego widoku dla grupy prywatnej
  const showLimitedView = group.isPrivate && !isMember && !isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 pb-16">
        <GroupHeader group={group} />
        
        {showLimitedView ? (
          <div className="container px-4 mx-auto mt-12">
            <div className="max-w-2xl mx-auto bg-background rounded-xl border p-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Grupa prywatna</h2>
              <p className="text-muted-foreground mb-6">
                Ta grupa jest prywatna. Musisz być członkiem grupy, aby uzyskać dostęp do jej zawartości.
              </p>
              
              {isLoggedIn ? (
                <Button 
                  size="lg" 
                  className="mx-auto gap-2"
                  disabled={joinRequestPending}
                  onClick={() => {
                    // Symulacja kliknięcia przycisku dołączenia w nagłówku
                    const joinButton = document.querySelector('[data-join-button]') as HTMLButtonElement;
                    if (joinButton) joinButton.click();
                  }}
                >
                  <User className="h-4 w-4" />
                  {joinRequestPending ? 'Prośba wysłana' : 'Poproś o dołączenie do grupy'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Zaloguj się, aby poprosić o dołączenie do tej grupy</p>
                  <Link to="/login">
                    <Button>Zaloguj się</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="container px-4 mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar - visible only on large screens */}
              <div className="hidden lg:block">
                <div className="space-y-6 sticky top-24">
                  <div className="bg-background rounded-xl border shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-3">O grupie</h3>
                    <p className="text-rhythm-600 mb-4">{group.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-rhythm-500">Kategoria:</span>
                        <span className="font-medium">{group.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rhythm-500">Członkowie:</span>
                        <span className="font-medium">{group.memberCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rhythm-500">Utworzono:</span>
                        <span className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rhythm-500">Typ grupy:</span>
                        <span className="font-medium">{group.isPrivate ? 'Prywatna' : 'Publiczna'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Post creation form moved above tabs but only visible when Posts tab is active */}
                {group.isMember && activeTab === "posts" && (
                  <GroupPostCreate group={group} />
                )}
                
                <GroupTabs group={group} activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
