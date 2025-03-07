
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SocialUser } from '@/contexts/social/types';

interface ConnectionTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  allUsers: SocialUser[];
  connectedUsers: SocialUser[];
  pendingUsers: SocialUser[];
  followerUsers: SocialUser[];
  followingCount: number;
  children: React.ReactNode;
}

export function ConnectionTabs({
  activeTab,
  setActiveTab,
  allUsers,
  connectedUsers,
  pendingUsers,
  followerUsers,
  followingCount,
  children
}: ConnectionTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="all">
          Wszyscy
          <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
            {allUsers.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="connected">
          Połączeni
          <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
            {connectedUsers.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="pending">
          Oczekujące
          <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
            {pendingUsers.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="followers">
          Obserwujący
          <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
            {followerUsers.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="following">
          Obserwowani
          <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
            {followingCount || 0}
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="space-y-0 mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
}
