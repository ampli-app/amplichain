
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  User,
  Music,
  Mic,
  HeadphonesIcon,
  Piano,
  Guitar,
  Drum
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Interfejsy danych
interface Consultant {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  title: string;
  bio: string;
  hourly_rate: number;
  rating: number;
  reviews_count: number;
  skills: string[];
  available: boolean;
  experience_years: number;
  quick_responder: boolean;
  specializations: string[];
}

// Przykładowe dane dla konsultantów - docelowo powinny być pobierane z bazy danych
const mockConsultants: Consultant[] = [
  {
    id: "1",
    user_id: "user-1",
    full_name: "Sarah Johnson",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D",
    title: "Producent muzyczny",
    bio: "Producent z ponad 10-letnim doświadczeniem w muzyce pop i R&B",
    hourly_rate: 75,
    rating: 4.9,
    reviews_count: 48,
    skills: ["Produkcja muzyczna", "Sound design", "Miks", "Mastering"],
    available: true,
    experience_years: 10,
    quick_responder: true,
    specializations: ["Pop", "R&B", "Sound design"]
  },
  {
    id: "2",
    user_id: "user-2",
    full_name: "Marcus Rivera",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Manager artystyczny",
    bio: "Doświadczony manager artystyczny specjalizujący się w budowaniu karier muzyków",
    hourly_rate: 65,
    rating: 4.7,
    reviews_count: 32,
    skills: ["Zarządzanie karierą", "Branding", "Planowanie tras", "Negocjacje kontraktów"],
    available: true,
    experience_years: 8,
    quick_responder: false,
    specializations: ["Management", "Branding", "Strategia"]
  },
  {
    id: "3",
    user_id: "user-3",
    full_name: "Daniel Lee",
    avatar_url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
    title: "Specjalista marketingu muzycznego",
    bio: "Ekspert od marketingu cyfrowego dla artystów niezależnych",
    hourly_rate: 55,
    rating: 4.8,
    reviews_count: 27,
    skills: ["Marketing cyfrowy", "Strategia social media", "Pitching do playlist", "Analityka"],
    available: true,
    experience_years: 6,
    quick_responder: true,
    specializations: ["Digital marketing", "Social media", "Strategia"]
  },
  {
    id: "4",
    user_id: "user-4",
    full_name: "Aisha Williams",
    avatar_url: "https://images.unsplash.com/photo-1589156288859-f0cb0d82b065?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjB3b21hbiUyMHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D",
    title: "Dyrektor A&R",
    bio: "Doświadczona dyrektor A&R z sukcesami w odkrywaniu i rozwijaniu talentów",
    hourly_rate: 85,
    rating: 4.9,
    reviews_count: 41,
    skills: ["Strategia A&R", "Rozwój artysty", "Networking w branży"],
    available: true,
    experience_years: 12,
    quick_responder: true,
    specializations: ["A&R", "Rozwój talentu", "Strategia"]
  },
  {
    id: "5",
    user_id: "user-5",
    full_name: "James Taylor",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Inżynier dźwięku",
    bio: "Doświadczony inżynier dźwięku z doświadczeniem w studiach i na koncertach",
    hourly_rate: 70,
    rating: 4.8,
    reviews_count: 56,
    skills: ["Nagrywanie", "Sound live", "Pro Tools", "Techniki mikrofonowe"],
    available: true,
    experience_years: 15,
    quick_responder: false,
    specializations: ["Studio", "Live sound", "Postprodukcja"]
  },
  {
    id: "6",
    user_id: "user-6",
    full_name: "Maria González",
    avatar_url: "https://images.unsplash.com/photo-1616529735207-b8cec7696cec?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHByb2Zlc3Npb25hbCUyMGxhdGluYSUyMHdvbWFufGVufDB8fDB8fHww",
    title: "Songwriterka",
    bio: "Doświadczona autorka tekstów z międzynarodowymi hitami w portfolio",
    hourly_rate: 65,
    rating: 4.9,
    reviews_count: 37,
    skills: ["Pisanie tekstów", "Kompozycja", "Harmonia", "Współpraca twórcza"],
    available: true,
    experience_years: 9,
    quick_responder: true,
    specializations: ["Pop", "R&B", "Country", "Teksty"]
  }
];

// Kategorie specjalizacji do filtrowania
const specializations = [
  { value: "production", label: "Produkcja muzyczna", icon: <Music className="h-4 w-4" /> },
  { value: "vocals", label: "Wokal", icon: <Mic className="h-4 w-4" /> },
  { value: "engineering", label: "Inżynieria dźwięku", icon: <HeadphonesIcon className="h-4 w-4" /> },
  { value: "piano", label: "Pianino / Klawisze", icon: <Piano className="h-4 w-4" /> },
  { value: "guitar", label: "Gitara", icon: <Guitar className="h-4 w-4" /> },
  { value: "drums", label: "Perkusja", icon: <Drum className="h-4 w-4" /> },
  { value: "marketing", label: "Marketing muzyczny", icon: <Search className="h-4 w-4" /> },
  { value: "management", label: "Management", icon: <User className="h-4 w-4" /> }
];

export function ConsultationsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Symulacja ładowania danych z backendu
    const fetchConsultants = async () => {
      setLoading(true);
      // Tutaj w rzeczywistej aplikacji byłoby pobieranie danych z backendu
      setTimeout(() => {
        setConsultants(mockConsultants);
        setLoading(false);
      }, 1000);
    };

    fetchConsultants();
  }, []);

  // Filtrowanie konsultantów na podstawie wyszukiwania i specjalizacji
  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = searchQuery === '' || 
      consultant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialization = selectedSpecialization === '' || 
      consultant.specializations.some(spec => 
        spec.toLowerCase().includes(selectedSpecialization.toLowerCase()));
    
    return matchesSearch && matchesSpecialization;
  });

  const handleContactClick = (consultantId: string) => {
    // Tutaj przekierowanie do czatu lub formularza kontaktowego
    navigate(`/messages/consultation/${consultantId}`);
  };

  // Renderowanie skeletonów podczas ładowania
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj konsultantów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Wszystkie specjalizacje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Wszystkie specjalizacje</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec.value} value={spec.value} className="flex items-center gap-2">
                  {spec.icon}
                  {spec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtry
          </Button>
        </div>
      </div>

      {filteredConsultants.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Brak pasujących konsultantów</h3>
          <p className="text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultants.map((consultant) => (
            <Card key={consultant.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={consultant.avatar_url || undefined} alt={consultant.full_name} />
                    <AvatarFallback>{consultant.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-medium">{consultant.full_name}</h3>
                        <p className="text-muted-foreground">{consultant.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{consultant.rating}</span>
                        <span className="text-muted-foreground text-sm">({consultant.reviews_count})</span>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm line-clamp-2">{consultant.bio}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {consultant.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm">
                      <div className="text-muted-foreground">
                        {consultant.experience_years} {consultant.experience_years === 1 ? 'rok' : 
                          consultant.experience_years < 5 ? 'lata' : 'lat'} doświadczenia
                      </div>
                      {consultant.quick_responder && (
                        <div className="flex items-center gap-1 text-green-600">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Szybko odpowiada</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 mt-4 md:mt-0 w-full md:w-auto">
                    <div className="text-lg font-semibold">{consultant.hourly_rate} zł/h</div>
                    <Button 
                      onClick={() => handleContactClick(consultant.id)}
                      className="w-full md:w-auto"
                    >
                      Kontakt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
