
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
import { User, MapPin, Calendar, Music, Mic, Settings, Edit2, Share2, MessageSquare, BookOpen, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user } = useAuth();
  
  // State for user profile data
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    username: "",
    avatar: "/placeholder.svg",
    bio: "Music producer and mixing engineer with 10+ years of experience. Worked with indie artists and major labels.",
    location: "Los Angeles, CA",
    joinedDate: "March 2022",
    website: "alexthompson.com",
    followers: 854,
    following: 235,
    role: "Music Producer",
    specialties: ["Electronic", "Hip-Hop", "Pop", "R&B"],
    education: [
      {
        institution: "Berklee College of Music",
        degree: "Bachelor of Music in Music Production",
        year: "2015"
      }
    ],
    experience: [
      {
        position: "Lead Producer",
        company: "Echo Studios",
        period: "2018 - Present"
      },
      {
        position: "Assistant Engineer",
        company: "Soundwave Productions",
        period: "2015 - 2018"
      }
    ]
  });

  // Check if profile is the current user's profile
  const isCurrentUserProfile = true; // In a real app, this would compare profile ID with logged-in user ID

  // Mock projects/posts
  const projects = [
    {
      id: 1,
      title: "Summer Vibes EP",
      description: "Produced and mixed a 5-track EP for indie artist Maya Reeves",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
      date: "June 2023",
      tags: ["Electronic", "Pop"]
    },
    {
      id: 2,
      title: "Urban Beats Collection",
      description: "Created a sample pack featuring 100+ original sounds and loops",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop",
      date: "April 2023",
      tags: ["Hip-Hop", "R&B"]
    },
    {
      id: 3,
      title: "Midnight Sessions",
      description: "Mixed and mastered a live studio album for The Night Owls",
      image: "https://images.unsplash.com/photo-1588479839125-731d7ae923f6?q=80&w=2000&auto=format&fit=crop",
      date: "January 2023",
      tags: ["Jazz", "Live Recording"]
    }
  ];

  // Fetch profile data from Supabase when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProfileData = async () => {
      if (user) {
        try {
          // Get profile data from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile data:', error);
          } else if (data) {
            // Update the profile data with user information from Supabase
            setProfileData(prevData => ({
              ...prevData,
              id: data.id,
              name: data.full_name || user.email?.split('@')[0] || 'User',
              username: data.username || user.email?.split('@')[0] || 'user',
              avatar: data.avatar_url || prevData.avatar,
              website: data.website || prevData.website
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfileData();
  }, [user]);

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
                        <Button size="sm" className="gap-1">
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
                  <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                      <motion.div 
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="glass-card rounded-xl border overflow-hidden"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={project.image} 
                            alt={project.title} 
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {project.date}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{project.title}</h3>
                          <p className="text-sm text-rhythm-600 dark:text-rhythm-400 mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="glass-card rounded-xl border p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {profileData.specialties.map((specialty) => (
                        <Badge key={specialty} className="px-3 py-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-xl border p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Experience</h2>
                    <div className="space-y-4">
                      {profileData.experience.map((exp, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{exp.position}</h3>
                            <p className="text-sm text-rhythm-600 dark:text-rhythm-400">
                              {exp.company} · {exp.period}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-xl border p-6">
                    <h2 className="text-xl font-semibold mb-4">Education</h2>
                    <div className="space-y-4">
                      {profileData.education.map((edu, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{edu.degree}</h3>
                            <p className="text-sm text-rhythm-600 dark:text-rhythm-400">
                              {edu.institution} · {edu.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
    </div>
  );
}
