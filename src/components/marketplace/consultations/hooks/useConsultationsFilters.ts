
import { useState, useEffect, useMemo } from 'react';

interface UseConsultationsFiltersProps {
  consultations: any[];
}

export function useConsultationsFilters({ consultations }: UseConsultationsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedContactMethods, setSelectedContactMethods] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('2000');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedContactMethods, priceRange]);
  
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      if (type === 'min') {
        setMinPrice(value);
        if (value !== '') {
          setPriceRange([parseInt(value), priceRange[1]]);
        }
      } else {
        setMaxPrice(value);
        if (value !== '') {
          setPriceRange([priceRange[0], parseInt(value)]);
        }
      }
    }
  };
  
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  const toggleContactMethod = (method: string) => {
    setSelectedContactMethods(prev => 
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filtrowanie konsultacji
  const filteredConsultations = useMemo(() => {
    return consultations.filter(consultation => {
      // Filtrowanie po wyszukiwaniu
      const matchesSearch = searchQuery === '' || 
        (consultation.title && consultation.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (consultation.description && consultation.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtrowanie po kategorii
      const matchesCategory = !selectedCategory || 
        (consultation.categories && consultation.categories.includes(selectedCategory));
      
      // Filtrowanie po metodach kontaktu
      const matchesContactMethods = selectedContactMethods.length === 0 || 
        (consultation.is_online && selectedContactMethods.includes('video')) ||
        (consultation.is_online && selectedContactMethods.includes('chat')) ||
        (consultation.location && selectedContactMethods.includes('phone'));
      
      // Filtrowanie po cenie
      const matchesPrice = consultation.price >= priceRange[0] && consultation.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesContactMethods && matchesPrice;
    });
  }, [consultations, searchQuery, selectedCategory, selectedContactMethods, priceRange]);
  
  const totalPages = Math.ceil(filteredConsultations.length / ITEMS_PER_PAGE);
  
  const getCurrentPageConsultations = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredConsultations.slice(startIndex, endIndex);
  };
  
  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedContactMethods,
    priceRange,
    setPriceRange,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    filteredConsultations,
    currentPage,
    totalPages,
    handlePriceInputChange,
    handleCategorySelect,
    toggleContactMethod,
    handlePageChange,
    getCurrentPageConsultations
  };
}
