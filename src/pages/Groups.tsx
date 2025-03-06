import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Mic,
  Music,
  HeadphonesIcon,
  Guitar,
  Drum,
  Piano
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Group {
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

const groupCategories = [
  { id: "production", name: "Produkcja", icon: <Music className="h-4 w-4" /> },
  { id: "vocals", name: "Wokal", icon: <Mic className="h-4 w-4" /> },
  { id: "engineering", name: "Realizacja dźwięku", icon: <HeadphonesIcon className="h-4 w-4" /> },
  { id: "guitar", name: "Gitara", icon: <Guitar className="h-4 w-4" /> },
  { id: "piano", name: "Pianino", icon: <Piano className="h-4 w-4" /> },
  { id: "drums", name: "Perkusja", icon: <Drum className="h-4 w-4" /> },
  { id: "all", name: "Wszystkie", icon: <Users className="h-4 w-4" /> }
];

function GroupCard({ group, delay = 0 }: { group: Group, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl ${
        group.popular ? 'border-2 border-primary/50' : 'border border-rhythm-200'
      }`}
    >
      {group.popular && (
        <Badge className="absolute top-4 right-4 z-10 bg-primary">
          Popularne
        </Badge>
      )}
      
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={group.image} 
          alt={group.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-rhythm-500">
            <Users className="h-4 w-4" />
            <span>{group.members.toLocaleString()} członków</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{group.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{group.title}</h3>
        <p className="text-rhythm-600 mb-4">{group.description}</p>
        
        <div className="space-y-2 mb-6">
          {group.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Button className="w-full group" asChild>
          <Link to={`/groups/${group.id}`}>
            Dołącz do społeczności
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function Groups() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto mb-8">
              <h1 className="text-3xl font-bold mb-2">Grupy</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Dołącz do społeczności tematycznych i rozwijaj swoje pasje muzyczne.
              </p>
            </div>
            
            <div className="animate-pulse space-y-8">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded max-w-lg mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border rounded-xl overflow-hidden">
                    <div className="aspect-[16/9] bg-gray-300 dark:bg-gray-700"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="pt-2 space-y-2">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                        ))}
                      </div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold">Grupy</h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
                  Dołącz do społeczności tematycznych i rozwijaj swoje pasje muzyczne.
                </p>
              </div>
            </div>
            
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Szukaj grup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              
              <div className="flex overflow-x-auto py-2 gap-2 no-scrollbar">
                {groupCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="flex items-center gap-2 whitespace-nowrap"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {filteredGroups.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Brak pasujących grup</h3>
                <p className="text-gray-500 mb-6">Spróbuj zmienić kryteria wyszukiwania</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group, i) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    delay={i * 0.1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
