
import { useState, useEffect, useCallback } from 'react';

interface ConsultationsFiltersProps {
  consultations: any[];
}

export function useConsultationsFilters({ consultations }: ConsultationsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('1000');
  const [filteredConsultations, setFilteredConsultations] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Filter consultations whenever the filter criteria change
  useEffect(() => {
    let filtered = [...consultations];
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(consultation => 
        consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (consultation.description && consultation.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(consultation => 
        consultation.categories && consultation.categories.includes(selectedCategory)
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(consultation => 
      consultation.price >= priceRange[0] && consultation.price <= priceRange[1]
    );
    
    setFilteredConsultations(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [consultations, searchQuery, selectedCategory, priceRange]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  
  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  // Handle price input change
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = Number(value);
    
    if (type === 'min') {
      if (value === '' || isNaN(numValue)) {
        setMinPrice('');
      } else {
        setMinPrice(value);
        setPriceRange([numValue, priceRange[1]]);
      }
    } else {
      if (value === '' || isNaN(numValue)) {
        setMaxPrice('');
      } else {
        setMaxPrice(value);
        setPriceRange([priceRange[0], numValue]);
      }
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get consultations for current page
  const getCurrentPageConsultations = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredConsultations.slice(startIndex, startIndex + itemsPerPage);
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
