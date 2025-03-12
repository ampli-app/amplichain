
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StolenEquipmentItem {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  image_url: string;
  status: 'verified' | 'unverified' | 'recovered';
  category_id: string;
  category_name?: string;
  user_id?: string;
  serial_number?: string;
  contact_info?: string;
}

export const useStolenEquipment = (
  categoryId: string | null = null,
  searchQuery: string = '',
  limit: number = 100
) => {
  return useQuery({
    queryKey: ['stolenEquipment', categoryId, searchQuery, limit],
    queryFn: async () => {
      let query = supabase
        .from('stolen_equipment')
        .select(`
          *,
          categories:category_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Błąd podczas pobierania danych:', error);
        throw new Error(error.message);
      }

      // Przekształć dane, aby były zgodne z oczekiwanym interfejsem
      const formattedData = data.map(item => ({
        id: item.id,
        title: item.title,
        location: item.location,
        date: item.date,
        description: item.description,
        image_url: item.image_url,
        status: item.status,
        category_id: item.category_id,
        category_name: item.categories?.name,
        user_id: item.user_id,
        serial_number: item.serial_number,
        contact_info: item.contact_info
      }));

      return formattedData as StolenEquipmentItem[];
    }
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Błąd podczas pobierania kategorii:', error);
        throw new Error(error.message);
      }

      return data;
    }
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Błąd podczas pobierania lokalizacji:', error);
        throw new Error(error.message);
      }

      return data;
    }
  });
};
