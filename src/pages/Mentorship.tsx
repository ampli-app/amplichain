import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MentorshipCard } from '@/components/MentorshipCard';
import { MentorCard } from '@/components/MentorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  Star, 
  UserPlus, 
  Calendar, 
  ArrowRight, 
  DollarSign, 
  File, 
  MessageSquare,
  ScrollText,
  BookOpen,
  UserCog,
  School,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/messages/EmptyState';

const mentorshipCommunities = [
  {
    title: "Producer's Circle",
    description: "Learn from top music producers and get feedback on your tracks.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    members: 1250,
    rating: 4.9,
    features: [
      "Weekly live sessions with industry pros",
      "Track feedback and reviews",
      "Exclusive production resources",
      "Private networking opportunities"
    ],
    popular: true
  },
  {
    title: "A&R Insights",
    description: "Discover what A&R executives are looking for in new artists.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop",
    members: 850,
    rating: 4.7,
    features: [
      "A&R mentorship opportunities",
      "Demo submission feedback",
      "Industry trends analysis",
      "Artist development resources"
    ]
  },
  {
    title: "Sound Engineering Lab",
    description: "Master the technical side of music with expert sound engineers.",
    image: "https://images.unsplash.com/photo-1588479839125-731d7ae923f6?q=80&w=2000&auto=format&fit=crop",
    members: 950,
    rating: 4.8,
    features: [
      "Studio equipment tutorials",
      "Mixing and mastering workshops",
      "Acoustics and studio design",
      "Technical problem-solving"
    ]
  },
  {
    title: "Artist Management Circle",
    description: "Connect with artist managers and learn the business side of music.",
    image: "https://images.unsplash.com/photo-1560184611-ff3e53f00e8f?q=80&w=2000&auto=format&fit=crop",
    members: 620,
    rating: 4.6,
    features: [
      "Career development strategies",
      "Contract negotiation insights",
      "Tour planning and execution",
      "Brand building for artists"
    ]
  },
  {
    title: "Songwriters Guild",
    description: "Perfect your craft with feedback from established songwriters.",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2000&auto=format&fit=crop",
    members: 1100,
    rating: 4.9,
    features: [
      "Co-writing sessions",
      "Lyrics and melody workshops",
      "Publishing opportunities",
      "Songwriting challenges"
    ],
    popular: true
  },
  {
    title: "Music Marketing Pros",
    description: "Learn cutting-edge strategies to promote your music effectively.",
    image: "https://images.unsplash.com/photo-1661956600684-97d3a4320e45?q=80&w=2000&auto=format&fit=crop",
    members: 780,
    rating: 4.7,
    features: [
      "Social media optimization",
      "Playlist pitching strategies",
      "PR and press coverage",
      "Fan engagement tactics"
    ]
  }
];

const individualMentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D",
    title: "Senior Producer",
    company: "Atlantis Records",
    experience: "10+ years of experience in music production",
    bio: "Hi there! 👋 I'm Sarah, a music producer with over a decade of experience working with Grammy-winning artists. I specialize in pop and R&B production, and I've helped countless artists develop their sound. My approach combines technical expertise with creative direction to help you achieve your unique sound. Whether you're a beginner looking to learn the basics or an experienced producer wanting to refine your skills, I'm here to help you reach your goals.",
    rating: 4.9,
    reviewCount: 48,
    skills: ["Music Production", "Sound Design", "Mixing", "Mastering", "Logic Pro", "Ableton Live"],
    price: 75,
    quickResponder: true,
    availableSpots: 2
  },
  {
    id: 2,
    name: "Marcus Rivera",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Artist Manager",
    company: "Elevation Management",
    experience: "8+ years of experience in artist management",
    bio: "I'm Marcus, an artist manager with experience guiding musicians from local venues to major festivals. I focus on building sustainable careers through strategic planning, branding, and industry connections. My mentees learn to navigate contracts, build teams, and make smart business decisions while staying true to their artistic vision.",
    rating: 4.7,
    reviewCount: 32,
    skills: ["Artist Management", "Career Strategy", "Branding", "Tour Planning", "Contract Negotiation"],
    price: 65
  },
  {
    id: 3,
    name: "Yvette Kondoh",
    image: "/lovable-uploads/9b8af26a-e395-4b2d-b30e-ff147a5f2eac.png",
    title: "Data Scientist",
    company: "Kraft Heinz",
    experience: "7+ years of experience in data and analytics",
    bio: "Hi there! 👋 I am Yvette, a data scientist with a background in Actuarial Science and Statistics currently working at Kraft Heinz. In my 7+ years of experience, I have partnered with different stakeholders to build data products and solutions that solve critical business problems across a number of industries.",
    rating: 5.0,
    reviewCount: 2,
    skills: ["Engineering & Data", "Data Science", "Data Visualization", "Python", "SQL", "Data Analytics", "Machine Learning"],
    price: 39,
    quickResponder: true,
    availableSpots: 4
  },
  {
    id: 4,
    name: "Daniel Lee",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
    title: "Music Marketing Specialist",
    company: "Pinnacle Digital",
    experience: "6+ years of experience in digital marketing",
    bio: "Hey! I'm Daniel, a music marketing specialist focused on helping independent artists reach new audiences. I've developed and executed marketing campaigns that have helped artists go from unknown to having millions of streams. I can teach you effective strategies for growing your fan base, optimizing your social media presence, and getting your music on key playlists.",
    rating: 4.8,
    reviewCount: 27,
    skills: ["Digital Marketing", "Social Media Strategy", "Playlist Pitching", "Content Creation", "Analytics"],
    price: 55
  },
  {
    id: 5,
    name: "Aisha Williams",
    image: "https://images.unsplash.com/photo-1589156288859-f0cb0d82b065?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjB3b21hbiUyMHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D",
    title: "A&R Director",
    company: "Horizon Records",
    experience: "12+ years of experience in A&R",
    bio: "I'm Aisha, an A&R Director with 12+ years of experience discovering and developing artists. I've signed multiple platinum-selling acts and helped shape their careers from the ground up. My mentoring focuses on helping artists understand what labels are looking for, how to present themselves professionally, and how to create music that resonates with both audiences and industry gatekeepers.",
    rating: 4.9,
    reviewCount: 41,
    skills: ["A&R Strategy", "Talent Scouting", "Artist Development", "Repertoire Selection", "Industry Networking"],
    price: 85,
    quickResponder: true
  },
  {
    id: 6,
    name: "James Taylor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Sound Engineer",
    company: "Crystal Sound Studios",
    experience: "15+ years of experience in sound engineering",
    bio: "I'm James, a veteran sound engineer with experience across studio recording, live sound, and post-production. I've worked on Grammy-winning albums and engineered sound for major tours and festivals. I specialize in teaching both the technical and artistic aspects of sound engineering, from microphone selection and placement to mixing techniques that bring out the best in every recording.",
    rating: 4.8,
    reviewCount: 56,
    skills: ["Recording Techniques", "Live Sound", "Pro Tools", "Acoustic Treatment", "Signal Processing", "Microphone Techniques"],
    price: 70,
    availableSpots: 3
  }
];

const myMentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D",
    title: "Senior Producer",
    company: "Atlantis Records",
    lastMessage: "Pamiętaj o naszym spotkaniu w środę!",
    lastMessageDate: "2024-05-28T14:30:00",
    unreadCount: 2
  },
  {
    id: 5,
    name: "Aisha Williams",
    image: "https://images.unsplash.com/photo-1589156288859-f0cb0d82b065?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjB3b21hbiUyMHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D",
    title: "A&R Director",
    company: "Horizon Records",
    lastMessage: "Co sądzisz o tym nowym utworze?",
    lastMessageDate: "2024-05-27T11:15:00",
    unreadCount: 0
  }
];

const myMentees = [
  {
    id: 101,
    name: "Marcin Kowalski",
    image: "/placeholder.svg",
    role: "Początkujący producent",
    lastMessage: "Dziękuję za ostatnie wskazówki!",
    lastMessageDate: "2024-05-28T09:45:00",
    unreadCount: 1
  },
  {
    id: 102,
    name: "Alicja Nowak",
    image: "/placeholder.svg",
    role: "Wokalistka",
    lastMessage: "Przesyłam nagranie, o które prosiłeś",
    lastMessageDate: "2024-05-26T18:20:00",
    unreadCount: 0
  }
];

const myGroups = [
  {
    id: 201,
    title: "Producer's Circle",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    members: 12,
    lastActivity: "2024-05-28T16:00:00",
    unreadCount: 5
  },
  {
    id: 202,
    title: "Songwriters Guild",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2000&auto=format&fit=crop",
    members: 8,
    lastActivity: "2024-05-27T13:30:00",
    unreadCount: 0
  }
];

