
import { useState } from 'react';
import { Group } from '@/types/group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, ImageIcon, FileText, Users } from 'lucide-react';
import { GroupPostsList } from './GroupPostsList';
import { GroupMediaGrid } from './GroupMediaGrid';
import { GroupFilesList } from './GroupFilesList';
import { GroupMembersList } from './GroupMembersList';

interface GroupTabsProps {
  group: Group;
}

export function GroupTabs({ group }: GroupTabsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Tabs defaultValue="posts" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList>
          <TabsTrigger value="posts" id="posts-tab">Posty</TabsTrigger>
          <TabsTrigger value="media" id="media-tab">Media</TabsTrigger>
          <TabsTrigger value="files" id="files-tab">Pliki</TabsTrigger>
          <TabsTrigger value="members" id="members-tab">Członkowie</TabsTrigger>
        </TabsList>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj w grupie..."
            className="pl-9 h-9 w-full sm:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <TabsContent value="posts" className="space-y-6">
        <GroupPostsList posts={group.posts} searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="media">
        <GroupMediaGrid media={group.media} searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="files">
        <GroupFilesList files={group.files} searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="members">
        <GroupMembersList members={group.members} searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  );
}
