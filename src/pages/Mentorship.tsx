
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MentorshipCard } from '@/components/MentorshipCard';
import { MentorCard } from '@/components/MentorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  PlusCircle,
  ArrowLeft,
  Paperclip,
  Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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

// Nowe typy i dane
interface MentorNote {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface MentorFile {
  id: number;
  name: string;
  size: string;
  type: string;
  date: string;
}

interface MentorMessage {
  id: number;
  text: string;
  sender_id: string;
  is_mentor: boolean;
  date: string;
}

// Przykładowe dane dla konwersacji
const conversationNotes: Record<string, MentorNote[]> = {
  "mentor-1": [
    { id: 1, title: "Cele na kwartał", content: "Skupić się na rozwoju umiejętności produkcji.", date: "2024-05-20T14:30:00" },
    { id: 2, title: "Feedback po sesji", content: "Dobre postępy w miksie, poprawić balans tonalny.", date: "2024-05-15T10:15:00" },
  ],
  "mentor-5": [
    { id: 1, title: "Strategie A&R", content: "Notatki z dyskusji o trendach w branży muzycznej.", date: "2024-05-18T09:45:00" },
  ],
  "mentee-101": [
    { id: 1, title: "Plan rozwoju", content: "Notatki z pierwszej sesji mentorskiej.", date: "2024-05-22T16:00:00" },
    { id: 2, title: "Feedback dla produkcji", content: "Uwagi do ostatniego utworu.", date: "2024-05-26T11:30:00" },
  ],
  "mentee-102": [
    { id: 1, title: "Ćwiczenia wokalne", content: "Lista ćwiczeń do codziennej praktyki.", date: "2024-05-24T13:20:00" },
  ]
};

const conversationFiles: Record<string, MentorFile[]> = {
  "mentor-1": [
    { id: 1, name: "track_feedback.mp3", size: "4.2 MB", type: "audio", date: "2024-05-25T15:40:00" },
    { id: 2, name: "mixing_tips.pdf", size: "1.8 MB", type: "document", date: "2024-05-20T09:15:00" },
  ],
  "mentor-5": [
    { id: 1, name: "industry_report_2024.pdf", size: "3.5 MB", type: "document", date: "2024-05-22T14:30:00" },
  ],
  "mentee-101": [
    { id: 1, name: "beat_demo_v2.wav", size: "8.1 MB", type: "audio", date: "2024-05-27T10:45:00" },
  ],
  "mentee-102": [
    { id: 1, name: "vocal_take_03.mp3", size: "3.7 MB", type: "audio", date: "2024-05-26T18:20:00" },
    { id: 2, name: "lyrics_draft.docx", size: "0.5 MB", type: "document", date: "2024-05-24T12:10:00" },
  ]
};

const conversationMessages: Record<string, MentorMessage[]> = {
  "mentor-1": [
    { id: 1, text: "Cześć! Jak postępy z nowym utworem?", sender_id: "mentor", is_mentor: true, date: "2024-05-27T14:30:00" },
    { id: 2, text: "Pracuję nad nim intensywnie. Przesłałem Ci wersję demo do oceny.", sender_id: "user", is_mentor: false, date: "2024-05-27T14:35:00" },
    { id: 3, text: "Świetnie! Posłucham i dam Ci znać. Pamiętaj o naszym spotkaniu w środę!", sender_id: "mentor", is_mentor: true, date: "2024-05-27T14:40:00" },
  ],
  "mentor-5": [
    { id: 1, text: "Przesyłam Ci raport o trendach w branży na 2024 rok. Warto się z nim zapoznać.", sender_id: "mentor", is_mentor: true, date: "2024-05-27T11:15:00" },
    { id: 2, text: "Dziękuję! Przeczytam i chętnie omówię na następnej sesji.", sender_id: "user", is_mentor: false, date: "2024-05-27T11:20:00" },
  ],
  "mentee-101": [
    { id: 1, text: "Cześć, sprawdziłem Twój ostatni beat. Naprawdę dobra robota!", sender_id: "user", is_mentor: true, date: "2024-05-28T09:30:00" },
    { id: 2, text: "Dziękuję za ostatnie wskazówki! Bardzo mi pomogły.", sender_id: "mentee", is_mentor: false, date: "2024-05-28T09:45:00" },
  ],
  "mentee-102": [
    { id: 1, text: "Jak idzie praca nad techniką wokalną?", sender_id: "user", is_mentor: true, date: "2024-05-26T18:00:00" },
    { id: 2, text: "Dużo ćwiczę. Przesyłam nagranie, o które prosiłeś.", sender_id: "mentee", is_mentor: false, date: "2024-05-26T18:20:00" },
  ]
};

export default function Mentorship() {
  const [activeTab, setActiveTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMyMentoringsTab, setActiveMyMentoringsTab] = useState("my-mentors");
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [conversationTab, setConversationTab] = useState<"messages" | "notes" | "files">("messages");
  const [newMessage, setNewMessage] = useState("");
  
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

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentor(mentorId);
  };

