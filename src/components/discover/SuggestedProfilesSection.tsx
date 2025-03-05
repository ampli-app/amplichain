
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

export function SuggestedProfilesSection() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .limit(2);
          
        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        console.error('Błąd pobierania profili:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfiles();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Ładowanie proponowanych profili...</div>;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">Sugerowane profile</h3>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile.avatar_url || '/placeholder.svg'} alt={profile.full_name} />
              <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Śledź
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
