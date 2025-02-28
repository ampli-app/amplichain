
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}

// Product categories
const categories = [
  "Mikrofony",
  "Interfejsy Audio",
  "Monitory",
  "Słuchawki",
  "Kontrolery",
  "Instrumenty",
  "Oprogramowanie",
  "Akcesoria"
];

export function AddProductDialog({ open, onOpenChange, productId }: AddProductDialogProps) {
  const { isLoggedIn, user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [isForTesting, setIsForTesting] = useState(false);
  const [testingPrice, setTestingPrice] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePercentage, setSalePercentage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  useEffect(() => {
    if (open && !isLoggedIn) {
      onOpenChange(false);
      setShowAuthDialog(true);
    }
    
    // Reset form state when the dialog opens
    if (open && !productId) {
      resetForm();
      setIsEditMode(false);
    }
    
    // If productId is provided, fetch the product data
    if (open && productId) {
      setIsEditMode(true);
      fetchProductData(productId);
    }
  }, [open, isLoggedIn, productId]);
  
  const fetchProductData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych produktu do edycji.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Set form state with product data
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setCategory(data.category || '');
        setImageUrl(data.image_url || '');
        setIsForTesting(data.for_testing || false);
        setTestingPrice(data.testing_price ? data.testing_price.toString() : '');
        setIsOnSale(data.sale || false);
        setSalePercentage(data.sale_percentage ? data.sale_percentage.toString() : '');
        
        // Set image preview
        if (data.image_url) {
          setImagePreview(data.image_url);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUrl('');
    setIsForTesting(false);
    setTestingPrice('');
    setIsOnSale(false);
    setSalePercentage('');
    setImageFile(null);
    setImagePreview(null);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      // If there's no new image but there is an existing image URL, return it
      if (imageUrl) return imageUrl;
      
      return '';
    }
    
    // Generate a unique file name
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, imageFile);
    
    if (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Brak nazwy produktu",
        description: "Podaj nazwę produktu.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Nieprawidłowa cena",
        description: "Podaj poprawną cenę produktu.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!category) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz kategorię produktu.",
        variant: "destructive",
      });
      return false;
    }
    
    if (isForTesting && (!testingPrice.trim() || isNaN(parseFloat(testingPrice)) || parseFloat(testingPrice) <= 0)) {
      toast({
        title: "Nieprawidłowa cena testowa",
        description: "Podaj poprawną cenę tygodniowego testu.",
        variant: "destructive",
      });
      return false;
    }
    
    if (isOnSale && (!salePercentage.trim() || isNaN(parseFloat(salePercentage)) || parseFloat(salePercentage) <= 0 || parseFloat(salePercentage) >= 100)) {
      toast({
        title: "Nieprawidłowy procent zniżki",
        description: "Podaj procent zniżki między 1 a 99.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!isLoggedIn || !user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload image if there's a new one
      let imageUrlToUse = imageUrl;
      if (imageFile) {
        imageUrlToUse = await uploadImage();
      }
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category,
        image_url: imageUrlToUse,
        for_testing: isForTesting,
        testing_price: isForTesting ? parseFloat(testingPrice) : null,
        sale: isOnSale,
        sale_percentage: isOnSale ? parseFloat(salePercentage) : null,
        user_id: user.id
      };
      
      let result;
      
      if (isEditMode && productId) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
      } else {
        // Insert new product
        result = await supabase
          .from('products')
          .insert(productData);
      }
      
      const { error } = result;
      
      if (error) {
        console.error('Error saving product:', error);
        toast({
          title: "Błąd",
          description: `Nie udało się ${isEditMode ? 'zaktualizować' : 'dodać'} produktu.`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sukces",
        description: `Produkt został ${isEditMode ? 'zaktualizowany' : 'dodany'}.`,
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      resetForm();
      
      // Refresh page to show new product
      setTimeout(() => {
        window.location.href = '/marketplace';
      }, 1500);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edytuj produkt' : 'Dodaj nowy produkt'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Edytuj informacje o swoim produkcie' 
                : 'Dodaj własny produkt do Rynku. Wypełnij formularz poniżej, aby rozpocząć sprzedaż.'}
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Ładowanie...</span>
            </div>
          ) : (
            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label htmlFor="title">Nazwa produktu</Label>
                <Input 
                  id="title" 
                  placeholder="np. Mikrofon XYZ Pro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="description">Opis</Label>
                <Textarea 
                  id="description" 
                  placeholder="Szczegółowy opis produktu..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="price">Cena (PLN)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="category">Kategoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="image">Zdjęcie produktu</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  
                  {imagePreview && (
                    <div className="rounded-md overflow-hidden border bg-muted/50 aspect-square">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Dodaj zdjęcie produktu. Zalecany format: JPG lub PNG, wymiary min. 800x800px.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="forTesting" 
                    checked={isForTesting}
                    onCheckedChange={(checked) => setIsForTesting(checked as boolean)}
                  />
                  <Label htmlFor="forTesting">Dostępny do testów przez tydzień</Label>
                </div>
                
                {isForTesting && (
                  <div className="grid gap-3 pl-6">
                    <Label htmlFor="testingPrice">Cena tygodniowego testu (PLN)</Label>
                    <Input 
                      id="testingPrice" 
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={testingPrice}
                      onChange={(e) => setTestingPrice(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Ustaw cenę za tygodniowy test produktu. Powinno to być 10-20% wartości produktu.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="saleSwitch"
                    checked={isOnSale}
                    onCheckedChange={setIsOnSale}
                  />
                  <Label htmlFor="saleSwitch">Produkt w promocji</Label>
                </div>
                
                {isOnSale && (
                  <div className="grid gap-3 pl-6">
                    <Label htmlFor="salePercentage">Procent zniżki (%)</Label>
                    <Input 
                      id="salePercentage" 
                      type="number"
                      placeholder="0"
                      min="1"
                      max="99"
                      value={salePercentage}
                      onChange={(e) => setSalePercentage(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Anuluj
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Zapisz zmiany' : 'Dodaj produkt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać produkt do rynku, musisz być zalogowany."
      />
    </>
  );
}
