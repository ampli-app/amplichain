
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';
import { 
  Pencil, 
  MapPin, 
  Globe, 
  Calendar, 
  MailIcon, 
  BriefcaseIcon, 
  GraduationCapIcon,
  FolderIcon, 
  Users,
  Music,
  Share2,
  ExternalLink
} from 'lucide-react';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  website: string;
  role: string;
  joined_date: string;
  followers: number;
  following: number;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  tags: string[];
}

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { 
    currentUser, 
    fetchUserProfile,
    followUser, 
    unfollowUser, 
    sendConnectionRequest, 
    removeConnection
  } = useSocial();

  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userProducts, setUserProducts] = useState([]);
  const [userEducation, setUserEducation] = useState<Education[]>([]);
  const [userExperience, setUserExperience] = useState<Experience[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received'>('none');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn && !userId) {
      navigate('/login');
      return;
    }
    
    // Determine if we're looking at our own profile or someone else's
    const targetUserId = userId || (user && user.id);
    if (user && targetUserId === user.id) {
      setIsOwnProfile(true);
    } else {
      setIsOwnProfile(false);
    }
    
    if (targetUserId) {
      fetchProfileData(targetUserId);
    }
  }, [isLoggedIn, navigate, userId, user]);

  const fetchProfileData = async (profileId: string) => {
    setIsLoading(true);
    try {
      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych profilu.",
          variant: "destructive",
        });
      } else if (data) {
        setProfileData(data);
        
        // Try to get connection status via Social Context
        if (!isOwnProfile && currentUser) {
          const socialProfile = fetchUserProfile(profileId);
          if (socialProfile) {
            setConnectionStatus(socialProfile.connectionStatus || 'none');
          }
        }
      }

      // Fetch user's products
      if (isOwnProfile) {
        fetchUserProducts(profileId);
      }
      
      // Fetch education, experience and projects
      fetchEducation(profileId);
      fetchExperience(profileId);
      fetchProjects(profileId);
      
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProducts = async (userId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user products:', error);
    } else {
      setUserProducts(data || []);
    }
  };
  
  const fetchEducation = async (profileId: string) => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('profile_id', profileId);
      
    if (error) {
      console.error('Error fetching education:', error);
    } else {
      setUserEducation(data || []);
    }
  };
  
  const fetchExperience = async (profileId: string) => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('profile_id', profileId);
      
    if (error) {
      console.error('Error fetching experience:', error);
    } else {
      setUserExperience(data || []);
    }
  };
  
  const fetchProjects = async (profileId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', profileId);
      
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setUserProjects(data || []);
    }
  };

  const handleConnectionAction = () => {
    if (!userId) return;
    
    switch (connectionStatus) {
      case 'none':
        sendConnectionRequest(userId);
        setConnectionStatus('pending_sent');
        break;
      case 'following':
        unfollowUser(userId);
        setConnectionStatus('none');
        break;
      case 'connected':
        removeConnection(userId);
        setConnectionStatus('none');
        break;
      case 'pending_sent':
        // Cancel request functionality would go here
        setConnectionStatus('none');
        break;
      // For pending_received, the user should accept/decline via notifications
    }
  };
  
  const handleFollow = () => {
    if (!userId) return;
    
    if (connectionStatus === 'following') {
      unfollowUser(userId);
      setConnectionStatus('none');
    } else {
      followUser(userId);
      setConnectionStatus('following');
    }
  };
  
  const handleShareProfile = () => {
    const profileUrl = window.location.href;
    
    navigator.clipboard.writeText(profileUrl).then(
      () => {
        toast({
          title: "Link skopiowany",
          description: "Link do profilu został skopiowany do schowka.",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Błąd",
          description: "Nie udało się skopiować linku.",
          variant: "destructive",
        });
      }
    );
  };

  const handleProfileUpdated = () => {
    if (user) {
      fetchProfileData(user.id);
    }
  };

  const loadProductForEditing = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Ładowanie profilu...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {/* Profile Header */}
          <div className="bg-card border rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-xl">
                  <img 
                    src={profileData?.avatar_url || '/placeholder.svg'} 
                    alt={profileData?.full_name || 'User'} 
                    className="object-cover"
                  />
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {profileData?.full_name || "Użytkownik"}
                    </h1>
                    
                    <div className="flex items-center text-muted-foreground mb-2">
                      <span className="text-sm">@{profileData?.username || "użytkownik"}</span>
                      {profileData?.role && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-sm">{profileData.role}</span>
                        </>
                      )}
                    </div>
                    
                    {profileData?.bio && (
                      <p className="text-muted-foreground mt-2 mb-4 max-w-2xl">
                        {profileData.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      {profileData?.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{profileData.location}</span>
                        </div>
                      )}
                      
                      {profileData?.website && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 mr-1" />
                          <a 
                            href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {profileData.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      
                      {profileData?.joined_date && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Dołączył {new Date(profileData.joined_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center">
                        <span className="font-semibold mr-1">{profileData?.followers || 0}</span>
                        <span className="text-muted-foreground">Obserwujących</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-1">{profileData?.following || 0}</span>
                        <span className="text-muted-foreground">Obserwuje</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                    {isOwnProfile ? (
                      <Button 
                        onClick={() => setIsEditProfileOpen(true)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edytuj profil
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant={connectionStatus === 'connected' || connectionStatus === 'pending_sent' ? "outline" : "default"}
                          className="gap-2 w-full"
                          onClick={handleConnectionAction}
                        >
                          <Users className="h-4 w-4" />
                          {connectionStatus === 'connected' ? "Usuń z kontaktów" :
                           connectionStatus === 'pending_sent' ? "Anuluj zaproszenie" :
                           connectionStatus === 'pending_received' ? "Odpowiedz na zaproszenie" :
                           "Dodaj do kontaktów"}
                        </Button>
                        
                        <Button 
                          variant={connectionStatus === 'following' ? "outline" : "secondary"}
                          className="gap-2 w-full"
                          onClick={handleFollow}
                        >
                          {connectionStatus === 'following' ? "Obserwujesz" : "Obserwuj"}
                        </Button>
                      </div>
                    )}
                    
                    <Button variant="ghost" size="sm" onClick={handleShareProfile}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Udostępnij profil
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs and Content */}
          <Tabs defaultValue="portfolio" className="mb-8">
            <TabsList className="mb-6 grid grid-cols-4 max-w-xl">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="products">Produkty</TabsTrigger>
              <TabsTrigger value="experience">Doświadczenie</TabsTrigger>
              <TabsTrigger value="education">Edukacja</TabsTrigger>
            </TabsList>
            
            {/* Portfolio Tab */}
            <TabsContent value="portfolio">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Projekty i portfolio</h2>
                  {isOwnProfile && (
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Dodaj projekt
                    </Button>
                  )}
                </div>
                
                {userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.map((project) => (
                      <Card key={project.id} className="overflow-hidden">
                        {project.image_url && (
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={project.image_url} 
                              alt={project.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle>{project.title}</CardTitle>
                          {project.date && (
                            <CardDescription>{project.date}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {project.description && (
                            <p className="text-muted-foreground mb-4">{project.description}</p>
                          )}
                          
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-lg bg-background">
                    <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-medium mt-4">Brak projektów</h3>
                    <p className="text-muted-foreground mt-2">
                      {isOwnProfile ? "Dodaj swoje projekty i portfolio, aby pokazać swoje umiejętności." : "Ten użytkownik nie ma jeszcze żadnych projektów w portfolio."}
                    </p>
                    {isOwnProfile && (
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-1" />
                        Dodaj pierwszy projekt
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Products Tab */}
            <TabsContent value="products">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Produkty</h2>
                  {isOwnProfile && (
                    <Button size="sm" onClick={() => navigate('/marketplace')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Dodaj produkt
                    </Button>
                  )}
                </div>
                
                {userProducts.length > 0 ? (
                  <div className="space-y-4">
                    {userProducts.map((product) => (
                      <div key={product.id} className="border p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-medium">{product.title}</h3>
                            <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge>{product.category || "Inne"}</Badge>
                              <span className="font-medium">
                                {new Intl.NumberFormat('pl-PL', {
                                  style: 'currency',
                                  currency: 'PLN'
                                }).format(product.price)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/marketplace/${product.id}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Zobacz
                            </Button>
                            
                            {isOwnProfile && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => loadProductForEditing(product.id)}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edytuj
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-lg bg-background">
                    <Music className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-medium mt-4">Brak produktów</h3>
                    <p className="text-muted-foreground mt-2">
                      {isOwnProfile ? "Dodaj swoje produkty do Rynku." : "Ten użytkownik nie ma jeszcze żadnych produktów na sprzedaż."}
                    </p>
                    {isOwnProfile && (
                      <Button className="mt-4" onClick={() => navigate('/marketplace')}>
                        <Plus className="h-4 w-4 mr-1" />
                        Dodaj pierwszy produkt
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Experience Tab */}
            <TabsContent value="experience">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Doświadczenie zawodowe</h2>
                  {isOwnProfile && (
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Dodaj doświadczenie
                    </Button>
                  )}
                </div>
                
                {userExperience.length > 0 ? (
                  <div className="space-y-6">
                    {userExperience.map((exp) => (
                      <div key={exp.id} className="border p-6 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                <BriefcaseIcon className="h-6 w-6" />
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-medium">{exp.position}</h3>
                              <p className="text-lg text-muted-foreground">{exp.company}</p>
                              <p className="text-sm text-muted-foreground mt-1">{exp.period}</p>
                            </div>
                          </div>
                          
                          {isOwnProfile && (
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-lg bg-background">
                    <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-medium mt-4">Brak doświadczenia</h3>
                    <p className="text-muted-foreground mt-2">
                      {isOwnProfile ? "Dodaj swoje doświadczenie zawodowe, aby pokazać swoją historię pracy." : "Ten użytkownik nie dodał jeszcze żadnego doświadczenia zawodowego."}
                    </p>
                    {isOwnProfile && (
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-1" />
                        Dodaj doświadczenie
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Education Tab */}
            <TabsContent value="education">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Edukacja</h2>
                  {isOwnProfile && (
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Dodaj edukację
                    </Button>
                  )}
                </div>
                
                {userEducation.length > 0 ? (
                  <div className="space-y-6">
                    {userEducation.map((edu) => (
                      <div key={edu.id} className="border p-6 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                <GraduationCapIcon className="h-6 w-6" />
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-xl font-medium">{edu.institution}</h3>
                              <p className="text-lg text-muted-foreground">{edu.degree}</p>
                              <p className="text-sm text-muted-foreground mt-1">{edu.year}</p>
                            </div>
                          </div>
                          
                          {isOwnProfile && (
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-lg bg-background">
                    <GraduationCapIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-medium mt-4">Brak edukacji</h3>
                    <p className="text-muted-foreground mt-2">
                      {isOwnProfile ? "Dodaj swoją historię edukacji, aby pokazać swoje wykształcenie." : "Ten użytkownik nie dodał jeszcze żadnej historii edukacji."}
                    </p>
                    {isOwnProfile && (
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-1" />
                        Dodaj edukację
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      {/* Edit Profile Modal */}
      {profileData && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onProfileUpdated={handleProfileUpdated}
          currentProfile={profileData}
        />
      )}
    </div>
  );
}
