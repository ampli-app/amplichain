
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  TruckIcon, 
  ArrowLeft,
  Heart,
  Share,
  Bookmark,
  PlayCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// This would typically be fetched from an API with the product ID
interface ProductDetailProps {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    image: string;
    rating: number;
  };
  features: string[];
  specifications: Record<string, string>;
  forTesting?: boolean;
  testingPrice?: number;
  sale?: boolean;
  salePercentage?: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'test'>('buy');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetailProps | null>(null);

  // Simulating product fetch
  useEffect(() => {
    // In a real app, this would fetch product data from an API
    setTimeout(() => {
      setProduct({
        id: 1,
        title: "Neumann U87 Condenser Microphone",
        description: "The Neumann U87 is a professional studio microphone known for its warm, balanced sound. This legendary microphone has been the standard in studios for decades, capturing vocals and instruments with exceptional clarity and detail. The U87 features three polar patterns: cardioid, omnidirectional, and figure-8, making it versatile for various recording scenarios.",
        price: 2999.99,
        images: [
          "https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1665618553583-d556cad726bd?q=80&w=2000&auto=format&fit=crop",
        ],
        category: "Microphones",
        rating: 5.0,
        reviewCount: 124,
        seller: {
          name: "Pro Audio Store",
          image: "/placeholder.svg",
          rating: 4.9
        },
        features: [
          "Three polar patterns: cardioid, omnidirectional, and figure-8",
          "Pressure gradient transducer with large diaphragm capsule",
          "Includes shock mount and wooden box",
          "Frequency response: 20 Hz to 20 kHz",
          "Exceptional transient response"
        ],
        specifications: {
          "Type": "Condenser Microphone",
          "Polar Pattern": "Cardioid, Omnidirectional, Figure-8",
          "Frequency Response": "20 Hz to 20 kHz",
          "Impedance": "200 Ohms",
          "Sensitivity": "28 mV/Pa",
          "Max SPL": "117 dB",
          "Dimensions": "56 x 200 mm",
          "Weight": "500g"
        },
        forTesting: true,
        testingPrice: 149.99,
        sale: false
      });
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleAddToCart = () => {
    toast({
      title: purchaseType === 'buy' ? "Added to cart" : "Test rental added to cart",
      description: `${product?.title} has been ${purchaseType === 'buy' ? 'added to your cart' : 'scheduled for a 1-week test rental'}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Loading product information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(purchaseType === 'buy' ? product.price : (product.testingPrice || 0));
  
  const originalPrice = product.sale && product.salePercentage 
    ? product.price / (1 - product.salePercentage / 100)
    : undefined;
    
  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(originalPrice)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link 
              to="/marketplace" 
              className="inline-flex items-center gap-2 text-rhythm-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Product Images */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="bg-rhythm-100/50 dark:bg-rhythm-800/20 rounded-lg border overflow-hidden aspect-[4/3]">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-4"
                />
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded border overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary' : ''}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 justify-center mt-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Heart className="h-4 w-4" />
                  Favorite
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <PlayCircle className="h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
            
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{product.category}</Badge>
                  {product.forTesting && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Calendar className="mr-1 h-3 w-3" />
                      Available for Testing
                    </Badge>
                  )}
                  {product.sale && product.salePercentage && (
                    <Badge className="bg-red-500">
                      {product.salePercentage}% OFF
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-rhythm-500">({product.reviewCount} reviews)</span>
                  </div>
                </div>
                
                <p className="text-rhythm-700 dark:text-rhythm-300 mb-6">
                  {product.description}
                </p>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={product.seller.image} 
                      alt={product.seller.name}
                      className="h-8 w-8 rounded-full border"
                    />
                    <div>
                      <p className="text-sm font-medium">Sold by: {product.seller.name}</p>
                      <div className="flex items-center gap-1 text-xs text-rhythm-500">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span>{product.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {product.forTesting && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">Purchase Options</h3>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                          onClick={() => setPurchaseType('buy')}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            purchaseType === 'buy' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <DollarSign className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">Buy Now</span>
                          <p className="text-xs mt-1">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(product.price)}
                          </p>
                        </button>
                        
                        <button
                          onClick={() => setPurchaseType('test')}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            purchaseType === 'test' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <Calendar className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">Test 1 Week</span>
                          <p className="text-xs mt-1">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(product.testingPrice || 0)}
                          </p>
                        </button>
                      </div>
                      
                      <p className="text-xs text-rhythm-500">
                        {purchaseType === 'test' ? 
                          "Try before you buy! Test for 1 week, then decide if you want to purchase." : 
                          "Buy new with full warranty and our 30-day satisfaction guarantee."
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{formattedPrice}</h3>
                      {formattedOriginalPrice && (
                        <p className="text-rhythm-500 line-through">{formattedOriginalPrice}</p>
                      )}
                      {purchaseType === 'test' && (
                        <p className="text-sm text-rhythm-600">for 1-week testing period</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>{purchaseType === 'buy' ? 'Secure Purchase' : 'Insured Testing'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full gap-2 py-6 text-base"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {purchaseType === 'buy' ? 'Add to Cart' : 'Add Testing Rental to Cart'}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-rhythm-600">
                    <TruckIcon className="h-4 w-4" />
                    <span>Free shipping • In stock • Ships in 1-2 business days</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <Tabs defaultValue="features" className="mb-16">
            <TabsList className="grid grid-cols-3 max-w-lg mx-auto">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="mt-6">
              <div className="max-w-3xl mx-auto glass-card rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">Product Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <div className="max-w-3xl mx-auto glass-card rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={index} className="flex">
                      <div className="w-1/3 font-medium text-rhythm-700">{key}</div>
                      <div className="w-2/3 text-rhythm-600">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="max-w-3xl mx-auto glass-card rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-rhythm-500">({product.reviewCount} reviews)</span>
                </div>
                
                <Separator className="my-4" />
                
                <p className="text-center text-rhythm-500 py-4">Review content would go here in a complete implementation.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Related Products</h2>
            <div className="text-center text-rhythm-500 py-8">
              <p>Related products would be displayed here in a complete implementation.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