export default function Mentorship() {
  const [activeTab, setActiveTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMyMentoringsTab, setActiveMyMentoringsTab] = useState("my-mentors");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredCommunities = mentorshipCommunities.filter(community => 
    community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredMentors = individualMentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) {
      return `Dzisiaj, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (diffInDays === 1) {
      return `Wczoraj, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (diffInDays < 7) {
      const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
      return `${days[date.getDay()]}, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Mentoring</h1>
              <p className="text-lg text-rhythm-600 max-w-2xl mx-auto">
                Połącz się z ekspertami branżowymi, aby przyspieszyć swój rozwój,
                poszerzyć swoją sieć kontaktów i podnieść swoją karierę na wyższy poziom.
              </p>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mb-8"
            >
              <div className="flex items-center justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="groups" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Grupy mentorskie
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Mentoring 1:1
                  </TabsTrigger>
                  <TabsTrigger value="my-mentorings" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    Moje mentoringe
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mt-6 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    placeholder={`Szukaj ${activeTab === 'groups' ? 'grup' : activeTab === 'individual' ? 'mentorów' : 'mentoringów'}...`} 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Opcje filtrowania
                </Button>
              </div>
              
              <TabsContent value="groups">
                {searchQuery && filteredCommunities.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-rhythm-500">Nie znaleziono grup pasujących do "{searchQuery}"</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Wyczyść wyszukiwanie
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredCommunities.map((community, index) => (
                      <MentorshipCard 
                        key={community.title}
                        title={community.title}
                        description={community.description}
                        image={community.image}
                        members={community.members}
                        rating={community.rating}
                        features={community.features}
                        popular={community.popular}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex justify-center mt-10">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("individual")}
                    className="gap-2"
                  >
                    Szukasz mentoringu 1:1?
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-16 p-6 border rounded-xl bg-rhythm-50/50 dark:bg-rhythm-900/50">
                  <h3 className="text-xl font-semibold mb-4">Utwórz własną grupę mentorską</h3>
                  <p className="text-rhythm-600 mb-4">
                    Masz wiedzę, którą chcesz się podzielić? Załóż własną grupę mentorską i pomagaj innym.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Buduj społeczność</p>
                        <p className="text-sm text-rhythm-500">Stwórz przestrzeń do wspólnej nauki</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Zarabiaj na wiedzy</p>
                        <p className="text-sm text-rhythm-500">Ustal model subskrypcji lub jednorazowych opłat</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Dziel się materiałami</p>
                        <p className="text-sm text-rhythm-500">Udostępniaj ekskluzywne zasoby</p>
                      </div>
                    </div>
                  </div>
                  <Button>Utwórz grupę mentorską</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="individual">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {searchQuery ? `${filteredMentors.length} mentorów znalezionych` : '838 dostępnych mentorów'}
                  </h2>
                  
                  <Button variant="outline" className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                    <Star className="h-4 w-4" />
                    Przeglądaj wszystkich mentorów
                  </Button>
                </div>
                
                {searchQuery && filteredMentors.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-rhythm-500">Nie znaleziono mentorów pasujących do "{searchQuery}"</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Wyczyść wyszukiwanie
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMentors.map((mentor, index) => (
                      <MentorCard
                        key={mentor.id}
                        id={mentor.id}
                        name={mentor.name}
                        image={mentor.image}
                        title={mentor.title}
                        company={mentor.company}
                        experience={mentor.experience}
                        bio={mentor.bio}
                        rating={mentor.rating}
                        reviewCount={mentor.reviewCount}
                        skills={mentor.skills}
                        price={mentor.price}
                        quickResponder={mentor.quickResponder}
                        availableSpots={mentor.availableSpots}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex justify-center mt-10">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("groups")}
                    className="gap-2"
                  >
                    Szukasz mentoringu grupowego?
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-16 p-6 border rounded-xl bg-rhythm-50/50 dark:bg-rhythm-900/50">
                  <h3 className="text-xl font-semibold mb-4">Zostań mentorem</h3>
                  <p className="text-rhythm-600 mb-4">
                    Jesteś profesjonalistą w branży? Dziel się swoim doświadczeniem i zarabiaj mentorując innych.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Ustal swoje stawki</p>
                        <p className="text-sm text-rhythm-500">Sam decydujesz ile chcesz zarabiać</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Elastyczny grafik</p>
                        <p className="text-sm text-rhythm-500">Mentoruj kiedy Ci pasuje</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Rozwijaj swoją sieć</p>
                        <p className="text-sm text-rhythm-500">Nawiązuj kontakt z aspirującymi profesjonalistami</p>
                      </div>
                    </div>
                  </div>
                  <Button>Aplikuj, aby zostać mentorem</Button>
                </div>
              </TabsContent>

              <TabsContent value="my-mentorings">
                <div className="mb-6">
                  <Tabs 
                    value={activeMyMentoringsTab} 
                    onValueChange={setActiveMyMentoringsTab}
                    className="mb-6"
                  >
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="my-mentors" className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        Moi mentorzy
                      </TabsTrigger>
                      <TabsTrigger value="my-mentees" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Moi podopieczni
                      </TabsTrigger>
                      <TabsTrigger value="my-groups" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Moje grupy
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-mentors">
                      {myMentors.length > 0 ? (
                        <div className="space-y-4">
                          {myMentors.map((mentor) => (
                            <Card key={mentor.id} className="overflow-hidden hover:border-primary transition-colors">
                              <CardContent className="p-0">
                                <div className="flex items-start p-4">
                                  <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
                                    <AvatarImage src={mentor.image} alt={mentor.name} />
                                    <AvatarFallback>
                                      {mentor.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-semibold text-lg">{mentor.name}</h3>
                                        <p className="text-sm text-muted-foreground">{mentor.title} w {mentor.company}</p>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(mentor.lastMessageDate)}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm line-clamp-1">{mentor.lastMessage}</p>
                                  </div>

                                  {mentor.unreadCount > 0 && (
                                    <div className="ml-4 flex-shrink-0">
                                      <Badge className="bg-primary">{mentor.unreadCount}</Badge>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="border-t px-4 py-3 flex justify-between items-center bg-muted/30">
                                  <div className="flex gap-4">
                                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                                      <File className="h-4 w-4" />
                                      Pliki
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                                      <ScrollText className="h-4 w-4" />
                                      Notatki
                                    </Button>
                                  </div>
                                  <Button size="sm" className="h-8 gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Wiadomość
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={<School className="h-12 w-12 text-muted-foreground/50" />}
                          title="Nie masz jeszcze mentorów"
                          description="Znajdź mentora, który pomoże Ci w rozwoju kariery."
                          action={
                            <Button onClick={() => setActiveTab("individual")} className="gap-2">
                              <UserPlus className="h-4 w-4" />
                              Znajdź mentora
                            </Button>
                          }
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="my-mentees">
                      {myMentees.length > 0 ? (
                        <div className="space-y-4">
                          {myMentees.map((mentee) => (
                            <Card key={mentee.id} className="overflow-hidden hover:border-primary transition-colors">
                              <CardContent className="p-0">
                                <div className="flex items-start p-4">
                                  <Avatar className="h-12 w-12 mr-4 flex-shrink-0">
                                    <AvatarImage src={mentee.image} alt={mentee.name} />
                                    <AvatarFallback>
                                      {mentee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-semibold text-lg">{mentee.name}</h3>
                                        <p className="text-sm text-muted-foreground">{mentee.role}</p>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(mentee.lastMessageDate)}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm line-clamp-1">{mentee.lastMessage}</p>
                                  </div>

                                  {mentee.unreadCount > 0 && (
                                    <div className="ml-4 flex-shrink-0">
                                      <Badge className="bg-primary">{mentee.unreadCount}</Badge>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="border-t px-4 py-3 flex justify-between items-center bg-muted/30">
                                  <div className="flex gap-4">
                                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                                      <File className="h-4 w-4" />
                                      Pliki
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                                      <ScrollText className="h-4 w-4" />
                                      Notatki
                                    </Button>
                                  </div>
                                  <Button size="sm" className="h-8 gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Wiadomość
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={<UserPlus className="h-12 w-12 text-muted-foreground/50" />}
                          title="Nie masz jeszcze podopiecznych"
                          description="Zostań mentorem, aby pomagać innym w rozwoju."
                          action={
                            <Button className="gap-2">
                              <UserPlus className="h-4 w-4" />
                              Zostań mentorem
                            </Button>
                          }
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="my-groups">
                      {myGroups.length > 0 ? (
                        <div className="space-y-4">
                          {myGroups.map((group) => (
                            <Card key={group.id} className="overflow-hidden hover:border-primary transition-colors">
                              <CardContent className="p-0">
                                <div className="flex items-start p-4">
                                  <div className="h-12 w-12 mr-4 rounded-md overflow-hidden flex-shrink-0">
                                    <img 
                                      src={group.image} 
                                      alt={group.title} 
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-semibold text-lg">{group.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                          {group.members} {group.members === 1 ? 'członek' : 
                                          group.members < 5 ? 'członków' : 'członków'}
                                        </p>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(group.lastActivity)}
                                      </span>
                                    </div>
                                  </div>

                                  {group.unreadCount > 0 && (
                                    <div className="ml-4 flex-shrink-0">
                                      <Badge className="bg-primary">{group.unreadCount}</Badge>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="border-t px-4 py-3 flex justify-between items-center bg-muted/30">
                                  <div className="flex gap-4">
                                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                                      <File className="h-4 w-4" />
                                      Materiały
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 gap-1">
                                      <Users className="h-4 w-4" />
                                      Członkowie
                                    </Button>
                                  </div>
                                  <Button size="sm" className="h-8 gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    Dyskusja
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          <div className="mt-4 flex justify-center">
                            <Button variant="outline" className="gap-2">
                              <PlusCircle className="h-4 w-4" />
                              Dołącz do nowej grupy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <EmptyState
                          icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
                          title="Nie należysz jeszcze do żadnej grupy mentorskiej"
                          description="Dołącz do grupy, aby uczyć się razem z innymi."
                          action={
                            <Button onClick={() => setActiveTab("groups")} className="gap-2">
                              <Users className="h-4 w-4" />
                              Przeglądaj grupy
                            </Button>
                          }
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
