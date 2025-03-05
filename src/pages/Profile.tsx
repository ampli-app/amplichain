import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';

import { Product, Service, Consultation } from '@/types/messages';
import { ProfileData } from '@/types/profile';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PortfolioTab } from '@/components/profile/PortfolioTab';
import { ProductsTab } from '@/components/profile/ProductsTab';
import { ExperienceTab } from '@/components/profile/ExperienceTab';
import { EducationTab } from '@/components/profile/EducationTab';
import { MarketplaceTab } from '@/components/profile/MarketplaceTab';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ChangeAvatarModal } from '@/components/profile/ChangeAvatarModal';

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
  const [searchParams] = useSearchParams();
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
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userConsultations, setUserConsultations] = useState<Consultation[]>([]);
  const [userEducation, setUserEducation] = useState<Education[]>([]);
  const [userExperience, setUserExperience] = useState<Experience[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received'>('none');
  const [isLoading, setIsLoading] = useState(true);
  
  const defaultTab = searchParams.get('tab') || 'portfolio';
  const marketplaceTab = searchParams.get('marketplaceTab') || 'products';

  useEffect(() => {
    console.log("Profile page loaded, auth state:", { isLoggedIn, user, userId });

    if (!isLoggedIn && !userId) {
      console.log("Not logged in and no userId provided, redirecting to login");
      navigate('/login');
      return;
    }
    
    const targetUserId = userId || (user && user.id);
    console.log("Target user ID:", targetUserId);
    
    if (user && targetUserId === user.id) {
      setIsOwnProfile(true);
    } else {
      setIsOwnProfile(false);
    }
    
    if (targetUserId) {
      fetchProfileData(targetUserId);
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, navigate, userId, user]);

  const fetchProfileData = async (profileId: string) => {
    console.log("Fetching profile data for:", profileId);
    setIsLoading(true);
    try {
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
        console.log("Profile data fetched successfully:", data);
        setProfileData(data);
        
        if (!isOwnProfile && currentUser) {
          try {
            const socialProfile = await fetchUserProfile(profileId);
            if (socialProfile) {
              setConnectionStatus(socialProfile.connectionStatus || 'none');
            }
          } catch (err) {
            console.error('Error fetching social profile:', err);
          }
        }
      }

      if (isOwnProfile) {
        fetchUserProducts(profileId);
        fetchUserServices(profileId);
        fetchUserConsultations(profileId);
      }
      
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
    console.log("Fetching products for user:", userId);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user products:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać produktów użytkownika.",
        variant: "destructive",
      });
    } else {
      console.log("User products fetched:", data?.length || 0, data);
      setUserProducts(data || []);
    }
  };
  
  const fetchUserServices = async (userId: string) => {
    console.log("Fetching services for user:", userId);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user services:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać usług użytkownika.",
        variant: "destructive",
      });
    } else {
      console.log("User services fetched:", data?.length || 0, data);
      setUserServices(data || []);
    }
  };
  
  const fetchUserConsultations = async (userId: string) => {
    console.log("Fetching consultations for user:", userId);
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user consultations:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać konsultacji użytkownika.",
        variant: "destructive",
      });
    } else {
      console.log("User consultations fetched:", data?.length || 0, data);
      setUserConsultations(data || []);
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
      console.log("Education records fetched:", data?.length || 0);
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
      console.log("Experience records fetched:", data?.length || 0);
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
      console.log("Projects fetched:", data?.length || 0);
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
  
  const handleProfileUpdated = () => {
    if (user) {
      fetchProfileData(user.id);
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      setIsChangeAvatarOpen(true);
    }
  };

  const handleAvatarChanged = (newAvatarUrl: string) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        avatar_url: newAvatarUrl
      });
    }
    handleProfileUpdated();
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć produktu.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Produkt został usunięty.",
        });
        if (user) {
          fetchUserProducts(user.id);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
        
      if (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć usługi.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Usługa została usunięta.",
        });
        if (user) {
          fetchUserServices(user.id);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  const handleDeleteConsultation = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', consultationId);
        
      if (error) {
        console.error('Error deleting consultation:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć konsultacji.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Konsultacja została usunięta.",
        });
        if (user) {
          fetchUserConsultations(user.id);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  if (!isLoading && !profileData && !userId && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Musisz się zalogować</h2>
            <p className="mb-6">Aby zobaczyć profil, musisz się najpierw zalogować.</p>
            <button onClick={() => navigate('/login')} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
              Zaloguj się
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          <ProfileHeader 
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            connectionStatus={connectionStatus}
            onEditProfileClick={() => setIsEditProfileOpen(true)}
            onAvatarClick={handleAvatarClick}
            handleConnectionAction={handleConnectionAction}
            handleFollow={handleFollow}
          />
          
          <Tabs defaultValue={defaultTab} className="mb-8">
            <TabsList className="mb-6 grid grid-cols-5 max-w-3xl">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="products">Produkty</TabsTrigger>
              <TabsTrigger value="experience">Doświadczenie</TabsTrigger>
              <TabsTrigger value="education">Edukacja</TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="marketplace">Mój Marketplace</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="portfolio">
              <PortfolioTab 
                userProjects={userProjects}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
            
            <TabsContent value="products">
              <ProductsTab 
                userProducts={userProducts}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
            
            <TabsContent value="experience">
              <ExperienceTab 
                userExperience={userExperience}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
            
            <TabsContent value="education">
              <EducationTab 
                userEducation={userEducation}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
            
            {isOwnProfile && (
              <TabsContent value="marketplace">
                <MarketplaceTab 
                  userProducts={userProducts}
                  userServices={userServices}
                  userConsultations={userConsultations}
                  handleDeleteProduct={handleDeleteProduct}
                  handleDeleteService={handleDeleteService}
                  handleDeleteConsultation={handleDeleteConsultation}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      {profileData && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onProfileUpdated={handleProfileUpdated}
          currentProfile={profileData}
        />
      )}
      
      {isOwnProfile && (
        <ChangeAvatarModal
          isOpen={isChangeAvatarOpen}
          onClose={() => setIsChangeAvatarOpen(false)}
          onAvatarChanged={handleAvatarChanged}
          currentAvatarUrl={profileData?.avatar_url || '/placeholder.svg'}
        />
      )}
    </div>
  );
}
