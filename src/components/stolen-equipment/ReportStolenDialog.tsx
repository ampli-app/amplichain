
import { useState } from 'react';
import { Calendar, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCategories, useLocations } from '@/hooks/useStolenEquipment';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MediaFile } from '@/components/social/MediaPreview';
import { uploadMediaToStorage } from '@/utils/mediaUtils';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { MediaUploadSection } from '@/components/consultations/MediaUploadSection';

const reportFormSchema = z.object({
  title: z.string()
    .min(5, "Tytuł musi mieć co najmniej 5 znaków")
    .max(100, "Tytuł może mieć maksymalnie 100 znaków"),
  description: z.string()
    .min(20, "Opis musi mieć co najmniej 20 znaków")
    .max(1000, "Opis może mieć maksymalnie 1000 znaków"),
  category_id: z.string({
    required_error: "Wybierz kategorię",
  }),
  location: z.string()
    .min(3, "Lokalizacja musi mieć co najmniej 3 znaki"),
  date: z.date({
    required_error: "Wybierz datę kradzieży",
  }),
  serial_number: z.string().optional(),
  contact_info: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportStolenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportStolenDialog({ open, onOpenChange }: ReportStolenDialogProps) {
  const { isLoggedIn, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  const queryClient = useQueryClient();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      location: "",
      date: new Date(),
      serial_number: "",
      contact_info: "",
      images: [],
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    if (!isLoggedIn) {
      toast.error("Musisz być zalogowany, aby zgłosić kradzież sprzętu");
      return;
    }

    setIsSubmitting(true);
    try {
      // Najpierw prześlij zdjęcia, jeśli zostały dodane
      const imageUrls: string[] = [];
      
      if (media.length > 0) {
        setUploadingImages(true);
        
        // Prześlij wszystkie zdjęcia asynchronicznie
        const uploadPromises = media.map(async (mediaItem) => {
          if (mediaItem.file) {
            // Prześlij zdjęcie do bucketa 'stolen-equipment'
            const imageUrl = await uploadMediaToStorage(mediaItem.file, 'stolen-equipment');
            
            if (imageUrl) {
              return imageUrl;
            }
          } else if (mediaItem.url) {
            // Jeśli to URL, po prostu go użyj
            return mediaItem.url;
          }
          return null;
        });
        
        // Poczekaj na przesłanie wszystkich zdjęć
        const results = await Promise.all(uploadPromises);
        results.forEach(url => {
          if (url) imageUrls.push(url);
        });
        
        setUploadingImages(false);
      }

      const formattedDate = format(values.date, 'dd.MM.yyyy');

      const { error } = await supabase.from('stolen_equipment').insert({
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        location: values.location,
        date: formattedDate,
        serial_number: values.serial_number || null,
        contact_info: values.contact_info || null,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null, // Pierwsze zdjęcie jako główne
        images: imageUrls.length > 0 ? imageUrls : null, // Wszystkie zdjęcia jako tablica
        user_id: user?.id,
        status: 'unverified',
      });

      if (error) throw error;

      toast.success("Twoje zgłoszenie zostało przyjęte");
      form.reset();
      setMedia([]);
      onOpenChange(false);
      
      queryClient.invalidateQueries({ queryKey: ['stolenEquipment'] });
    } catch (error) {
      console.error("Błąd podczas zgłaszania kradzieży:", error);
      toast.error("Wystąpił błąd podczas zgłaszania kradzieży");
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Logowanie wymagane</DialogTitle>
            <DialogDescription>
              Musisz być zalogowany, aby zgłosić kradzież sprzętu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
            <Button onClick={() => {
              onOpenChange(false);
              toast.info("Przekierowanie do strony logowania");
            }}>Zaloguj się</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] px-6 md:px-8 max-h-[90vh]">
        <DialogHeader className="pb-2">
          <DialogTitle>Zgłoś kradzież sprzętu</DialogTitle>
          <DialogDescription>
            Podaj szczegółowe informacje o skradzionym sprzęcie. Im więcej szczegółów, tym większa szansa na odzyskanie.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-6">
          <div className="px-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa sprzętu</FormLabel>
                      <FormControl>
                        <Input placeholder="np. Fender Stratocaster (1976)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Podaj pełną nazwę, model i rok produkcji sprzętu (jeśli znany).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoria</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz kategorię" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokalizacja</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz lokalizację" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.name}>
                                {location.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Inna lokalizacja</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value === "other" && (
                          <Input 
                            className="mt-2" 
                            placeholder="Wpisz lokalizację"
                            onChange={(e) => form.setValue("location", e.target.value)}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data kradzieży</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP", { locale: pl })
                              ) : (
                                <span>Wybierz datę</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Szczegółowy opis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Opisz szczegółowo jak wygląda sprzęt, wszelkie znaki szczególne, naklejki, wytarcia, itp."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Podaj jak najwięcej szczegółów, które pomogą w identyfikacji sprzętu.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer seryjny (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="np. 123456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Podaj numer seryjny jeśli go znasz - pomoże to w identyfikacji sprzętu.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dane kontaktowe (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="np. telefon, email, inne" {...field} />
                      </FormControl>
                      <FormDescription>
                        Podaj dane kontaktowe, jeśli chcesz by osoby z informacjami mogły się z Tobą skontaktować bezpośrednio.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zdjęcia sprzętu</FormLabel>
                      <FormControl>
                        <div className="mt-1">
                          <MediaUploadSection
                            media={media}
                            setMedia={(newMedia) => {
                              setMedia(newMedia);
                              // Ustawienie URL zdjęć jako wartość pola
                              const imageUrls = newMedia.map(item => item.url);
                              field.onChange(imageUrls);
                            }}
                            disabled={isSubmitting || uploadingImages}
                            maxFiles={6} // Zwiększono limit z 1 do 6 zdjęć
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Dodaj do 6 zdjęć sprzętu, które pomogą w jego identyfikacji.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="mt-6" />
                
                <div className="flex w-full gap-3 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Anuluj
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || uploadingImages}
                    className="flex-1 sm:flex-none bg-[#8a9a14] hover:bg-[#788618]"
                  >
                    {isSubmitting || uploadingImages ? "Wysyłanie..." : "Zgłoś kradzież"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
