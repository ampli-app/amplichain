
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Pencil, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export function SubcategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
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
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    }
  };
  
  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Błąd podczas pobierania podkategorii:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać podkategorii. Spróbuj ponownie później.",
          variant: "destructive",
        });
      } else {
        setSubcategories(data || []);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setCategoryId('');
    setEditingSubcategory(null);
  };
  
  const handleEditClick = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setName(subcategory.name);
    setSlug(subcategory.slug);
    setDescription(subcategory.description || '');
    setCategoryId(subcategory.category_id);
    setShowAddDialog(true);
  };
  
  const handleNameChange = (value: string) => {
    setName(value);
    // Generujemy slug z nazwy
    if (!editingSubcategory) {
      setSlug(value.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, ''));
    }
  };
  
  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim() || !categoryId) {
      toast({
        title: "Błąd walidacji",
        description: "Uzupełnij wszystkie wymagane pola.",
        variant: "destructive",
      });
      return;
    }
    
    setFormLoading(true);
    
    try {
      if (editingSubcategory) {
        // Aktualizacja podkategorii
        const { error } = await supabase
          .from('subcategories')
          .update({
            name,
            slug,
            description: description || null,
            category_id: categoryId,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSubcategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Sukces",
          description: "Podkategoria została zaktualizowana.",
        });
      } else {
        // Dodawanie nowej podkategorii
        const { error } = await supabase
          .from('subcategories')
          .insert({
            name,
            slug,
            description: description || null,
            category_id: categoryId
          });
        
        if (error) throw error;
        
        toast({
          title: "Sukces",
          description: "Podkategoria została dodana.",
        });
      }
      
      // Zamknij dialog i odśwież listę
      setShowAddDialog(false);
      resetForm();
      await fetchSubcategories();
      
    } catch (err: any) {
      console.error('Błąd podczas zapisywania podkategorii:', err);
      
      let errorMessage = "Nie udało się zapisać podkategorii. Spróbuj ponownie później.";
      if (err.code === '23505') {
        errorMessage = "Podkategoria o podanej nazwie lub slug już istnieje.";
      }
      
      toast({
        title: "Błąd",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteClick = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę podkategorię? Ta operacja jest nieodwracalna.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Podkategoria została usunięta.",
      });
      
      // Odśwież listę
      await fetchSubcategories();
      
    } catch (err) {
      console.error('Błąd podczas usuwania podkategorii:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć podkategorii. Spróbuj ponownie później.",
        variant: "destructive",
      });
    }
  };
  
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : "Nieznana kategoria";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Zarządzanie podkategoriami</h2>
        <Button onClick={() => {
          resetForm();
          setShowAddDialog(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj podkategorię
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-lg text-muted-foreground">Brak podkategorii. Dodaj pierwszą!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Data utworzenia</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((subcategory) => (
                <TableRow key={subcategory.id}>
                  <TableCell className="font-medium">{subcategory.name}</TableCell>
                  <TableCell>{subcategory.slug}</TableCell>
                  <TableCell>{getCategoryName(subcategory.category_id)}</TableCell>
                  <TableCell>{new Date(subcategory.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditClick(subcategory)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDeleteClick(subcategory.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? 'Edytuj podkategorię' : 'Dodaj podkategorię'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Kategoria</Label>
              <Select 
                value={categoryId} 
                onValueChange={setCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input
                id="name"
                placeholder="np. Gitary elektryczne"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="np. gitary-elektryczne"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Unikalny identyfikator URL dla podkategorii. Używaj tylko małych liter, cyfr i myślników.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Opis (opcjonalnie)</Label>
              <Input
                id="description"
                placeholder="Krótki opis podkategorii"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSubcategory ? 'Zapisz zmiany' : 'Dodaj podkategorię'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
