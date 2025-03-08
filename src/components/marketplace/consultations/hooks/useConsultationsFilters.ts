
import { useState, useMemo } from 'react';

interface ConsultationsFiltersProps {
  consultations: any[];
}

export function useConsultationsFilters({ consultations }: ConsultationsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('1000');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Filtrowane konsultacje na podstawie wszystkich filtrów
  const filteredConsultations = useMemo(() => {
    return consultations.filter(consultation => {
      const matchesSearch = consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (consultation.description && consultation.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || 
                             (consultation.categories && 
                              consultation.categories.includes(selectedCategory));
      
      const price = parseFloat(consultation.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [consultations, searchQuery, selectedCategory, priceRange]);
  
  // Oblicz całkowitą liczbę stron
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  
  // Pobierz konsultacje dla bieżącej strony
  const getCurrentPageConsultations = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredConsultations.slice(startIndex, endIndex);
  };
  
  // Przełącz stronę
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Wybierz kategorię
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Zresetuj do pierwszej strony po zmianie filtrów
  };
  
  // Obsługa zmiany zakresu cen
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
      // Aktualizuj tylko jeśli wartość jest liczbą
      if (!isNaN(Number(value))) {
        setPriceRange([Number(value), priceRange[1]]);
      }
    } else {
      setMaxPrice(value);
      // Aktualizuj tylko jeśli wartość jest liczbą
      if (!isNaN(Number(value))) {
        setPriceRange([priceRange[0], Number(value)]);
      }
    }
    setCurrentPage(1); // Zresetuj do pierwszej strony po zmianie filtrów
  };
  
  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
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
    handlePageChange,
    getCurrentPageConsultations
  };
}
