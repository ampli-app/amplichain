import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/group';

export function useGroupsData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchGroups = async () => {
      setLoading(true);
      try {
        console.log('Pobieranie grup...');
        
        // Pobierz dane grup
        const { data: groupsData, error } = await supabase
          .from('groups')
          .select('*');
        
        if (error) {
          console.error('Błąd podczas pobierania grup:', error);
          setLoading(false);
          return;
        }
        
        console.log('Pobrane grupy:', groupsData);
        
        if (!groupsData || groupsData.length === 0) {
          setGroups([]);
          setLoading(false);
          return;
        }
        
        // Transformuj dane na format Group
        const transformedGroups: Group[] = await Promise.all(
          groupsData.map(async (group) => {
            let memberCount = 0;
            
            try {
              // Pobierz liczbę członków dla każdej grupy za pomocą osobnego zapytania
              const { count, error: countError } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', group.id);
                
              if (countError) {
                console.error(`Błąd podczas pobierania liczby członków dla grupy ${group.id}:`, countError);
              } else {
                memberCount = count || 0;
              }
            } catch (error) {
              console.error(`Błąd podczas pobierania liczby członków dla grupy ${group.id}:`, error);
            }
            
            return {
              id: group.id,
              name: group.name,
              description: group.description || 'Brak opisu',
              coverImage: group.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop',
              profileImage: group.profile_image,
              memberCount: memberCount,
              category: group.category || 'all',
              isPrivate: group.is_private || false,
              isMember: false, // Zostanie ustawione w szczegółach grupy
              isAdmin: false, // Zostanie ustawione w szczegółach grupy
              createdAt: group.created_at,
              posts: [],
              members: [],
              media: [],
              files: []
            } as Group;
          })
        );
        
        setGroups(transformedGroups);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredGroups: groups.filter(group => {
      const matchesSearch = searchQuery === '' || 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }),
    loading
  };
}
