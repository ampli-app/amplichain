
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/group';

export interface GroupData {
  id: string;
  title: string;
  description: string;
  image: string;
  members: number;
  rating: number;
  features: string[];
  popular?: boolean;
  category: string;
  tags: string[];
}

export function useGroupsData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchGroups = async () => {
      setLoading(true);
      try {
        console.log('Fetching groups...');
        const { data: groupsData, error } = await supabase
          .from('groups')
          .select('*');
        
        if (error) {
          console.error('Błąd podczas pobierania grup:', error);
          setLoading(false);
          return;
        }
        
        console.log('Fetched groups:', groupsData);
        
        const groupsWithDetails = await Promise.all(
          groupsData.map(async (group) => {
            const { count, error: countError } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);
              
            if (countError) {
              console.error(`Błąd podczas pobierania liczby członków dla grupy ${group.id}:`, countError);
            }
            
            return {
              id: group.id,
              title: group.name,
              description: group.description || 'Brak opisu',
              image: group.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop',
              members: count || 0,
              rating: 4.7,
              features: [
                'Wsparcie społeczności',
                'Wymiana wiedzy',
                'Dyskusje tematyczne',
                'Wydarzenia i wyzwania'
              ],
              popular: count ? count > 3 : false,
              category: group.category || 'all',
              tags: [group.category || 'Muzyka'].concat(['Społeczność', 'Rozwój'])
            };
          })
        );
        
        setGroups(groupsWithDetails);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = searchQuery === '' || 
      group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredGroups,
    loading
  };
}
