
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { CalendarClock, Clock, Heart, MessageSquare, Share, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { CategoryBadge } from "@/components/marketplace/categories/CategoryButton";

interface Consultation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  categories: string[];
  experience: string;
  availability: string[];
  is_online: boolean;
  location: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface ConsultationOrder {
  id: string;
  consultation_id: string;
  user_id: string;
  expert_id: string;
  status: string;
  price: number;
  date: string;
  time: string;
  is_paid: boolean;
  is_online: boolean;
  location: string;
  created_at: string;
}

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [existingOrder, setExistingOrder] = useState<ConsultationOrder | null>(null);

  useEffect(() => {
    if (id) {
      fetchConsultationDetails();
      checkIfFavorite();
      checkExistingOrder();
    }
  }, [id, user]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          profiles:user_id(id, username, full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching consultation:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować danych konsultacji",
          variant: "destructive",
        });
      } else if (data) {
        // Type assertion to handle the profiles data
        const consultationData = data as unknown as Consultation;
        
        setConsultation(consultationData);
        setIsOwner(user?.id === consultationData.user_id);

        // Przykładowe dni (w prawdziwej aplikacji byłyby pobrane z availabilities z bazy danych)
        const days = consultationData.availability || [];
        setAvailableDates(days);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingOrder = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("consultation_orders")
        .select("*")
        .eq("consultation_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking existing order:", error);
      } else if (data && data.length > 0) {
        setExistingOrder(data[0] as ConsultationOrder);
      }
    } catch (error) {
      console.error("Unexpected error checking order:", error);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("item_id", id)
        .eq("item_type", "consultation");

      if (error) {
        console.error("Error checking favorites:", error);
      } else {
        setIsFavorite(data && data.length > 0);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user?.id)
          .eq("item_id", id)
          .eq("item_type", "consultation");

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Usunięto z ulubionych",
          description: "Konsultacja została usunięta z listy ulubionych",
        });
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user?.id,
          item_id: id,
          item_type: "consultation",
        });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "Dodano do ulubionych",
          description: "Konsultacja została dodana do listy ulubionych",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować listy ulubionych",
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
    // Generowanie dostępnych godzin dla wybranego dnia (przykładowo)
    const times = [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
    ];
    setAvailableTimes(times);
    setSelectedTime(""); // Reset wybranej godziny
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleEdit = () => {
    navigate(`/edit-consultation/${id}`);
  };

  const handleMessage = () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    navigate(`/messages/consultation/${id}`);
  };

  const handleBookConsultation = async () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    if (!selectedDate || !selectedTime || !consultation) {
      toast({
        title: "Wybierz termin",
        description: "Aby zarezerwować konsultację, wybierz dzień i godzinę",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("consultation_orders")
        .insert({
          consultation_id: id,
          user_id: user?.id,
          expert_id: consultation.user_id,
          status: "pending",
          price: consultation.price,
          date: selectedDate,
          time: selectedTime,
          is_paid: false,
          is_online: consultation.is_online,
          location: consultation.location,
        })
        .select()
        .single();

      if (error) throw error;

      setOrderPlaced(true);
      setExistingOrder(data as ConsultationOrder);
      toast({
        title: "Sukces!",
        description: "Konsultacja została zarezerwowana. Przejdź do płatności aby ją potwierdzić.",
      });
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zarezerwować konsultacji",
        variant: "destructive",
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (existingOrder) {
      navigate(`/checkout/${existingOrder.id}`);
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: consultation?.title || "Sprawdź tę konsultację",
          text: "Znalazłem świetną konsultację na MusicHub!",
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link skopiowany",
        description: "Link do konsultacji został skopiowany do schowka",
      });
    }
  };

  // Ładowanie i brak danych
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="animate-pulse space-y-4 pt-24">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-24 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Konsultacja nie została znaleziona</h1>
            <p className="text-muted-foreground mb-6">
              Konsultacja, której szukasz nie istnieje lub została usunięta.
            </p>
            <Button onClick={() => navigate("/marketplace")}>
              Powrót do marketplace
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
      <main className="container mx-auto px-4 py-8 flex-1 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lewa kolumna - Szczegóły konsultacji */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h1 className="text-3xl font-bold mb-2 md:mb-0">{consultation.title}</h1>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShareClick}>
                  <Share className="h-5 w-5" />
                </Button>
                {isOwner && (
                  <Button variant="outline" onClick={handleEdit}>
                    Edytuj
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {consultation.categories.map((category, index) => (
                <CategoryBadge key={index} categorySlug={category} />
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-medium">5.0</span>
                <span className="text-muted-foreground ml-1">(14 opinii)</span>
              </div>
              {consultation.is_online ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Stacjonarnie
                </Badge>
              )}
            </div>

            <div className="bg-accent/30 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={consultation.profiles.avatar_url || "/placeholder.svg"}
                  alt={consultation.profiles.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">
                    {consultation.profiles.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{consultation.profiles.username}
                  </p>
                </div>
              </div>
              {!isOwner && (
                <Button
                  variant="outline"
                  onClick={handleMessage}
                  className="flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Wiadomość
                </Button>
              )}
            </div>

            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">O konsultacji</TabsTrigger>
                <TabsTrigger value="experience">Doświadczenie</TabsTrigger>
                <TabsTrigger value="reviews">Recenzje</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: consultation.description }}
                />

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Lokalizacja</h3>
                  <p className="text-muted-foreground">
                    {consultation.is_online
                      ? "Konsultacja online przez Zoom, Teams lub inne narzędzie"
                      : consultation.location}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="mt-4 space-y-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: consultation.experience }}
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Brak recenzji dla tej konsultacji.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Prawa kolumna - Rezerwacja */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Koszt konsultacji</p>
                    <p className="text-3xl font-bold">{consultation.price} zł</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <span>60 min</span>
                  </div>
                </div>

                {existingOrder ? (
                  <div className="bg-primary/10 p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2">Masz aktywną rezerwację</h3>
                    <div className="flex items-center mb-2">
                      <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                      <span>
                        {existingOrder.date}, {existingOrder.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Status: {existingOrder.is_paid ? "Opłacona" : "Oczekuje na płatność"}
                    </p>
                    {!existingOrder.is_paid && (
                      <Button onClick={handleProceedToCheckout} className="w-full">
                        Przejdź do płatności
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium mb-2">Dostępne terminy</h3>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Wybierz dzień:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {availableDates.map((date) => (
                          <Button
                            key={date}
                            variant={selectedDate === date ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleDateSelect(date)}
                          >
                            {date}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Wybierz godzinę:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimes.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-4">
                {!existingOrder && (
                  <Button
                    onClick={handleBookConsultation}
                    className="w-full"
                    disabled={!selectedDate || !selectedTime}
                  >
                    Zarezerwuj termin
                  </Button>
                )}
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">
                    <span className="font-medium">Zasady anulowania:</span> Bezpłatne anulowanie na 24h przed konsultacją
                  </p>
                  <p>
                    <span className="font-medium">Czas trwania:</span> 60 minut
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <AuthRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Wymagane logowanie"
        description="Aby wykonać tę akcję, musisz być zalogowany."
      />
    </div>
  );
}
