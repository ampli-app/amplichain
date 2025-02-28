import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { MentorCard } from '@/components/MentorCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { 
  Search, 
  ChevronRight, 
  Star, 
  UserPlus, 
  Heart, 
  MessageCircle, 
  Share2,
  Clock,
  Sparkles,
  BookOpen,
  Compass,
  Users as UsersIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data
const recommendedProducts = [
  {
    id: 1,
    title: "Neumann U87 Condenser Microphone",
    price: 2999.99,
    image: "https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2000&auto=format&fit=crop",
    category: "Microphones",
    rating: 5.0,
    reviewCount: 124
  },
  {
    id: 2,
    title: "Universal Audio Apollo Twin X Duo",
    price: 899.00,
    image: "https://images.unsplash.com/photo-1558612846-ec0107aaf552?q=80&w=2000&auto=format&fit=crop",
    category: "Audio Interfaces",
    rating: 4.8,
    reviewCount: 86,
    sale: true,
    salePercentage: 15
  },
  {
    id: "3",
    title: "Ableton Push 2 MIDI Controller",
    price: 799.00,
    image: "https://images.unsplash.com/photo-1553526665-10042bd50dd1?q=80&w=2000&auto=format&fit=crop",
    category: "Controllers",
    rating: 4.9,
    reviewCount: 102
  },
  {
    id: 4,
    title: "Yamaha HS8 Studio Monitors (Pair)",
    price: 699.99,
    image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?q=80&w=2000&auto=format&fit=crop",
    category: "Monitors",
    rating: 4.7,
    reviewCount: 93,
    forTesting: true,
    testingPrice: 89.99
  }
];

const mentors = [
  {
    id: 1,
    name: "David Wilson",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Senior Producer",
    company: "Atlantic Records",
    experience: "15+ years experience",
    bio: "Grammy-winning producer specializing in hip-hop and R&B production. I've worked with top artists including Drake, Kendrick Lamar, and SZA.",
    rating: 4.9,
    reviewCount: 142,
    skills: ["Music Production", "Mixing", "Songwriting", "Beat Making"],
    price: 150,
    availableSpots: 2,
    availability: "Available now"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
    title: "A&R Executive",
    company: "Sony Music",
    experience: "10+ years experience",
    bio: "Experienced A&R executive who has discovered and developed multiple platinum-selling artists. I specialize in artist development and finding unique voices in the industry.",
    rating: 4.7,
    reviewCount: 98,
    skills: ["Artist Development", "Talent Scouting", "Marketing Strategy", "Contract Negotiation"],
    price: 120,
    quickResponder: true,
    availability: "Available in 2h"
  },
  {
    id: 3,
    name: "Michael Chen",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    title: "Mixing Engineer",
    company: "Independent",
    experience: "12+ years experience",
    bio: "Mixing engineer with credits on multiple Billboard #1 albums. I specialize in creating clean, punchy mixes that bring out the best in your music.",
    rating: 4.8,
    reviewCount: 115,
    skills: ["Mixing", "Mastering", "Sound Design", "Studio Setup"],
    price: 100,
    availability: "Available tomorrow"
  }
];

const personalizedRecommendations = [
  {
    id: 1,
    type: "marketplace",
    title: "Universal Audio Apollo Twin X Duo",
    description: "Perfect for your home studio setup",
    image: "https://images.unsplash.com/photo-1558612846-ec0107aaf552?q=80&w=2000&auto=format&fit=crop",
    link: "/marketplace"
  },
  {
    id: 2,
    type: "mentor",
    title: "Mixing Workshop with Michael Chen",
    description: "Learn advanced mixing techniques",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    link: "/mentorship"
  },
  {
    id: 3,
    type: "social",
    title: "Music Production Community",
    description: "Connect with 1,200+ producers worldwide",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    link: "/feed"
  },
  {
    id: 4,
    type: "marketplace",
    title: "Ableton Live 12 Suite",
    description: "Special discount for our platform users",
    image: "https://images.unsplash.com/photo-1553526665-10042bd50dd1?q=80&w=2000&auto=format&fit=crop",
    link: "/marketplace"
  }
];

