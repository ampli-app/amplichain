
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface MarketplaceItemProps {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  sale?: boolean;
  salePercentage?: number;
  forTesting?: boolean;
  testingPrice?: number;
  delay?: number;
}

export function MarketplaceItem({
  id,
  title,
  price,
  image,
  category,
  rating,
  reviewCount,
  sale = false,
  salePercentage,
  forTesting = false,
  testingPrice,
  delay = 0
}: MarketplaceItemProps) {
  const [purchaseType, setPurchaseType] = useState<'buy' | 'test'>(forTesting ? 'test' : 'buy');
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(purchaseType === 'buy' ? price : (testingPrice || 0));
  
  const originalPrice = sale && salePercentage 
    ? price / (1 - salePercentage / 100) 
    : undefined;
    
  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(originalPrice)
    : undefined;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-rhythm-100">
        {sale && (
          <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600">
            {salePercentage}% OFF
          </Badge>
        )}
        
        {forTesting && (
          <Badge className="absolute top-3 right-3 z-10 bg-primary/10 text-primary border-primary/20">
            <Calendar className="mr-1 h-3 w-3" />
            Available for Testing
          </Badge>
        )}
        
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {category}
          </Badge>
          
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="font-medium">{rating}</span>
            <span className="text-rhythm-500">({reviewCount})</span>
          </div>
        </div>
        
        <Link to={`/product/${id}`} className="block hover:text-primary transition-colors">
          <h3 className="font-medium mt-2 mb-1 line-clamp-1">{title}</h3>
        </Link>
        
        {forTesting ? (
          <Tabs 
            defaultValue={purchaseType} 
            onValueChange={(value) => setPurchaseType(value as 'buy' | 'test')}
            className="mb-3"
          >
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="test">Test for 1 Week</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(price)}</span>
                
                {sale && formattedOriginalPrice && (
                  <span className="text-rhythm-500 line-through text-sm">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="mt-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(testingPrice || 0)}</span>
                <span className="text-rhythm-500 text-sm">for 1 week</span>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-lg">{formattedPrice}</span>
            {sale && formattedOriginalPrice && (
              <span className="text-rhythm-500 line-through text-sm">
                {formattedOriginalPrice}
              </span>
            )}
          </div>
        )}
        
        <Button className="w-full gap-2" asChild>
          <Link to={`/product/${id}`}>
            <ShoppingCart className="h-4 w-4" /> 
            {purchaseType === 'buy' ? 'View Product' : 'Rent for Testing'}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
