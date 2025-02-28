
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
import { Loader2, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  
  // Multi-image support
  const [productImages, setProductImages] = useState<{
    file: File | null;
    preview: string | null;
    existingUrl?: string;
  }[]>([{ file: null, preview: null }]);
  
  const [isForTesting, setIsForTesting] = useState(false);
  const [testingPrice, setTestingPrice] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePercentage, setSalePercentage] = useState('');
  
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
    setProductImages([{ file: null, preview: null }]);
    setIsForTesting(false);
    setTestingPrice('');
    setIsOnSale(false);
    setSalePercentage('');
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
    if (productImages.length > 1) {
      const updatedImages = [...productImages];
      updatedImages.splice(index, 1);
      setProductImages(updatedImages);
    }
  };
  
  const uploadImages = async (): Promise<string> => {
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
          // Ensure the bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const productsBucketExists = buckets?.some(bucket => bucket.name === 'products');
          
          if (!productsBucketExists) {
            await supabase.storage.createBucket('products', {
              public: true,
              fileSizeLimit: 10485760 // 10MB limit
            });
          }
          
          const { data, error } = await supabase.storage
            .from('products')
            .upload(filePath, image.file);
          
          if (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
          }
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);
          
          uploadedUrls.push(urlData.publicUrl);
        } catch (err) {
          console.error('Error in image upload:', err);
          // Continue with other images even if one fails
        }
      }
    }
    
    // Join multiple images with a delimiter that can be parsed later
    // For now, we'll just use the first image since the schema expects a string
    return uploadedUrls.length > 0 ? uploadedUrls[0] : '';
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
      // Upload images
      const imageUrl = await uploadImages();
      
      // Find selected category name
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category: selectedCategory?.name, // Keep for backward compatibility
        category_id: categoryId, // Store the category ID
        image_url: imageUrl, // Now this is a string, as required by the schema
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
              
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <Label>Zdjęcia produktu ({productImages.length}/8)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addImageField}
                    disabled={productImages.length >= 8}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Dodaj zdjęcie
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productImages.map((image, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-3 flex flex-col gap-2">
                        {index > 0 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute -top-2 -right-2 h-6 w-6 z-10"
                            onClick={() => removeImageField(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-xs" htmlFor={`image-${index}`}>
                            Zdjęcie {index + 1}
                          </Label>
                          <Input 
                            id={`image-${index}`} 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="text-xs"
                          />
                        </div>
                        
                        {image.preview ? (
                          <div className="rounded-md overflow-hidden border bg-muted/50 aspect-square">
                            <img 
                              src={image.preview} 
                              alt={`Product preview ${index + 1}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center rounded-md border bg-muted/20 aspect-square">
                            <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Dodaj do 8 zdjęć produktu. Zalecany format: JPG lub PNG, wymiary min. 800x800px.
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
