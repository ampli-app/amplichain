
import { useState } from 'react';
import { Calendar, MapPin, Upload } from 'lucide-react';
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
  image_url: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportStolenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportStolenDialog({ open, onOpenChange }: ReportStolenDialogProps) {
  const { isLoggedIn, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      image_url: "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Zdjęcie jest za duże. Maksymalny rozmiar to 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Używamy nowego bucketa 'stolen-equipment' zamiast 'public'
      const { error: uploadError, data } = await supabase.storage
        .from('stolen-equipment')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Pobierz publiczny URL pliku z nowego bucketa
      const { data: { publicUrl } } = supabase.storage.from('stolen-equipment').getPublicUrl(filePath);
      
      setImagePreview(publicUrl);
      form.setValue("image_url", publicUrl);
      toast.success("Zdjęcie zostało przesłane");
    } catch (error) {
      console.error("Błąd podczas przesyłania zdjęcia:", error);
      toast.error("Nie udało się przesłać zdjęcia");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (values: ReportFormValues) => {
    if (!isLoggedIn) {
      toast.error("Musisz być zalogowany, aby zgłosić kradzież sprzętu");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = format(values.date, 'dd.MM.yyyy');

      const { error } = await supabase.from('stolen_equipment').insert({
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        location: values.location,
        date: formattedDate,
        serial_number: values.serial_number || null,
        contact_info: values.contact_info || null,
        image_url: values.image_url || null,
        user_id: user?.id,
        status: 'unverified',
      });

      if (error) throw error;

      toast.success("Twoje zgłoszenie zostało przyjęte");
      form.reset();
      setImagePreview(null);
      onOpenChange(false);
      
      queryClient.invalidateQueries({ queryKey: ['stolenEquipment'] });
    } catch (error) {
      console.error("Błąd podczas zgłaszania kradzieży:", error);
      toast.error("Wystąpił błąd podczas zgłaszania kradzieży");
    } finally {
      setIsSubmitting(false);
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
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zdjęcie sprzętu (opcjonalnie)</FormLabel>
                      <FormControl>
                        <div className="grid gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              disabled={uploadingImage}
                              asChild
                            >
                              <span>
                                <Upload className="mr-2 h-4 w-4" />
                                {uploadingImage ? "Przesyłanie..." : "Dodaj zdjęcie"}
                              </span>
                            </Button>
                          </label>
                          {imagePreview && (
                            <div className="mt-2 relative">
                              <img
                                src={imagePreview}
                                alt="Podgląd"
                                className="w-full max-h-48 object-contain rounded-md border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setImagePreview(null);
                                  form.setValue("image_url", "");
                                }}
                              >
                                Usuń
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Dodaj zdjęcie sprzętu, które pomoże w jego identyfikacji.
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
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none bg-[#8a9a14] hover:bg-[#788618]"
                  >
                    {isSubmitting ? "Wysyłanie..." : "Zgłoś kradzież"}
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
