
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, X, Image as ImageIcon, Plus, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  // Multi-image support
  const [productImages, setProductImages] = useState<{
    file: File | null;
    preview: string | null;
    existingUrl?: string;
  }[]>([{ file: null, preview: null }]);
  
  const [isForTesting, setIsForTesting] = useState(false);
  const [testingPrice, setTestingPrice] = useState('');
  
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
      
      if (data) {
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
        
        // Handle images - we need to adapt this based on whether image_url is a string or something else
        let imageUrlsArray: string[] = [];
        
        if (typeof data.image_url === 'string') {
          imageUrlsArray = [data.image_url];
        } else if (Array.isArray(data.image_url)) {
          imageUrlsArray = data.image_url;
        }
        
        if (imageUrlsArray.length > 0) {
          setProductImages(
            imageUrlsArray.map(url => ({ file: null, preview: url, existingUrl: url }))
          );
        } else {
          setProductImages([{ file: null, preview: null }]);
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
    setProductImages([{ file: null, preview: null }]);
    setIsForTesting(false);
    setTestingPrice('');
  };
  
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const maxImages = 8;
      
      // Limit number of images
      const filesToProcess = files.slice(0, maxImages - productImages.length + 1);
      
      if (files.length > maxImages - productImages.length + 1) {
        toast({
          title: "Limit zdjęć",
          description: `Możesz dodać maksymalnie ${maxImages} zdjęć. Wybrano tylko pierwsze ${filesToProcess.length}.`,
          variant: "destructive",
        });
      }
      
      // Remove the empty placeholder if it exists
      let updatedImages = [...productImages];
      if (updatedImages.length === 1 && !updatedImages[0].file && !updatedImages[0].preview) {
        updatedImages = [];
      }
      
      // Process each file
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          updatedImages.push({
            file,
            preview: reader.result as string
          });
          
          // Update state after processing all files
          if (updatedImages.length <= maxImages) {
            setProductImages([...updatedImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a copy of the current images array
      const updatedImages = [...productImages];
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedImages[index] = {
          file,
          preview: reader.result as string
        };
        setProductImages(updatedImages);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addImageField = () => {
    if (productImages.length < 8) {
      setProductImages([...productImages, { file: null, preview: null }]);
    } else {
      toast({
        title: "Limit zdjęć",
        description: "Możesz dodać maksymalnie 8 zdjęć produktu.",
        variant: "destructive",
      });
    }
  };
  
  const removeImageField = (index: number) => {
    const updatedImages = [...productImages];
    updatedImages.splice(index, 1);
    
    // If we're removing the last image, add an empty one
    if (updatedImages.length === 0) {
      updatedImages.push({ file: null, preview: null });
    }
    
    setProductImages(updatedImages);
  };
  
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    // First, include any existing URLs that weren't changed
    for (const image of productImages) {
      if (!image.file && image.existingUrl) {
        uploadedUrls.push(image.existingUrl);
      }
    }
    
    // Then upload any new files
    for (const image of productImages) {
      if (image.file) {
        // Generate a unique file name
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;
        
        try {
          // Check if the bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const productsBucketExists = buckets?.some(bucket => bucket.name === 'products');
          
          if (!productsBucketExists) {
            // Create the bucket with public access if it doesn't exist
            try {
              const { data, error } = await supabase.storage.createBucket('products', {
                public: true,
                fileSizeLimit: 10485760 // 10MB limit
              });
              
              if (error) {
                console.error('Error creating bucket:', error);
                throw new Error(`Nie można utworzyć bucketu: ${error.message}`);
              }
            } catch (createError) {
              console.error('Error in bucket creation:', createError);
              // If we can't create a bucket, try to upload anyway to an existing one
            }
          }
          
          // Try to upload the image
          const { data, error } = await supabase.storage
            .from('products')
            .upload(filePath, image.file);
          
          if (error) {
            console.error('Error uploading image:', error);
            throw new Error('Nie udało się przesłać zdjęcia');
          }
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);
          
          uploadedUrls.push(urlData.publicUrl);
        } catch (err) {
          console.error('Error in image upload:', err);
          toast({
            title: "Błąd",
            description: `Problem z przesłaniem zdjęcia: ${err instanceof Error ? err.message : 'Nieznany błąd'}`,
            variant: "destructive",
          });
          // Continue with other images even if one fails
        }
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
    const hasImage = productImages.some(img => img.file || img.existingUrl);
    if (!hasImage) {
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
      // Upload images
      const imageUrls = await uploadImages();
      
      // Find selected category name
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: selectedCategory?.name, // Keep for backward compatibility
        category_id: categoryId, // Store the category ID
        image_url: imageUrls.length > 0 ? imageUrls[0] : '', // First image as main (for backward compatibility)
        image_urls: imageUrls, // Store all image URLs in an array
        for_testing: isForTesting,
        testing_price: isForTesting ? parseFloat(testingPrice) : null,
        sale: false, // Always set to false as we removed the feature
        sale_percentage: null, // Always set to null as we removed the feature
        condition: condition, // Stan produktu
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
          description: `Nie udało się ${isEditMode ? 'zaktualizować' : 'dodać'} produktu: ${error.message}`,
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
        description: `Wystąpił nieoczekiwany błąd: ${err instanceof Error ? err.message : 'Nieznany błąd'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId);
    // Get category name from id
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
      setCategory(selectedCategory.name);
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
              
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Zdjęcia produktu ({productImages.filter(img => img.file || img.preview).length}/8)</Label>
                </div>
                
                {/* Multiple image upload button */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="multiple-images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleMultipleImageUpload}
                    />
                    <label htmlFor="multiple-images" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm font-medium">Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać</span>
                      <span className="text-xs text-gray-500 mt-1">Możesz dodać do 8 zdjęć naraz</span>
                    </label>
                  </div>
                  
                  {/* Image previews grid */}
                  {productImages.some(img => img.file || img.preview) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
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
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Testing option with improved UI */}
              <div className="space-y-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="forTesting" 
                      checked={isForTesting}
                      onCheckedChange={(checked) => setIsForTesting(checked as boolean)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="forTesting" className="text-base font-medium">Udostępnij do testów przed zakupem</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Umożliwia potencjalnym kupującym wypożyczenie produktu na tydzień w niższej cenie.
                      </p>
                    </div>
                  </div>
                </div>
                
                {isForTesting && (
                  <div className="pl-6 pt-2">
                    <Label htmlFor="testingPrice">Cena tygodniowego testu (PLN)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        id="testingPrice" 
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={testingPrice}
                        onChange={(e) => setTestingPrice(e.target.value)}
                        className="max-w-xs"
                      />
                      <span className="text-sm text-muted-foreground">
                        Sugerowane: {price ? `${Math.round(Number(price) * 0.15)} PLN` : 'obliczane na podstawie ceny'}
                      </span>
                    </div>
                    <Alert className="mt-3 bg-blue-100/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Produkty z opcją testów są częściej wybierane przez kupujących. Zalecana cena testu to 10-20% wartości produktu.
                      </AlertDescription>
                    </Alert>
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
