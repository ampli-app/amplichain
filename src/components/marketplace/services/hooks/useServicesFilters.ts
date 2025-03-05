
import { useState, useEffect } from 'react';
import { Service } from '@/types/messages';

export function useServicesFilters(services: Service[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('5000');
  
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, selectedCategory, selectedLocation, priceRange]);

  const applyFilters = () => {
    let filtered = [...services];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query)) ||
        (service.category && service.category.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category && service.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (selectedLocation) {
      filtered = filtered.filter(service => 
        service.location && service.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    
    filtered = filtered.filter(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );
    
    setFilteredServices(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    
    if (currentPage > Math.ceil(filtered.length / PAGE_SIZE)) {
      setCurrentPage(1);
    }
  };

  const handlePriceInputChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 5000;
    
    const limitedMax = Math.min(max, 999999);
    
    setPriceRange([min, limitedMax]);
    if (limitedMax !== max) {
      setMaxPrice(limitedMax.toString());
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? '' : categoryId);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getCurrentPageServices = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredServices.slice(startIndex, endIndex);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedLocation,
    setSelectedLocation,
    priceRange,
    setPriceRange,
    minPrice,
    setMinPrice,
    maxPrice, 
    setMaxPrice,
    filteredServices,
    currentPage,
    totalPages,
    handlePriceInputChange,
    handleCategorySelect,
    handlePageChange,
    getCurrentPageServices
  };
}