export default function Discovery() {
  const { users, posts, followUser } = useSocial();
  const [productCategory, setProductCategory] = useState<'all' | 'popular' | 'new'>('all');
  
  // Refs for horizontal scrolling sections
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const mentorsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function for horizontal scrolling with buttons
  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { current } = ref;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered users for the social network section (excluding current user)
  const popularUsers = users.filter(user => !user.isCurrentUser).slice(0, 5);
  
  // Featured posts for the feed section
  const featuredPosts = posts.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {/* Main search bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-5 w-5" />
              <Input 
                placeholder="Search for people, products, mentors..." 
                className="pl-10 py-6 text-lg rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-16">
            {/* Personalized Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Personalized For You</h2>
                  <p className="text-rhythm-600">Content tailored to your interests and activity</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => scroll(recommendationsRef, 'left')}
                    className="rounded-full h-8 w-8"
                    aria-label="Scroll left"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => scroll(recommendationsRef, 'right')}
                    className="rounded-full h-8 w-8"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div 
                ref={recommendationsRef} 
                className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar"
              >
                {personalizedRecommendations.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass-card rounded-xl overflow-hidden border hover:shadow-md transition-all duration-300 flex-shrink-0 w-[280px]"
                  >
                    <Link to={item.link}>
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                        <Badge className="absolute top-3 left-3 capitalize">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1">{item.title}</h3>
                        <p className="text-sm text-rhythm-600">{item.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                <Link 
                  to="/feed" 
                  className="flex-shrink-0 w-[280px] h-full flex items-center justify-center border rounded-xl p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <span className="font-medium">See more recommendations</span>
                    <p className="text-sm text-rhythm-500">View your personalized feed</p>
                  </div>
                </Link>
              </div>
            </section>
            
            {/* Popular in the Social Network */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Popular in the Network</h2>
                  <p className="text-rhythm-600">Industry professionals you might want to follow</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => scroll(usersRef, 'left')}
                    className="rounded-full h-8 w-8"
                    aria-label="Scroll left"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => scroll(usersRef, 'right')}
                    className="rounded-full h-8 w-8"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div 
                ref={usersRef} 
                className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar"
              >
                {popularUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass-card rounded-xl border p-5 hover:shadow-md transition-all duration-300 flex-shrink-0 w-[300px]"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-rhythm-500">{user.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-4 text-sm">
                        <span className="text-rhythm-600">
                          <strong>{user.followersCount}</strong> followers
                        </span>
                        <span className="text-rhythm-600">
                          <strong>{user.connectionsCount}</strong> connections
                        </span>
                      </div>
                    </div>
                    
                    {user.connectionStatus === 'following' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-1.5"
                      >
                        <UserPlus className="h-4 w-4" />
                        Following
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full gap-1.5"
                        onClick={() => followUser(user.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </Button>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Recent Activity</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-rhythm-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Shared a new track</span>
                          <span className="ml-auto">2h ago</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-rhythm-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Posted in #MusicProduction</span>
                          <span className="ml-auto">1d ago</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Link 
                  to="/connections" 
                  className="flex-shrink-0 w-[300px] h-full flex items-center justify-center border rounded-xl p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <UsersIcon className="h-8 w-8 text-primary" />
                    <span className="font-medium">Explore more profiles</span>
                    <p className="text-sm text-rhythm-500">View all network connections</p>
                  </div>
                </Link>
              </div>
            </section>
            
            {/* Recommended Products from the Marketplace */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Marketplace Highlights</h2>
                  <p className="text-rhythm-600">Professional equipment you might be interested in</p>
                </div>
                
                <Button variant="ghost" size="sm" asChild className="gap-1.5 text-primary">
                  <Link to="/marketplace">
                    Browse marketplace
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <Tabs 
                value={productCategory} 
                onValueChange={(v) => setProductCategory(v as 'all' | 'popular' | 'new')}
                className="mb-6"
              >
                <TabsList className="w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="new">New Arrivals</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div 
                ref={productsRef} 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {recommendedProducts.map((product, index) => (
                  <MarketplaceItem
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    sale={product.sale}
                    salePercentage={product.salePercentage}
                    forTesting={product.forTesting}
                    testingPrice={product.testingPrice}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </section>
            
            {/* Mentoring Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Featured Mentors</h2>
                  <p className="text-rhythm-600">Learn from industry experts in one-on-one sessions</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => scroll(mentorsRef, 'left')}
                    className="rounded-full h-8 w-8"
                    aria-label="Scroll left"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => scroll(mentorsRef, 'right')}
                    className="rounded-full h-8 w-8"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div 
                ref={mentorsRef} 
                className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar"
              >
                {mentors.map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass-card rounded-xl border overflow-hidden hover:shadow-md transition-all duration-300 flex-shrink-0 w-[350px]"
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={mentor.image} alt={mentor.name} />
                            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <Badge 
                            variant="outline" 
                            className={`absolute -bottom-2 -right-2 text-xs px-2 py-0 ${
                              mentor.availability.includes('now') 
                                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            {mentor.availability}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{mentor.name}</h3>
                          <p className="text-sm text-rhythm-600">{mentor.title} at {mentor.company}</p>
                          <p className="text-sm text-primary">{mentor.experience}</p>
                          
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < Math.floor(mentor.rating) ? 'text-amber-400 fill-amber-400' : 'text-rhythm-300'}`} 
                              />
                            ))}
                            <span className="text-xs ml-1">{mentor.rating} ({mentor.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-rhythm-700 mb-4 line-clamp-2">{mentor.bio}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="bg-rhythm-100/50 dark:bg-rhythm-800/50">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.skills.length > 3 && (
                          <Badge variant="outline" className="bg-rhythm-100/50 dark:bg-rhythm-800/50">
                            +{mentor.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">${mentor.price}/hr</div>
                        <Button size="sm" className="gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Link 
                  to="/mentorship" 
                  className="flex-shrink-0 w-[300px] h-full flex items-center justify-center border rounded-xl p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="font-medium">Find more mentors</span>
                    <p className="text-sm text-rhythm-500">Explore all mentorship opportunities</p>
                  </div>
                </Link>
              </div>
            </section>
            
            {/* Featured Posts from the Feed */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Trending in Your Network</h2>
                  <p className="text-rhythm-600">Popular posts from your connections</p>
                </div>
                
                <Button variant="ghost" size="sm" asChild className="gap-1.5 text-primary">
                  <Link to="/feed">
                    Go to full feed
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-5">
                {featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass-card rounded-xl p-5 border"
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{post.author.name}</h3>
                            <div className="text-sm text-rhythm-500 flex items-center gap-2">
                              <span>{post.author.role}</span>
                              <span className="text-xs">•</span>
                              <span>{post.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="my-3 text-rhythm-700">{post.content}</p>
                        
                        {post.mediaUrl && (
                          <div className="mt-3 mb-4 rounded-lg overflow-hidden">
                            <img 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-4 mt-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`gap-1.5 ${post.hasLiked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-red-500' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button asChild size="lg" variant="outline">
                  <Link to="/feed">View Full Feed</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
