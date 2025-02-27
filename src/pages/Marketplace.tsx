
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const marketplaceItems = [
  {
    id: 1,
    title: "Neumann U87 Condenser Microphone",
    price: 2999.99,
    image: "https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2000&auto=format&fit=crop",
    category: "Microphones",
    rating: 5.0,
    reviewCount: 124
  },
  {
    id: 2,
    title: "Universal Audio Apollo Twin X Duo",
    price: 899.00,
    image: "https://images.unsplash.com/photo-1558612846-ec0107aaf552?q=80&w=2000&auto=format&fit=crop",
    category: "Audio Interfaces",
    rating: 4.8,
    reviewCount: 86,
    sale: true,
    salePercentage: 15
  },
  {
    id: 3,
    title: "Ableton Push 2 MIDI Controller",
    price: 799.00,
    image: "https://images.unsplash.com/photo-1553526665-10042bd50dd1?q=80&w=2000&auto=format&fit=crop",
    category: "Controllers",
    rating: 4.9,
    reviewCount: 102
  },
  {
    id: 4,
    title: "Yamaha HS8 Studio Monitors (Pair)",
    price: 699.99,
    image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?q=80&w=2000&auto=format&fit=crop",
    category: "Monitors",
    rating: 4.7,
    reviewCount: 93
  },
  {
    id: 5,
    title: "Shure SM7B Microphone",
    price: 399.00,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000&auto=format&fit=crop",
    category: "Microphones",
    rating: 4.9,
    reviewCount: 215,
    sale: true,
    salePercentage: 10
  },
  {
    id: 6,
    title: "Roland RD-88 Stage Piano",
    price: 1199.99,
    image: "https://images.unsplash.com/photo-1552056776-9b5657118ca4?q=80&w=2000&auto=format&fit=crop",
    category: "Keyboards",
    rating: 4.8,
    reviewCount: 67
  },
  {
    id: 7,
    title: "Focal Clear MG Professional Headphones",
    price: 1490.00,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2000&auto=format&fit=crop",
    category: "Headphones",
    rating: 4.7,
    reviewCount: 42
  },
  {
    id: 8,
    title: "Elektron Digitakt Drum Computer & Sampler",
    price: 799.00,
    image: "https://images.unsplash.com/photo-1598629715558-266900d30e65?q=80&w=2000&auto=format&fit=crop",
    category: "Drum Machines",
    rating: 4.9,
    reviewCount: 58
  }
];

const categories = [
  "All Categories",
  "Microphones",
  "Audio Interfaces",
  "Monitors",
  "Headphones",
  "Controllers",
  "Keyboards",
  "Drum Machines",
  "Software",
  "Accessories"
];

export default function Marketplace() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Equipment Marketplace</h1>
            <p className="text-lg text-rhythm-600 max-w-2xl mx-auto">
              Discover high-quality music equipment from trusted sellers in our curated marketplace.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="lg:w-64 space-y-6">
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={category} className="flex items-center">
                      <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                        <input 
                          type="radio" 
                          name="category" 
                          className="mr-2 accent-primary"
                          defaultChecked={index === 0}
                        />
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Price Range
                </h3>
                <div className="pt-2 pb-6 px-1">
                  <div className="h-1 bg-rhythm-200 rounded-full mb-2">
                    <div className="h-1 bg-primary rounded-full w-3/4"></div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-3 w-3 -mt-2 -ml-1.5 bg-primary rounded-full border-2 border-white"></div>
                      <div className="absolute left-3/4 top-0 h-3 w-3 -mt-2 -ml-1.5 bg-primary rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-rhythm-500">
                    <span>$0</span>
                    <span>$3,000+</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Min" className="text-sm" />
                  <Input placeholder="Max" className="text-sm" />
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3">Condition</h3>
                <div className="space-y-2">
                  {["New", "Like New", "Excellent", "Good", "Fair"].map((condition) => (
                    <div key={condition} className="flex items-center">
                      <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                        <input 
                          type="checkbox" 
                          className="mr-2 accent-primary"
                        />
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="w-full">Apply Filters</Button>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    placeholder="Search marketplace..." 
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-rhythm-500">Sort by:</span>
                  <select className="py-2 px-3 rounded-md border bg-background">
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Rating</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceItems.map((item, index) => (
                  <MarketplaceItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={item.image}
                    category={item.category}
                    rating={item.rating}
                    reviewCount={item.reviewCount}
                    sale={item.sale}
                    salePercentage={item.salePercentage}
                    delay={index * 0.05}
                  />
                ))}
              </div>
              
              <div className="flex justify-center mt-10">
                <div className="flex">
                  <Button variant="outline" size="sm" className="rounded-l-md rounded-r-none border-r-0">Previous</Button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <Button 
                      key={page} 
                      variant={page === 1 ? "default" : "outline"} 
                      size="sm" 
                      className={`rounded-none ${page > 1 && page < 5 ? 'border-r-0' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-r-md rounded-l-none">Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
