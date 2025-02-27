
import { useState } from 'react';
import { Star, Phone, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface MentorCardProps {
  id: number;
  name: string;
  image: string;
  title: string;
  company: string;
  experience: string;
  bio: string;
  rating: number;
  reviewCount: number;
  skills: string[];
  price: number;
  currency?: string;
  quickResponder?: boolean;
  availableSpots?: number;
  delay?: number;
}

export function MentorCard({
  id,
  name,
  image,
  title,
  company,
  experience,
  bio,
  rating,
  reviewCount,
  skills,
  price,
  currency = 'zł',
  quickResponder = false,
  availableSpots,
  delay = 0
}: MentorCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden border rounded-xl">
        {availableSpots && availableSpots < 5 && (
          <Badge variant="outline" className="absolute top-4 right-4 bg-white dark:bg-rhythm-800 z-10">
            Tylko {availableSpots} {availableSpots === 1 ? 'miejsce' : availableSpots < 5 ? 'miejsca' : 'miejsc'} zostało
          </Badge>
        )}
        
        <CardContent className="p-0">
          <div className="p-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-md">
                <img 
                  src={image} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {currency}{price}
                </div>
                <Button 
                  className="w-full mt-2 gap-2"
                  size="sm"
                >
                  Skontaktuj się
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">{name}</h3>
                  <p className="text-rhythm-600">{title} w {company}</p>
                  <p className="text-primary font-medium">{experience}</p>
                </div>
                
                {quickResponder && (
                  <Badge variant="secondary" className="self-start md:self-center bg-primary/10 text-primary">
                    <Star className="mr-1 h-3 w-3 fill-primary text-primary" /> Szybko Odpowiada
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-rhythm-300'}`} 
                  />
                ))}
                <span className="ml-1 font-medium">{rating.toFixed(1)}</span>
                <span className="text-rhythm-500">({reviewCount} opinii)</span>
              </div>
              
              <p className={`text-rhythm-600 ${expanded ? '' : 'line-clamp-3'}`}>
                {bio}
              </p>
              
              {bio.length > 200 && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-primary text-sm font-medium mt-1 hover:underline"
                >
                  {expanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                </button>
              )}
              
              <div className="mt-4">
                <Tabs defaultValue="benefits">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="benefits">Czego się spodziewać</TabsTrigger>
                    <TabsTrigger value="skills">Umiejętności</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="benefits" className="mt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">15-minutowa rozmowa wprowadzająca</p>
                        <p className="text-sm text-rhythm-500">Rozmowa z {name.split(' ')[0]}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Harmonogram bez ryzyka</p>
                        <p className="text-sm text-rhythm-500">Możliwość anulowania sesji w dowolnym momencie</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="skills" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-rhythm-100/50 dark:bg-rhythm-800/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
