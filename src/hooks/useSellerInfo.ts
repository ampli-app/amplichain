
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSellerInfo = () => {
  const [sellerInfo, setSellerInfo] = useState({
    name: "Sprzedawca",
    email: "kontakt@example.com",
    phone: "123-456-789",
    location: ""
  });
  
  const fetchSellerInfo = async (userId: string, productLocation: string | undefined) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching seller info:', error);
        return;
      }
      
      if (data) {
        setSellerInfo(prev => ({
          ...prev,
          name: data.full_name || "Sprzedawca",
          location: productLocation || ""
        }));
      }
    } catch (err) {
      console.error('Unexpected error fetching seller info:', err);
    }
  };
  
  return {
    sellerInfo,
    fetchSellerInfo
  };
};
