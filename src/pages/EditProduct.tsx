
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Save, Trash2, Loader2, PlusCircle, X, Upload
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// Definicja stanów produktu
const productConditions = [
  { value: "new", label: "Nowy" },
  { value: "like_new", label: "Jak nowy" },
  { value: "very_good", label: "Bardzo dobry" },
  { value: "good", label: "Dobry" },
  { value: "fair", label: "Zadowalający" }
];

interface ProductImage {
  file: File | null;
  preview: string;
  existingUrl?: string;
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [condition, setCondition] = useState<string>("new");
  const [isForTesting, setIsForTesting] = useState(false);
  const [testingPrice, setTestingPrice] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePercentage, setSalePercentage] = useState('');
  
  // Multi-image support
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const MAX_IMAGES = 8;
  
  useEffect(() => {
    // Fetch categories
    async function fetchCategories() {
      try {
        setIsCategoriesLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Błąd podczas pobierania kategorii:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się pobrać kategorii. Spróbuj ponownie później.",
            variant: "destructive",
          });
        } else if (data) {
          // Filter out "Wszystkie kategorie" if it exists
          const filteredCategories = data.filter(cat => cat.slug !== 'all-categories');
          setCategories(filteredCategories);
        }
      } catch (err) {
        console.error('Nieoczekiwany błąd:', err);
      } finally {
        setIsCategoriesLoading(false);
      }
    }
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast({
        title: "Dostęp zabroniony",
        description: "Musisz być zalogowany, aby edytować produkty.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Fetch product data
    if (id) {
      fetchProductData(id);
    } else {
      // If no ID, redirect to marketplace
      navigate('/marketplace');
    }
  }, [id, isLoggedIn, user, categories]);
  
  const fetchProductData = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych produktu.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      if (!data) {
        toast({
          title: "Produkt nie znaleziony",
          description: "Nie znaleziono produktu o podanym ID.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      // Check if this product belongs to the current user
      if (user?.id !== data.user_id) {
        toast({
          title: "Brak uprawnień",
          description: "Nie możesz edytować produktów innych użytkowników.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      // Set form state with product data
      setTitle(data.title);
      setDescription(data.description || '');
      setPrice(data.price.toString());
      setCondition(data.condition || 'new');
      
      // Handle category selection
      if (data.category_id && data.categories) {
        setCategoryId(data.category_id);
        setCategory(data.categories.name);
      } else if (data.category) {
        // For backward compatibility with old data
        setCategory(data.category);
        // Try to find matching category id
        const matchingCategory = categories.find(cat => cat.name === data.category);
        if (matchingCategory) {
          setCategoryId(matchingCategory.id);
        }
      }
      
      setIsForTesting(data.for_testing || false);
      setTestingPrice(data.testing_price ? data.testing_price.toString() : '');
      setIsOnSale(data.sale || false);
      setSalePercentage(data.sale_percentage ? data.sale_percentage.toString() : '');
      
      // Obsługa zdjęć produktu
      if (data.image_url) {
        // Sprawdź czy jest to tablica zdjęć lub pojedyncze zdjęcie
        if (Array.isArray(data.image_url)) {
          // Ustaw istniejące zdjęcia
          const imagesWithPreviews = data.image_url.map(url => ({
            file: null,
            preview: url,
            existingUrl: url
          }));
          setProductImages(imagesWithPreviews);
        } else {
          // Pojedyncze zdjęcie jako string
          setProductImages([{
            file: null,
            preview: data.image_url,
            existingUrl: data.image_url
          }]);
        }
      } else {
        // Brak zdjęć
        setProductImages([]);
      }
      
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
  
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Sprawdź ile jeszcze możemy dodać zdjęć
      const remainingSlots = MAX_IMAGES - productImages.length;
      
      if (remainingSlots <= 0) {
        toast({
          title: "Limit zdjęć",
          description: `Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć. Usuń niektóre istniejące zdjęcia przed dodaniem nowych.`,
          variant: "destructive",
        });
        return;
      }
      
      // Limit liczby zdjęć
      const filesToProcess = files.slice(0, remainingSlots);
      
      if (files.length > remainingSlots) {
        toast({
          title: "Limit zdjęć",
          description: `Możesz dodać jeszcze tylko ${remainingSlots} zdjęć. Wybrano pierwsze ${filesToProcess.length}.`,
          variant: "destructive",
        });
      }
      
      // Przetwórz każdy plik
      const newImages: ProductImage[] = [];
      let processedFiles = 0;
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            file,
            preview: reader.result as string
          });
          
          processedFiles++;
          
          // Po przetworzeniu wszystkich plików, zaktualizuj stan
          if (processedFiles === filesToProcess.length) {
            setProductImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleAddImageClick = () => {
    const fileInput = document.getElementById('multiple-images');
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...productImages];
    updatedImages.splice(index, 1);
    setProductImages(updatedImages);
  };
  
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    // Najpierw dodaj wszystkie istniejące URL
    productImages.forEach(img => {
      if (img.existingUrl && !img.file) {
        uploadedUrls.push(img.existingUrl);
      }
    });
    
    // Następnie prześlij nowe pliki
    const filesToUpload = productImages.filter(img => img.file);
    
    for (const image of filesToUpload) {
      if (!image.file) continue;
      
      // Generuj unikalną nazwę pliku
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, image.file);
        
        if (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Błąd",
            description: `Nie udało się przesłać zdjęcia: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }
        
        // Pobierz publiczny URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(urlData.publicUrl);
      } catch (err) {
        console.error('Unexpected error during upload:', err);
      }
    }
    
    return uploadedUrls;
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
    
    if (!categoryId) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz kategorię produktu.",
        variant: "destructive",
      });
      return false;
    }
    
    if (productImages.length === 0) {
      toast({
        title: "Brak zdjęć",
        description: "Dodaj przynajmniej jedno zdjęcie produktu.",
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby edytować produkty.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prześlij wszystkie zdjęcia
      const imageUrls = await uploadImages();
      
      // Znajdź wybraną kategorię
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: selectedCategory?.name, // Zachowaj dla wstecznej kompatybilności
        category_id: categoryId, // Zapisz ID kategorii
        image_url: imageUrls, // Zapisz tablicę adresów URL zdjęć
        for_testing: isForTesting,
        testing_price: isForTesting ? parseFloat(testingPrice) : null,
        sale: isOnSale,
        sale_percentage: isOnSale ? parseFloat(salePercentage) : null,
        condition,
      };
      
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować produktu.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sukces",
        description: "Produkt został zaktualizowany.",
      });
      
      // Powróć do strony produktu
      navigate(`/marketplace/${id}`);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten produkt?");
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć produktu.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sukces",
        description: "Produkt został usunięty.",
      });
      
      // Przejdź do marketplace
      navigate('/marketplace');
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId);
    // Pobierz nazwę kategorii z ID
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
      setCategory(selectedCategory.name);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie danych produktu...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link 
              to={`/marketplace/${id}`} 
              className="inline-flex items-center gap-2 text-rhythm-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do produktu
            </Link>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Edytuj produkt</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="title">Nazwa produktu</Label>
                  <Input 
                    id="title" 
                    placeholder="np. Mikrofon XYZ Pro"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
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
                      required
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="category">Kategoria</Label>
                    <Select value={categoryId} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię" />
                      </SelectTrigger>
                      <SelectContent>
                        {isCategoriesLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Ładowanie kategorii...</span>
                          </div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Stan produktu */}
                <div className="grid gap-3">
                  <Label htmlFor="condition">Stan produktu</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz stan produktu" />
                    </SelectTrigger>
                    <SelectContent>
                      {productConditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Wybierz stan, który najlepiej opisuje Twój produkt.
                  </p>
                </div>
                
                {/* Multi-image upload component */}
                <div className="grid gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="images">Zdjęcia produktu ({productImages.length}/{MAX_IMAGES})</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddImageClick}
                      disabled={productImages.length >= MAX_IMAGES}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Dodaj zdjęcie
                    </Button>
                  </div>
                  
                  {/* Hidden input for uploading multiple images */}
                  <input
                    type="file"
                    id="multiple-images"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleMultipleImageUpload}
                  />
                  
                  {/* Drop zone for images */}
                  {productImages.length < MAX_IMAGES && (
                    <div 
                      className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={handleAddImageClick}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Możesz dodać maksymalnie {MAX_IMAGES} zdjęć (pozostało {MAX_IMAGES - productImages.length})
                      </p>
                    </div>
                  )}
                  
                  {/* Image previews */}
                  {productImages.length > 0 && (
                    <ScrollArea className="h-44 rounded-md border p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {productImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border bg-gray-100 dark:bg-gray-800">
                              <img 
                                src={image.preview} 
                                alt={`Product preview ${index + 1}`} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <Button 
                              type="button"
                              variant="destructive" 
                              size="icon" 
                              className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
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
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="destructive" 
                  type="button" 
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Usuń produkt
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => navigate(`/marketplace/${id}`)}
                    disabled={isSaving || isDeleting}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving || isDeleting}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Zapisz zmiany
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
