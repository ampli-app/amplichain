
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Image, X } from 'lucide-react';

const categories = [
  "Mikrofony", 
  "Interfejsy Audio", 
  "Kontrolery", 
  "Monitory", 
  "Słuchawki", 
  "Instrumenty", 
  "Oprogramowanie", 
  "Akcesoria"
];

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [forSale, setForSale] = useState(false);
  const [salePercentage, setSalePercentage] = useState('');
  
  const [forTesting, setForTesting] = useState(false);
  const [testingPrice, setTestingPrice] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (open && !isLoggedIn) {
      onOpenChange(false);
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby dodać nowy produkt.",
        variant: "destructive",
      });
    }
  }, [open, isLoggedIn, onOpenChange]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImagePreview = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageUrl('');
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa produktu jest wymagana",
        variant: "destructive",
      });
      return false;
    }
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Błąd",
        description: "Wprowadź poprawną cenę",
        variant: "destructive",
      });
      return false;
    }
    
    if (!category) {
      toast({
        title: "Błąd",
        description: "Wybierz kategorię produktu",
        variant: "destructive",
      });
      return false;
    }
    
    if (forSale && (!salePercentage.trim() || isNaN(parseFloat(salePercentage)) || parseFloat(salePercentage) <= 0 || parseFloat(salePercentage) >= 100)) {
      toast({
        title: "Błąd",
        description: "Wprowadź poprawny procent zniżki (1-99)",
        variant: "destructive",
      });
      return false;
    }
    
    if (forTesting && (!testingPrice.trim() || isNaN(parseFloat(testingPrice)) || parseFloat(testingPrice) <= 0)) {
      toast({
        title: "Błąd",
        description: "Wprowadź poprawną cenę wynajmu testowego",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile);
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Błąd",
          description: "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Unexpected error during image upload:', error);
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby dodać nowy produkt.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      // Upload image if a file was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else if (!imageUrl) {
          // If upload failed and no URL was provided, show error
          toast({
            title: "Błąd",
            description: "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Default to a placeholder image if no image is provided
      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop';
      }
      
      // Insert product into database
      const { data, error } = await supabase
        .from('products')
        .insert({
          title,
          description,
          price: parseFloat(price),
          category,
          image_url: finalImageUrl,
          user_id: user.id,
          sale: forSale,
          sale_percentage: forSale ? parseFloat(salePercentage) : null,
          for_testing: forTesting,
          testing_price: forTesting ? parseFloat(testingPrice) : null,
          rating: 0,
          review_count: 0
        });
      
      if (error) {
        console.error('Error creating product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się dodać produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Produkt został dodany pomyślnie!",
        });
        
        // Reset form and close dialog
        setTitle('');
        setDescription('');
        setPrice('');
        setCategory('');
        setImageUrl('');
        setImageFile(null);
        setImagePreview(null);
        setForSale(false);
        setSalePercentage('');
        setForTesting(false);
        setTestingPrice('');
        
        onOpenChange(false);
        
        // Redirect to marketplace to see the new product
        navigate('/marketplace');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nowy produkt</DialogTitle>
          <DialogDescription>
            Wypełnij formularz, aby dodać nowy produkt do rynku.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Nazwa produktu *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Np. Neumann U87 Mikrofon Pojemnościowy"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Cena (PLN) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Kategoria *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Opis produktu</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opisz swój produkt..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Zdjęcie produktu</Label>
                <div className="mt-1 border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Podgląd produktu" 
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        onClick={clearImagePreview}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center py-4">
                        <Image className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Kliknij, aby przesłać zdjęcie</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (maks. 5MB)</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="image" 
                        className="w-full mt-2 cursor-pointer text-center py-2 px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Upload className="h-4 w-4 inline-block mr-1" />
                        <span>Prześlij zdjęcie</span>
                      </label>
                    </>
                  )}
                </div>
                
                <div className="mt-3">
                  <Label htmlFor="imageUrl">Lub podaj URL zdjęcia</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={!!imagePreview}
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="forSale">Produkt w promocji</Label>
                    <p className="text-sm text-muted-foreground">
                      Zaznacz, jeśli produkt ma mieć obniżoną cenę
                    </p>
                  </div>
                  <Switch
                    id="forSale"
                    checked={forSale}
                    onCheckedChange={setForSale}
                  />
                </div>
                
                {forSale && (
                  <div>
                    <Label htmlFor="salePercentage">Procent zniżki (%)</Label>
                    <Input
                      id="salePercentage"
                      type="number"
                      min="1"
                      max="99"
                      step="1"
                      value={salePercentage}
                      onChange={(e) => setSalePercentage(e.target.value)}
                      placeholder="15"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="forTesting">Możliwość wynajmu testowego</Label>
                    <p className="text-sm text-muted-foreground">
                      Zaznacz, jeśli produkt można wypożyczyć na tydzień
                    </p>
                  </div>
                  <Switch
                    id="forTesting"
                    checked={forTesting}
                    onCheckedChange={setForTesting}
                  />
                </div>
                
                {forTesting && (
                  <div>
                    <Label htmlFor="testingPrice">Cena za tydzień (PLN)</Label>
                    <Input
                      id="testingPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={testingPrice}
                      onChange={(e) => setTestingPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Dodawanie...' : 'Dodaj produkt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
