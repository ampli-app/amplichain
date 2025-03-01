
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FeedPreview } from '@/components/FeedPreview';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { CreatePostModal } from '@/components/CreatePostModal';

export default function Feed() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 w-full">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold">Industry Feed</h1>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setIsCreatePostModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Nowy Post
                </Button>
              </div>
            </div>
            
            <div className="w-full">
              <FeedPreview />
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline">Load More</Button>
            </div>
          </div>
        </div>
      </main>
      
      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
      
      <Footer />
    </div>
  );
}
