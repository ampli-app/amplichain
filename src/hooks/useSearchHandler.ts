
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSearchHandler() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Logika wyszukiwania - możemy po prostu przekierować do strony wyników wyszukiwania
    if (query.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return {
    searchQuery,
    handleSearch
  };
}
