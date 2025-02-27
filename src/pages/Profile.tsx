
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Calendar, Music, Mic, Settings, Edit2, Share2, 
  MessageSquare, BookOpen, Award, Plus, Trash, PenLine, X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AddEducationModal } from '@/components/profile/AddEducationModal';
import { AddExperienceModal } from '@/components/profile/AddExperienceModal';
import { AddProjectModal } from '@/components/profile/AddProjectModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Types for profile data
interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  period: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  tags: string[];
}

interface ProfileData {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: string;
  website: string;
  followers: number;
  following: number;
  role: string;
  specialties: string[];
}

export default function Profile() {
  const { user } = useAuth();
  
  // State for user profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    name: "",
    username: "",
    avatar: "/placeholder.svg",
    bio: "",
    location: "",
    joinedDate: "",
    website: "",
    followers: 0,
    following: 0,
    role: "",
    specialties: []
  });
  
  // State for education, experience, and projects
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addEducationModalOpen, setAddEducationModalOpen] = useState(false);
  const [addExperienceModalOpen, setAddExperienceModalOpen] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Check if profile is the current user's profile
  const isCurrentUserProfile = true; // In a real app, this would compare profile ID with logged-in user ID
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long'
    });
  };

  // Fetch profile data from Supabase
  const fetchProfileData = async () => {
    if (user) {
      setIsLoading(true);
      try {
        // Get profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          return;
        }
        
        if (profileData) {
          // Format the joined date
          const joinedDate = profileData.joined_date ? formatDate(profileData.joined_date) : 'Recently joined';
          
          // Update the profile data
          setProfileData({
            id: profileData.id,
            name: profileData.full_name || user.email?.split('@')[0] || 'User',
            username: profileData.username || user.email?.split('@')[0] || 'user',
            avatar: profileData.avatar_url || "/placeholder.svg",
            bio: profileData.bio || "Tell us about yourself...",
            location: profileData.location || "Add your location",
            joinedDate,
            website: profileData.website || "Add your website",
            followers: profileData.followers || 0,
            following: profileData.following || 0,
            role: profileData.role || "Add your profession",
            specialties: profileData.specialties || []
          });
        }
        
        // Fetch education
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
        
        if (educationError) {
          console.error('Error fetching education data:', educationError);
        } else {
          setEducation(educationData || []);
        }
        
        // Fetch experience
        const { data: experienceData, error: experienceError } = await supabase
          .from('experience')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
        
        if (experienceError) {
          console.error('Error fetching experience data:', experienceError);
        } else {
          setExperience(experienceData || []);
        }
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
        
        if (projectsError) {
          console.error('Error fetching projects data:', projectsError);
        } else {
          setProjects(projectsData || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Delete education
  const handleDeleteEducation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setEducation(current => current.filter(item => item.id !== id));
      toast({
        title: "Education deleted",
        description: "Education entry has been removed successfully."
      });
    } catch (error: any) {
      console.error('Error deleting education:', error);
      toast({
        title: "Error",
        description: "Failed to delete education entry.",
        variant: "destructive"
      });
    }
  };
  
  // Delete experience
  const handleDeleteExperience = async (id: string) => {
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setExperience(current => current.filter(item => item.id !== id));
      toast({
        title: "Experience deleted",
        description: "Experience entry has been removed successfully."
      });
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience entry.",
        variant: "destructive"
      });
    }
  };
  
  // Delete project
  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setProjects(current => current.filter(item => item.id !== id));
      toast({
        title: "Project deleted",
        description: "Project has been removed successfully."
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive"
      });
    }
  };
  
  // Update specialties
  const handleAddSpecialty = async (specialty: string) => {
    if (!specialty.trim() || profileData.specialties.includes(specialty.trim())) {
      return;
    }
    
    try {
      const newSpecialties = [...profileData.specialties, specialty.trim()];
      
      const { error } = await supabase
        .from('profiles')
        .update({ specialties: newSpecialties })
        .eq('id', user?.id);
      
      if (error) {
        throw error;
      }
      
      setProfileData(prev => ({
        ...prev,
        specialties: newSpecialties
      }));
      
      toast({
        title: "Specialty added",
        description: `"${specialty}" has been added to your specialties.`
      });
    } catch (error: any) {
      console.error('Error adding specialty:', error);
      toast({
        title: "Error",
        description: "Failed to add specialty.",
        variant: "destructive"
      });
    }
  };
  
  // Remove specialty
  const handleRemoveSpecialty = async (specialty: string) => {
    try {
      const newSpecialties = profileData.specialties.filter(s => s !== specialty);
      
      const { error } = await supabase
        .from('profiles')
        .update({ specialties: newSpecialties })
        .eq('id', user?.id);
      
      if (error) {
        throw error;
      }
      
      setProfileData(prev => ({
        ...prev,
        specialties: newSpecialties
      }));
      
      toast({
        title: "Specialty removed",
        description: `"${specialty}" has been removed from your specialties.`
      });
    } catch (error: any) {
      console.error('Error removing specialty:', error);
      toast({
        title: "Error",
        description: "Failed to remove specialty.",
        variant: "destructive"
      });
    }
  };

  // Fetch data when component mounts or user changes
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfileData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Loading profile information...</p>
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
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-xl border p-6 md:p-8 mb-8"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-rhythm-800">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold mb-1">{profileData.name}</h1>
                      <div className="flex items-center gap-2 text-rhythm-600 dark:text-rhythm-400">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {profileData.role}
                        </Badge>
                        <span className="text-sm">@{profileData.username}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {isCurrentUserProfile ? (
                        <Button size="sm" className="gap-1" onClick={() => setEditModalOpen(true)}>
                          <Edit2 className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => window.location.href = "/messages"}>
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </Button>
                          <Button size="sm">
                            Follow
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-rhythm-700 dark:text-rhythm-300 mb-4">{profileData.bio}</p>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-rhythm-600 dark:text-rhythm-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profileData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {profileData.joinedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {profileData.website}
                    </div>
                  </div>
                  
                  <div className="flex gap-8 mt-4 text-sm">
                    <div>
                      <span className="font-bold">{profileData.followers}</span>
                      <span className="text-rhythm-600 dark:text-rhythm-400 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold">{profileData.following}</span>
                      <span className="text-rhythm-600 dark:text-rhythm-400 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Profile Content */}
            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Projects</h2>
                    {isCurrentUserProfile && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddProjectModalOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add Project
                      </Button>
                    )}
                  </div>
                  
                  {projects.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg bg-muted/30">
                      <Music className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                      <p className="text-muted-foreground mb-4">Showcase your work by adding your first project</p>
                      {isCurrentUserProfile && (
                        <Button onClick={() => setAddProjectModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map((project, index) => (
                        <motion.div 
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="glass-card rounded-xl border overflow-hidden group relative"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={project.image_url} 
                              alt={project.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2">
                              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                                {project.date}
                              </span>
                            </div>
                            
                            {isCurrentUserProfile && (
                              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold mb-2">{project.title}</h3>
                            <p className="text-sm text-rhythm-600 dark:text-rhythm-400 mb-3">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags && project.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="glass-card rounded-xl border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Specialties</h2>
                      
                      {isCurrentUserProfile && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Add specialty..."
                            className="pl-3 pr-12 py-1 text-sm border rounded-md"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddSpecialty((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button
                            className="absolute right-0 top-0 p-1 h-full px-2 border-l rounded-r-md hover:bg-muted"
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              handleAddSpecialty(input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {profileData.specialties.length === 0 ? (
                      <p className="text-rhythm-500 italic">No specialties added yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profileData.specialties.map((specialty) => (
                          <Badge key={specialty} className="px-3 py-1 flex items-center gap-1">
                            {specialty}
                            {isCurrentUserProfile && (
                              <button 
                                onClick={() => handleRemoveSpecialty(specialty)} 
                                className="ml-1 rounded-full hover:bg-primary/20"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="glass-card rounded-xl border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Experience</h2>
                      {isCurrentUserProfile && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddExperienceModalOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Add Experience
                        </Button>
                      )}
                    </div>
                    
                    {experience.length === 0 ? (
                      <p className="text-rhythm-500 italic">No work experience added yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {experience.map((exp) => (
                          <div key={exp.id} className="flex gap-4 relative group">
                            <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Music className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{exp.position}</h3>
                              <p className="text-sm text-rhythm-600 dark:text-rhythm-400">
                                {exp.company} · {exp.period}
                              </p>
                            </div>
                            
                            {isCurrentUserProfile && (
                              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/20">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this experience entry? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteExperience(exp.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="glass-card rounded-xl border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Education</h2>
                      {isCurrentUserProfile && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddEducationModalOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Add Education
                        </Button>
                      )}
                    </div>
                    
                    {education.length === 0 ? (
                      <p className="text-rhythm-500 italic">No education added yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {education.map((edu) => (
                          <div key={edu.id} className="flex gap-4 relative group">
                            <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{edu.degree}</h3>
                              <p className="text-sm text-rhythm-600 dark:text-rhythm-400">
                                {edu.institution} · {edu.year}
                              </p>
                            </div>
                            
                            {isCurrentUserProfile && (
                              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/20">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Education</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this education entry? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteEducation(edu.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="posts">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Posts</CardTitle>
                      <CardDescription>
                        View and manage your posts and activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center py-8 text-rhythm-500">No posts yet</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Reviews and Ratings</CardTitle>
                      <CardDescription>
                        See what others are saying about your work
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center py-8 text-rhythm-500">No reviews yet</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="connections">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Industry Connections</CardTitle>
                      <CardDescription>
                        Manage your professional network
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center py-8 text-rhythm-500">No connections to display</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="settings">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Manage your account preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-rhythm-500 mb-8">This is where account settings would go in a fully functional application.</p>
                      <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <EditProfileModal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        onProfileUpdated={fetchProfileData} 
        currentProfile={profileData} 
      />
      
      <AddEducationModal 
        isOpen={addEducationModalOpen} 
        onClose={() => setAddEducationModalOpen(false)} 
        onEducationAdded={fetchProfileData} 
      />
      
      <AddExperienceModal 
        isOpen={addExperienceModalOpen} 
        onClose={() => setAddExperienceModalOpen(false)} 
        onExperienceAdded={fetchProfileData} 
      />
      
      <AddProjectModal 
        isOpen={addProjectModalOpen} 
        onClose={() => setAddProjectModalOpen(false)} 
        onProjectAdded={fetchProfileData} 
      />
    </div>
  );
}
