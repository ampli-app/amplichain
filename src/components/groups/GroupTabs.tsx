
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Group } from '@/types/group';
import { GroupPostsList } from './GroupPostsList';
import { GroupMembersList } from './GroupMembersList';
import { GroupMediaGrid } from './GroupMediaGrid';
import { GroupFilesList } from './GroupFilesList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GroupTabsProps {
  group: Group;
}

export function GroupTabs({ group }: GroupTabsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [membersCount, setMembersCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  
  useEffect(() => {
    const fetchCounts = async () => {
      // Pobierz liczbę członków
      const { count: membersCount, error: membersError } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', group.id);
      
      if (membersError) {
        console.error('Błąd podczas pobierania liczby członków:', membersError);
      } else if (membersCount !== null) {
        setMembersCount(membersCount);
      }
      
      // Pobierz liczbę mediów
      const { count: mediaCount, error: mediaError } = await supabase
        .from('group_post_media')
        .select('id', { count: 'exact', head: true })
        .in('post_id', function(builder) {
          builder.select('id').from('group_posts').eq('group_id', group.id);
        });
      
      if (mediaError) {
        console.error('Błąd podczas pobierania liczby mediów:', mediaError);
      } else if (mediaCount !== null) {
        setMediaCount(mediaCount);
      }
      
      // Pobierz liczbę plików
      const { count: filesCount, error: filesError } = await supabase
        .from('group_post_files')
        .select('id', { count: 'exact', head: true })
        .in('post_id', function(builder) {
          builder.select('id').from('group_posts').eq('group_id', group.id);
        });
      
      if (filesError) {
        console.error('Błąd podczas pobierania liczby plików:', filesError);
      } else if (filesCount !== null) {
        setFilesCount(filesCount);
      }
    };
    
    fetchCounts();
  }, [group.id]);

  return (
    <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
      <div className="sticky top-0 bg-background z-10 border-b pb-4 mb-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj w grupie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Posty</TabsTrigger>
          <TabsTrigger value="members" className="flex-1" id="members-tab">
            Członkowie {membersCount > 0 && <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{membersCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1">
            Media {mediaCount > 0 && <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{mediaCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-1">
            Pliki {filesCount > 0 && <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{filesCount}</span>}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="posts" className="focus-visible:outline-none focus-visible:ring-0">
        <GroupPostsList posts={[]} searchQuery={searchQuery} groupId={group.id} />
      </TabsContent>
      
      <TabsContent value="members" className="focus-visible:outline-none focus-visible:ring-0">
        <GroupMembersList groupId={group.id} searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="media" className="focus-visible:outline-none focus-visible:ring-0">
        <GroupMediaGrid groupId={group.id} searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="files" className="focus-visible:outline-none focus-visible:ring-0">
        <GroupFilesList groupId={group.id} searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  );
}
