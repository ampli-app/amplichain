import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, X, Upload, Plus, PlusCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ProductImage {
  file: File | null;
  preview: string | null;
  existingUrl?: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  isSelected?: boolean;
}

// Definicja stanów produktu
const productConditions = [
  { value: "new", label: "Nowy" },
  { value: "like_new", label: "Jak nowy" },
  { value: "very_good", label: "Bardzo dobry" },
  { value: "good", label: "Dobry" },
  { value: "fair", label: "Zadowalający" }
];

export function AddProductDialog({ open, onOpenChange, productId }: AddProductDialogProps) {
  const { isLoggedIn, user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Stałe
  const MAX_IMAGES = 8;
  
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
  const [location, setLocation] = useState('');
  
  // Delivery options
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOptions, setSelectedDeliveryOptions] = useState<string[]>([]);
  
  // Multi-image support
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  
  const [isForTesting, setIsForTesting] = useState(false);
  const [testingPrice, setTestingPrice] = useState('');
  
  // Dodajemy nowe stany dla podkategorii
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);
  
  // Fetch categories from Supabase
  useEffect(() => {
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
  
  // Fetch delivery options
  useEffect(() => {
    async function fetchDeliveryOptions() {
      try {
        const { data, error } = await supabase
          .from('delivery_options')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Błąd podczas pobierania opcji dostawy:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się pobrać opcji dostawy. Spróbuj ponownie później.",
            variant: "destructive",
          });
        } else if (data) {
          setDeliveryOptions(data);
        }
      } catch (err) {
        console.error('Nieoczekiwany błąd:', err);
      }
    }
    
    fetchDeliveryOptions();
  }, []);
  
  // Dodaj nowy useEffect dla ładowania podkategorii gdy zmienia się kategoria
  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId]);
  
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
  
  // Funkcja do pobierania podkategorii
  const fetchSubcategories = async (categoryId: string) => {
    try {
      setIsSubcategoriesLoading(true);
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      
      if (error) {
        console.error('Błąd podczas pobierania podkategorii:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać podkategorii. Spróbuj ponownie później.",
          variant: "destructive",
        });
      } else if (data) {
        setSubcategories(data);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    } finally {
      setIsSubcategoriesLoading(false);
    }
  };
  
  const fetchProductData = async (id: string) => {
    setIsLoading(true);
    try {
      // Pobierz dane produktu
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
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
      
      // Pobierz opcje dostawy produktu
      const { data: productDeliveryData, error: productDeliveryError } = await supabase
        .from('product_delivery_options')
        .select('delivery_option_id')
        .eq('product_id', id);
      
      if (productDeliveryError) {
        console.error('Error fetching product delivery options:', productDeliveryError);
      }
      
      // Przygotuj wybrane opcje dostawy
      const selectedOptions = productDeliveryData 
        ? productDeliveryData.map(option => option.delivery_option_id) 
        : [];
      
      if (data) {
        // Set form state with product data
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setCondition(data.condition || 'new');
        setLocation(data.location || '');
        setSelectedDeliveryOptions(selectedOptions);
        
        // Ustawienie podkategorii
        if (data.subcategory_id) {
          setSubcategoryId(data.subcategory_id);
        }
        
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
        
        // Handle images
        if (data.image_url) {
          if (Array.isArray(data.image_url)) {
            // Tablica zdjęć
            const imagesWithPreviews = data.image_url.map(url => ({
              file: null,
              preview: url,
              existingUrl: url
            }));
            setProductImages(imagesWithPreviews);
          } else {
            try {
              // Sprawdź, czy to string JSON
              const parsed = JSON.parse(data.image_url);
              if (Array.isArray(parsed)) {
                const imagesWithPreviews = parsed.map(url => ({
                  file: null,
                  preview: url,
                  existingUrl: url
                }));
                setProductImages(imagesWithPreviews);
              } else {
                // Pojedyncze zdjęcie
                setProductImages([{
                  file: null,
                  preview: data.image_url,
                  existingUrl: data.image_url
                }]);
              }
            } catch (e) {
              // Jeśli to nie JSON, traktujemy jako pojedynczy URL
              setProductImages([{
                file: null,
                preview: data.image_url,
                existingUrl: data.image_url
              }]);
            }
          }
        } else {
          // Brak zdjęć
          setProductImages([]);
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
    setCategoryId('');
    setCondition('new');
    setLocation('');
    setProductImages([]);
    setIsForTesting(false);
    setTestingPrice('');
    setSelectedDeliveryOptions([]);
    setSubcategoryId('');
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
    const fileInput = document.getElementById('add-product-images');
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const removeImageField = (index: number) => {
    const updatedImages = [...productImages];
    updatedImages.splice(index, 1);
    setProductImages(updatedImages);
  };
  
  const toggleDeliveryOption = (optionId: string) => {
    if (selectedDeliveryOptions.includes(optionId)) {
      // Usuń opcję jeśli jest już wybrana
      setSelectedDeliveryOptions(prev => prev.filter(id => id !== optionId));
    } else {
      // Dodaj opcję jeśli nie jest wybrana
      setSelectedDeliveryOptions(prev => [...prev, optionId]);
    }
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
    
    // Check if at least one image is selected
    if (productImages.length === 0) {
      toast({
        title: "Brak zdjęcia",
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
    
    // Sprawdź czy wybrano przynajmniej jedną opcję dostawy
    if (selectedDeliveryOptions.length === 0) {
      toast({
        title: "Brak opcji dostawy",
        description: "Wybierz przynajmniej jedną opcję dostawy.",
        variant: "destructive",
      });
      return false;
    }
    
    // Sprawdź czy dla opcji "Odbiór osobisty" podano lokalizację
    const hasPickupOption = selectedDeliveryOptions.some(optionId => {
      const option = deliveryOptions.find(o => o.id === optionId);
      return option && option.name === 'Odbiór osobisty';
    });
    
    if (hasPickupOption && !location.trim()) {
      toast({
        title: "Brak lokalizacji",
        description: "Podaj lokalizację dla opcji odbioru osobistego.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const saveProductDeliveryOptions = async (productId: string) => {
    // Usuń wszystkie istniejące opcje dostawy dla produktu
    const { error: deleteError } = await supabase
      .from('product_delivery_options')
      .delete()
      .eq('product_id', productId);
    
    if (deleteError) {
      console.error('Error deleting existing delivery options:', deleteError);
      return false;
    }
    
    // Dodaj nowe opcje dostawy
    const deliveryOptionsToInsert = selectedDeliveryOptions.map(optionId => ({
      product_id: productId,
      delivery_option_id: optionId
    }));
    
    const { error: insertError } = await supabase
      .from('product_delivery_options')
      .insert(deliveryOptionsToInsert);
    
    if (insertError) {
      console.error('Error inserting delivery options:', insertError);
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
      // Upload images and get URLs
      const imageUrls = await uploadImages();
      
      // Find selected category name
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      
      // Konwertujemy tablicę adresów URL obrazów na string JSON
      const imageUrlsJson = JSON.stringify(imageUrls);
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: selectedCategory?.name, // Keep for backward compatibility
        category_id: categoryId, // Store the category ID
        subcategory_id: subcategoryId || null, // Dodajemy ID podkategorii
        image_url: imageUrlsJson, // Store JSON string of image URLs
        for_testing: isForTesting,
        testing_price: isForTesting ? parseFloat(testingPrice) : null,
        sale: false, // Always set to false as we removed the feature
        sale_percentage: null, // Always set to null as we removed the feature
        condition: condition, // Stan produktu
        location: location, // Lokalizacja produktu
        user_id: user.id
      };
      
      console.log("Dane produktu do zapisania:", productData);
      
      let result;
      let productId = isEditMode ? this.productId : null;
      
      if (isEditMode && this.productId) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', this.productId);
        
        productId = this.productId;
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();
        
        result = { error };
        
        if (data) {
          productId = data.id;
        }
      }
      
      const { error } = result;
      
      if (error) {
        console.error('Error saving product:', error);
        toast({
          title: "Błąd",
          description: `Nie udało się ${isEditMode ? 'zaktualizować' : 'dodać'} produktu: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      // Zapisz opcje dostawy dla produktu
      if (productId) {
        const deliveryOptionsSaved = await saveProductDeliveryOptions(productId);
        
        if (!deliveryOptionsSaved) {
          toast({
            title: "Ostrzeżenie",
            description: "Produkt został zapisany, ale wystąpił problem z zapisem opcji dostawy.",
            variant: "destructive",
          });
        }
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
        description: `Wystąpił nieoczekiwany błąd: ${err instanceof Error ? err.message : 'Nieznany błąd'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId);
    setSubcategoryId(''); // Resetujemy wybraną podkategorię gdy zmieniamy kategorię
    // Get category name from id
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
      setCategory(selectedCategory.name);
    }
  };
  
  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value);
  };
  
  const showAuthDialog = () => {
    setShowAuthDialog(true);
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
              
              {/* Dodajemy pole wyboru podkategorii */}
              {categoryId && (
                <div className="grid gap-3">
                  <Label htmlFor="subcategory">Podkategoria</Label>
                  <Select value={subcategoryId} onValueChange={handleSubcategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz podkategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {isSubcategoriesLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Ładowanie podkategorii...</span>
                        </div>
                      ) : subcategories.length > 0 ? (
                        <>
                          <SelectItem value="">Brak podkategorii</SelectItem>
                          {subcategories.map((subcat) => (
                            <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>
                          ))}
                        </>
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          Brak podkategorii dla wybranej kategorii
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
              
              {/* Lokalizacja produktu */}
              <div className="grid gap-3">
                <Label htmlFor="location">Lokalizacja produktu</Label>
                <Input 
                  id="location" 
                  placeholder="np. Warszawa, Kraków, itp."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Podaj lokalizację produktu, szczególnie ważne dla opcji odbioru osobistego.
                </p>
              </div>
              
              {/* Opcje dostawy */}
              <div className="grid gap-3">
                <Label>Dostępne opcje dostawy</Label>
                <div className="space-y-2">
                  {deliveryOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                      <Checkbox 
                        id={`delivery-${option.id}`} 
                        checked={selectedDeliveryOptions.includes(option.id)}
                        onCheckedChange={() => toggleDeliveryOption(option.id)}
                      />
                      <Label 
                        htmlFor={`delivery-${option.id}`} 
                        className="flex-1 flex justify-between items-center cursor-pointer"
                      >
                        <span>{option.name}</span>
                        <Badge variant="outline">
                          {option.price > 0 ? new Intl.NumberFormat('pl-PL', {
                            style: 'currency',
                            currency: 'PLN'
                          }).format(option.price) : 'Darmowa'}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Wybierz co najmniej jedną opcję dostawy dla swojego produktu.
                </p>
                
                {/* Informacja dla odbiorów osobistych */}
                {selectedDeliveryOptions.some(optionId => {
                  const option = deliveryOptions.find(o => o.id === optionId);
                  return option && option.name === 'Odbiór osobisty';
                }) && !location && (
                  <Alert className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Dla opcji odbioru osobistego zalecamy podanie dokładnej lokalizacji w polu "Lokalizacja produktu".
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* Multi-image upload */}
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Zdjęcia produktu ({productImages.length}/{MAX_IMAGES})</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddImageClick}
                    disabled={productImages.length >= MAX_IMAGES}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Dodaj zdjęcie
                  </Button>
                </div>
                
                {/* Hidden input for uploading multiple images */}
                <input
                  type="file"
                  id="add-product-images"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleMultipleImageUpload}
                />
                
                {/* Drop zone for images */}
                {productImages.length < MAX_IMAGES && (
                  <div 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
                    onClick={handleAddImageClick}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać</span>
                    <span className="text-xs text-gray-500 mt-1">
                      Możesz dodać maksymalnie {MAX_IMAGES} zdjęć (pozostało {MAX_IMAGES - productImages.length})
                    </span>
                  </div>
                )}
                
                {/* Image previews grid */}
                {productImages.length > 0 && (
                  <ScrollArea className="h-44 rounded-md border p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {productImages.map((image, index) => (
                        image.preview && (
                          <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-muted/50">
                            <img 
                              src={image.preview} 
                              alt={`Product preview ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => removeImageField(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      ))}
