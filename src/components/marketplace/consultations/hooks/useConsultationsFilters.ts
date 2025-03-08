
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
  const handlePriceInputChange = useCallback((type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
      const min = parseFloat(value) || 0;
      setPriceRange([min, priceRange[1]]);
    } else {
      setMaxPrice(value);
      const max = parseFloat(value) || 1000;
      const limitedMax = Math.min(max, 999999);
      setPriceRange([priceRange[0], limitedMax]);
    }
  }, [priceRange, setPriceRange]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get consultations for current page
  const getCurrentPageConsultations = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredConsultations.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // Function for applying filters
  const handleApplyFilters = useCallback(() => {
    console.log("Applying filters");
  }, []);
  
  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    priceRange,
    setPriceRange,
    minPrice,
    maxPrice,
    filteredConsultations,
    currentPage,
    totalPages,
    handlePriceInputChange,
    handleCategorySelect,
    handlePageChange,
    getCurrentPageConsultations,
    handleApplyFilters
  };
}
