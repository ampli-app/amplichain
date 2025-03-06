
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
            
            // Transform the data to match the Group type
            return {
              id: group.id,
              name: group.name,
              description: group.description || 'Brak opisu',
              coverImage: group.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop',
              profileImage: group.profile_image,
              memberCount: count || 0,
              category: group.category || 'all',
              isPrivate: group.is_private || false,
              isMember: false, // Will be set correctly in GroupDetail
              isAdmin: false, // Will be set correctly in GroupDetail
              createdAt: group.created_at,
              posts: [],
              members: [],
              media: [],
              files: []
            } as Group;
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
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.category.toLowerCase().includes(searchQuery.toLowerCase());
    
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
