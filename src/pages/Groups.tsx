
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GroupSearch } from '@/components/groups/GroupSearch';
import { GroupCategoryFilter } from '@/components/groups/GroupCategoryFilter';
import { GroupsGrid } from '@/components/groups/GroupsGrid';
import { GroupLoadingSkeleton } from '@/components/groups/GroupLoadingSkeleton';
import { useGroupsData } from '@/hooks/useGroupsData';

export default function Groups() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredGroups,
    loading
  } = useGroupsData();

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
              <GroupSearch 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
              
              <GroupCategoryFilter 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
              />
            </div>
            
            {loading ? (
              <GroupLoadingSkeleton />
            ) : (
              <GroupsGrid groups={filteredGroups} />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
