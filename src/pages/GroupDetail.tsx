
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupPostCreate } from '@/components/groups/GroupPostCreate';
import { GroupTabs } from '@/components/groups/GroupTabs';
import { Group } from '@/types/group';
import { Loader2 } from 'lucide-react';

// Mock data for demo purposes - would be replaced with real data from API
const mockGroup: Group = {
  id: '1',
  name: 'Koło producentów muzycznych',
  description: 'Ucz się od najlepszych producentów i otrzymuj feedback do swojej twórczości.',
  coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop',
  profileImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop',
  memberCount: 1250,
  category: 'Produkcja',
  isPrivate: false,
  isMember: true,
  isAdmin: false,
  createdAt: '2023-01-15',
  posts: [
    {
      id: '1',
      content: 'Cześć wszystkim! Podzielcie się swoimi ostatnimi produkcjami w komentarzach. Chętnie posłucham i dam feedback! #produkcja #feedback',
      author: {
        id: '101',
        name: 'Marcin Kowalski',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      createdAt: '2023-06-01T10:30:00',
      timeAgo: '2 godz. temu',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
          type: 'image'
        }
      ],
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      content: 'Jakie są wasze ulubione pluginy do masteringu? Zbieram opinię do artykułu, który przygotowuję.',
      author: {
        id: '102',
        name: 'Anna Nowak',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      createdAt: '2023-06-01T08:15:00',
      timeAgo: '4 godz. temu',
      isPoll: true,
      pollOptions: [
        { id: 'p1', text: 'FabFilter Pro-L 2', votes: 42 },
        { id: 'p2', text: 'Ozone 10', votes: 38 },
        { id: 'p3', text: 'Waves L2', votes: 27 },
        { id: 'p4', text: 'Inne (napisz w komentarzu)', votes: 15 }
      ],
      likes: 18,
      comments: 12
    }
  ],
  members: [
    { id: '101', name: 'Marcin Kowalski', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'admin', joinedAt: '2023-01-15' },
    { id: '102', name: 'Anna Nowak', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'moderator', joinedAt: '2023-01-20' },
    { id: '103', name: 'Piotr Wiśniewski', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', role: 'member', joinedAt: '2023-02-05' },
    { id: '104', name: 'Katarzyna Jankowska', avatar: 'https://randomuser.me/api/portraits/women/67.jpg', role: 'member', joinedAt: '2023-02-12' },
    { id: '105', name: 'Tomasz Zieliński', avatar: 'https://randomuser.me/api/portraits/men/91.jpg', role: 'member', joinedAt: '2023-03-01' }
  ],
  media: [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04', type: 'image', postId: '1', createdAt: '2023-06-01T10:30:00' },
    { id: 'm2', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', type: 'image', postId: '3', createdAt: '2023-05-28T14:20:00' },
    { id: 'm3', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0', type: 'image', postId: '5', createdAt: '2023-05-25T09:10:00' }
  ],
  files: [
    { id: 'f1', name: 'Poradnik masteringu.pdf', url: '#', type: 'application/pdf', size: 2500000, postId: '10', createdAt: '2023-05-20T11:45:00' },
    { id: 'f2', name: 'Harmonogram spotkań.docx', url: '#', type: 'application/msword', size: 150000, postId: '12', createdAt: '2023-05-18T15:30:00' },
    { id: 'f3', name: 'Preset do EQ.zip', url: '#', type: 'application/zip', size: 5000000, postId: '15', createdAt: '2023-05-15T08:20:00' }
  ]
};

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, user } = useAuth();
  const { loading } = useSocial();
  const [group, setGroup] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate loading the group data - would be replaced with API call
    const fetchGroup = async () => {
      setLoadingGroup(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setGroup(mockGroup);
      } catch (error) {
        console.error('Error loading group:', error);
      } finally {
        setLoadingGroup(false);
      }
    };
    
    fetchGroup();
  }, [id]);

  if (loadingGroup) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-medium">Ładowanie grupy...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Grupa nie została znaleziona</h2>
            <p className="mb-6">Przepraszamy, ale grupa o podanym identyfikatorze nie istnieje lub została usunięta.</p>
            <Link 
              to="/groups" 
              className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Wróć do listy grup
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 pb-16">
        <GroupHeader group={group} />
        
        <div className="container px-4 mx-auto mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - visible only on large screens */}
            <div className="hidden lg:block">
              <div className="space-y-6 sticky top-24">
                <div className="bg-background rounded-xl border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-3">O grupie</h3>
                  <p className="text-rhythm-600 mb-4">{group.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-rhythm-500">Kategoria:</span>
                      <span className="font-medium">{group.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rhythm-500">Członkowie:</span>
                      <span className="font-medium">{group.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rhythm-500">Utworzono:</span>
                      <span className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rhythm-500">Typ grupy:</span>
                      <span className="font-medium">{group.isPrivate ? 'Prywatna' : 'Publiczna'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {group.isMember && (
                <GroupPostCreate group={group} />
              )}
              
              <GroupTabs group={group} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