  const handleBackClick = () => {
    setSelectedMentor(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedMentor) {
      // W prawdziwej aplikacji tutaj byłoby wysyłanie wiadomości do API
      console.log("Wysyłanie wiadomości:", newMessage);
      setNewMessage("");
    }
  };
  
  const getSelectedMentorName = () => {
    if (!selectedMentor) return "";
    
    if (selectedMentor.startsWith("mentor-")) {
      const mentorId = parseInt(selectedMentor.split("-")[1]);
      const mentor = myMentors.find(m => m.id === mentorId);
      return mentor?.name || "";
    } else if (selectedMentor.startsWith("mentee-")) {
      const menteeId = parseInt(selectedMentor.split("-")[1]);
      const mentee = myMentees.find(m => m.id === menteeId);
      return mentee?.name || "";
    }
    
    return "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            {selectedMentor ? (
              // Widok konwersacji z mentorem/podopiecznym
              <div>
                <Button 
                  variant="ghost" 
                  onClick={handleBackClick} 
                  className="mb-4 gap-2 pl-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Powrót do listy
                </Button>
                
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedMentor.startsWith("mentor-") 
                          ? myMentors.find(m => m.id === parseInt(selectedMentor.split("-")[1]))?.image 
                          : "/placeholder.svg"} 
                        />
                        <AvatarFallback>{getSelectedMentorName().charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{getSelectedMentorName()}</CardTitle>
                        <CardDescription>
                          {selectedMentor.startsWith("mentor-") 
                            ? myMentors.find(m => m.id === parseInt(selectedMentor.split("-")[1]))?.title
                            : myMentees.find(m => m.id === parseInt(selectedMentor.split("-")[1]))?.role}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                <Tabs defaultValue="messages" value={conversationTab} onValueChange={(value) => setConversationTab(value as "messages" | "notes" | "files")}>
                  <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Wiadomości
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <ScrollText className="h-4 w-4" />
                      Notatki
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      Pliki
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="messages" className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
                      {(conversationMessages[selectedMentor] || []).map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.is_mentor ? 'justify-start' : 'justify-end'}`}
                        >
                          <div 
                            className={`max-w-[75%] p-3 rounded-lg ${
                              message.is_mentor 
                                ? 'bg-white dark:bg-gray-800 border' 
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.is_mentor 
                                ? 'text-gray-500 dark:text-gray-400' 
                                : 'text-primary-foreground/70'
                            }`}>
                              {formatDate(message.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 items-end">
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Textarea 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napisz wiadomość..."
                        className="flex-1 min-h-10"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Notatki</h3>
                      <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Nowa notatka
                      </Button>
                    </div>
                    
                    {(conversationNotes[selectedMentor] || []).length > 0 ? (
                      <div className="space-y-3">
                        {(conversationNotes[selectedMentor] || []).map((note) => (
                          <Card key={note.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{note.title}</CardTitle>
                              <CardDescription>{formatDate(note.date)}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <ScrollText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium">Brak notatek</h3>
                        <p className="text-gray-500">Dodaj pierwszą notatkę do tego mentoringu</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="files" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Pliki</h3>
                      <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Dodaj plik
                      </Button>
                    </div>
                    
                    {(conversationFiles[selectedMentor] || []).length > 0 ? (
                      <div className="space-y-2">
                        {(conversationFiles[selectedMentor] || []).map((file) => (
                          <Card key={file.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="flex items-center p-4">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mr-3">
                                  <File className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{file.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>{formatDate(file.date)}</span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary">
                                  Pobierz
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <File className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium">Brak plików</h3>
                        <p className="text-gray-500">Dodaj pierwszy plik do tego mentoringu</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // Główny widok mentoringu
              <div>
                <h1 className="text-3xl font-bold mb-8">Mentoring</h1>
                
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger value="groups" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Grupy Mentorskie
                    </TabsTrigger>
                    <TabsTrigger value="mentors" className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Mentorzy
                    </TabsTrigger>
                    <TabsTrigger value="my-mentorings" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Moje Mentoringi
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="groups">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Szukaj grup mentorskich..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filtry
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredCommunities.map((community, i) => (
                        <MentorshipCard
                          key={community.title}
                          title={community.title}
                          description={community.description}
                          image={community.image}
                          members={community.members}
                          rating={community.rating}
                          features={community.features}
                          popular={community.popular}
                          delay={i * 0.1}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mentors">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Szukaj mentorów..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filtry
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {filteredMentors.map((mentor, i) => (
                        <MentorCard
                          key={mentor.id}
                          {...mentor}
                          delay={i * 0.1}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="my-mentorings">
                    <Tabs defaultValue={activeMyMentoringsTab} onValueChange={setActiveMyMentoringsTab} className="mt-4">
                      <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="my-mentors" className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Moi Mentorzy
                        </TabsTrigger>
                        <TabsTrigger value="my-mentees" className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Moi Podopieczni
                        </TabsTrigger>
                        <TabsTrigger value="my-groups" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Moje Grupy
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="my-mentors">
                        {myMentors.length > 0 ? (
                          <div className="space-y-4">
                            {myMentors.map((mentor) => (
                              <Card 
                                key={mentor.id} 
                                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleMentorClick(`mentor-${mentor.id}`)}
                              >
                                <CardContent className="p-0">
                                  <div className="flex items-center p-4">
                                    <Avatar className="h-12 w-12 mr-4">
                                      <AvatarImage src={mentor.image} alt={mentor.name} />
                                      <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium truncate">{mentor.name}</h3>
                                        <span className="text-xs text-gray-500">{formatDate(mentor.lastMessageDate)}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 truncate">{mentor.lastMessage}</p>
                                    </div>
                                    {mentor.unreadCount > 0 && (
                                      <Badge className="ml-2">{mentor.unreadCount}</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <UserCog className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium mb-2">Nie masz jeszcze mentorów</h3>
                            <p className="text-gray-500 mb-6">Odkryj doświadczonych mentorów, którzy pomogą Ci rozwinąć Twoje umiejętności.</p>
                            <Button onClick={() => setActiveTab("mentors")}>Znajdź mentora</Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="my-mentees">
                        {myMentees.length > 0 ? (
                          <div className="space-y-4">
                            {myMentees.map((mentee) => (
                              <Card 
                                key={mentee.id} 
                                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleMentorClick(`mentee-${mentee.id}`)}  
                              >
                                <CardContent className="p-0">
                                  <div className="flex items-center p-4">
                                    <Avatar className="h-12 w-12 mr-4">
                                      <AvatarImage src={mentee.image} alt={mentee.name} />
                                      <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium truncate">{mentee.name}</h3>
                                        <span className="text-xs text-gray-500">{formatDate(mentee.lastMessageDate)}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 truncate">{mentee.lastMessage}</p>
                                    </div>
                                    {mentee.unreadCount > 0 && (
                                      <Badge className="ml-2">{mentee.unreadCount}</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium mb-2">Nie masz jeszcze podopiecznych</h3>
                            <p className="text-gray-500 mb-6">Zostań mentorem i pomagaj innym rozwijać ich umiejętności.</p>
                            <Button>Zostań mentorem</Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="my-groups">
                        {myGroups.length > 0 ? (
                          <div className="space-y-4">
                            {myGroups.map((group) => (
                              <Card key={group.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                  <div className="flex items-center p-4">
                                    <div className="h-12 w-12 rounded overflow-hidden mr-4">
                                      <img 
                                        src={group.image} 
                                        alt={group.title}
                                        className="h-full w-full object-cover" 
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium truncate">{group.title}</h3>
                                        <span className="text-xs text-gray-500">{formatDate(group.lastActivity)}</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{group.members} członków</p>
                                    </div>
                                    {group.unreadCount > 0 && (
                                      <Badge className="ml-2">{group.unreadCount}</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium mb-2">Nie należysz do żadnej grupy mentorskiej</h3>
                            <p className="text-gray-500 mb-6">Dołącz do społeczności i ucz się razem z innymi!</p>
                            <Button onClick={() => setActiveTab("groups")}>Przeglądaj grupy</Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
