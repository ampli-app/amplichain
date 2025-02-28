import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AddExperienceModal } from '@/components/profile/AddExperienceModal';
import { AddEducationModal } from '@/components/profile/AddEducationModal';
import { AddProjectModal } from '@/components/profile/AddProjectModal';
import { UserSuggestions } from '@/components/UserSuggestions';
import { useSocial, SocialUser } from '@/contexts/SocialContext';
import { 
  UserPlus, Globe, MapPin, Mail, Calendar, 
  Briefcase, GraduationCap, Plus, PlusCircle, 
  Link as LinkIcon, Pencil, Eye, Package, Calendar as CalendarIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AddProductDialog } from '@/components/AddProductDialog';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, fetchUserProfile } = useSocial();
  const [profile, setProfile] = useState<SocialUser | null>(null);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [productIdToEdit, setProductIdToEdit] = useState<string | undefined>(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (userId) {
      const userProfile = fetchUserProfile(userId);
      setProfile(userProfile);
      setIsCurrentUserProfile(user?.id === userId);
    } else {
      // If no userId is provided, it's the current user's profile
      const currentUserProfile = users.find(u => u.isCurrentUser === true);
      setProfile(currentUserProfile as SocialUser);
      setIsCurrentUserProfile(true);
    }
  }, [userId, user, fetchUserProfile, users]);

  useEffect(() => {
    if (user?.id && isCurrentUserProfile) {
      fetchUserProducts(user.id);
    }
  }, [user, isCurrentUserProfile]);

  const fetchUserProducts = async (userId: string) => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
      if (error) {
        console.error('Error fetching user products:', error);
      } else {
        setUserProducts(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadProductForEditing = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
    
      if (error) {
        console.error('Error fetching product for editing:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować produktu do edycji.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Set the product ID for editing and open the dialog
        setProductIdToEdit(productId);
        setShowAddProductDialog(true);
        
        toast({
          title: "Edytuj produkt",
          description: "Możesz teraz edytować szczegóły produktu.",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Profil nie znaleziony</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Przepraszamy, ale profil, którego szukasz, nie istnieje.
            </p>
            <Button onClick={() => navigate('/')}>
              Wróć na stronę główną
            </Button>
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
          <Card className="glass-card rounded-xl border mb-8">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-rhythm-600">{profile.role}</p>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-1 text-rhythm-500">
                    <UserPlus className="h-4 w-4" />
                    {profile.followersCount} Obserwujący
                  </div>
                  <div className="flex items-center gap-1 text-rhythm-500">
                    <UserPlus className="h-4 w-4" />
                    {profile.followingCount} Obserwowani
                  </div>
                  <div className="flex items-center gap-1 text-rhythm-500">
                    <UserPlus className="h-4 w-4" />
                    {profile.connectionsCount} Znajomi
                  </div>
                </div>
                
                {isCurrentUserProfile && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    Edytuj profil
                  </Button>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="px-8 pb-8">
              <div className="flex items-center gap-4 text-rhythm-500">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a href="#" className="hover:text-primary transition-colors">amplichain.com/{profile.username}</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Polska
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${profile.username}@amplichain.com`} className="hover:text-primary transition-colors">{profile.username}@amplichain.com</a>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <Tabs defaultValue="portfolio" className="mb-12">
            <TabsList className="rounded-full bg-muted/50 p-1 flex w-full justify-center">
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Portfolio</TabsTrigger>
              <TabsTrigger value="connections" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Znajomi</TabsTrigger>
            </TabsList>
            
            <Separator className="my-4" />
            
            <TabsContent value="portfolio" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass-card rounded-xl border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">O mnie</h3>
                    <p className="text-rhythm-600">
                      {profile.bio || "Brak informacji o użytkowniku."}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6">
                    <div className="flex items-center gap-2 text-rhythm-500">
                      <Calendar className="h-4 w-4" />
                      Dołączył {new Date().toLocaleDateString()}
                    </div>
                  </CardFooter>
                </Card>
                
                <Card className="glass-card rounded-xl border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Doświadczenie</h3>
                      {isCurrentUserProfile && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsAddExperienceOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj
                        </Button>
                      )}
                    </div>
                    
                    {experiences.length > 0 ? (
                      <ul className="space-y-4">
                        {experiences.map((exp) => (
                          <li key={exp.id} className="border-b pb-4 last:border-0">
                            <h4 className="font-medium">{exp.title}</h4>
                            <p className="text-sm text-rhythm-500">{exp.company} - {exp.location}</p>
                            <p className="text-sm text-rhythm-500">{exp.startDate} - {exp.endDate || 'Obecnie'}</p>
                            {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Brak doświadczenia</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="glass-card rounded-xl border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Wykształcenie</h3>
                      {isCurrentUserProfile && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsAddEducationOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj
                        </Button>
                      )}
                    </div>
                    
                    {educations.length > 0 ? (
                      <ul className="space-y-4">
                        {educations.map((edu) => (
                          <li key={edu.id} className="border-b pb-4 last:border-0">
                            <h4 className="font-medium">{edu.degree} w {edu.fieldOfStudy}</h4>
                            <p className="text-sm text-rhythm-500">{edu.school}</p>
                            <p className="text-sm text-rhythm-500">{edu.startDate} - {edu.endDate || 'Obecnie'}</p>
                            {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <GraduationCap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Brak wykształcenia</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="glass-card rounded-xl border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Projekty</h3>
                      {isCurrentUserProfile && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsAddProjectOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj
                        </Button>
                      )}
                    </div>
                    
                    {projects.length > 0 ? (
                      <ul className="space-y-4">
                        {projects.map((project) => (
                          <li key={project.id} className="border-b pb-4 last:border-0">
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-rhythm-600">{project.description}</p>
                            {project.link && (
                              <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                                <LinkIcon className="h-4 w-4" />
                                Zobacz projekt
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Brak projektów</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

{isCurrentUserProfile && (
  <div className="mt-10">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold">Moje produkty na sprzedaż</h3>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowAddProductDialog(true)}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Dodaj produkt
      </Button>
    </div>
    
    {isLoadingProducts ? (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    ) : userProducts.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProducts.map((product) => (
          <div key={product.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300">
            <Link to={`/marketplace/${product.id}`}>
              <div className="relative aspect-square bg-rhythm-100">
                <img 
                  src={product.image_url || '/placeholder.svg'} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
                {product.for_testing && (
                  <Badge className="absolute top-2 right-2 bg-primary/10 text-primary border-primary/20">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    Dostępne do testów
                  </Badge>
                )}
              </div>
            </Link>
            
            <div className="p-4">
              <div className="flex items-center mb-2">
                <Badge variant="outline">{product.category || "Inne"}</Badge>
              </div>
              
              <Link to={`/marketplace/${product.id}`}>
                <h3 className="font-medium mb-2 hover:text-primary transition-colors">{product.title}</h3>
              </Link>
              
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN'
                  }).format(product.price)}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    asChild
                  >
                    <Link to={`/marketplace/${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => navigate(`/profile/edit-product/${product.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-10 border rounded-xl bg-muted/20">
        <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">Nie masz jeszcze produktów</h3>
        <p className="text-muted-foreground mb-4">Dodaj swój pierwszy produkt na sprzedaż</p>
        <Button 
          onClick={() => setShowAddProductDialog(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Dodaj produkt
        </Button>
      </div>
    )}
  </div>
)}
            </TabsContent>
            
            <TabsContent value="connections">
              <h3 className="text-xl font-bold mb-4">Znajomi</h3>
              
              {users.length > 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.id !== profile.id).map((user) => (
                    <Card key={user.id} className="glass-card rounded-xl border">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-4">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <h3 className="text-lg font-medium">{user.name}</h3>
                        <p className="text-rhythm-600">{user.role}</p>
                      </CardContent>
                      <CardFooter className="p-6 flex justify-center">
                        <Button asChild>
                          <Link to={`/profile/${user.id}`}>
                            Zobacz profil
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Brak znajomych</p>
                </div>
              )}
              
              {isCurrentUserProfile && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Sugestie</h3>
                  <UserSuggestions />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        onProfileUpdated={() => {}} 
        currentProfile={profile} 
      />
      
      <AddExperienceModal 
        isOpen={isAddExperienceOpen} 
        onClose={() => setIsAddExperienceOpen(false)} 
        onExperienceAdded={() => {}} 
      />
      
      <AddEducationModal 
        isOpen={isAddEducationOpen} 
        onClose={() => setIsAddEducationOpen(false)} 
        onEducationAdded={() => {}} 
      />
      
      <AddProjectModal 
        isOpen={isAddProjectOpen} 
        onClose={() => setIsAddProjectOpen(false)} 
        onProjectAdded={() => {}} 
      />

      <AddProductDialog 
        open={showAddProductDialog} 
        onOpenChange={setShowAddProductDialog} 
        productId={productIdToEdit}
      />
    </div>
  );
}
