
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { FeaturedSection } from '@/components/FeaturedSection';
import { FeedPreview } from '@/components/FeedPreview';
import { MentorshipCard } from '@/components/MentorshipCard';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Users, ShoppingBag } from 'lucide-react';

const mentorshipCommunities = [
  {
    title: "Producer's Circle",
    description: "Learn from top music producers and get feedback on your tracks.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    members: 1250,
    rating: 4.9,
    features: [
      "Weekly live sessions with industry pros",
      "Track feedback and reviews",
      "Exclusive production resources",
      "Private networking opportunities"
    ],
    popular: true
  },
  {
    title: "A&R Insights",
    description: "Discover what A&R executives are looking for in new artists.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop",
    members: 850,
    rating: 4.7,
    features: [
      "A&R mentorship opportunities",
      "Demo submission feedback",
      "Industry trends analysis",
      "Artist development resources"
    ]
  },
  {
    title: "Sound Engineering Lab",
    description: "Master the technical side of music with expert sound engineers.",
    image: "https://images.unsplash.com/photo-15884798396903-635d6810d699?q=80&w=2000&auto=format&fit=crop",
    members: 950,
    rating: 4.8,
    features: [
      "Studio equipment tutorials",
      "Mixing and mastering workshops",
      "Acoustics and studio design",
      "Technical problem-solving"
    ]
  }
];

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
  }
];

export default function Index() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Overview */}
      <section className="py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Industry Feed",
                description: "Stay connected with the latest updates, trends, and opportunities in the music industry.",
                link: "/feed"
              },
              {
                icon: Users,
                title: "Mentorship Communities",
                description: "Join exclusive communities led by industry experts to accelerate your growth and knowledge.",
                link: "/mentorship"
              },
              {
                icon: ShoppingBag,
                title: "Equipment Marketplace",
                description: "Discover, buy, and sell professional music equipment with our trusted marketplace.",
                link: "/marketplace"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-8 border flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-rhythm-600 mb-5">{feature.description}</p>
                <Link to={feature.link} className="mt-auto">
                  <Button variant="link" className="gap-1 group">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Feed Preview */}
      <FeaturedSection
        title="Stay Connected"
        description="Join the conversation with industry professionals, share insights, and discover new opportunities."
        variant="alternate"
        id="feed"
      >
        <FeedPreview />
      </FeaturedSection>
      
      {/* Mentorship */}
      <FeaturedSection
        title="Exclusive Mentorship Communities"
        description="Join closed communities led by industry experts to accelerate your growth and expand your network."
        id="mentorship"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {mentorshipCommunities.map((community, index) => (
            <MentorshipCard 
              key={community.title}
              title={community.title}
              description={community.description}
              image={community.image}
              members={community.members}
              rating={community.rating}
              features={community.features}
              popular={community.popular}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/mentorship">
            <Button size="lg" variant="outline" className="gap-2 group">
              View All Communities
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </FeaturedSection>
      
      {/* Marketplace */}
      <FeaturedSection
        title="Professional Equipment Marketplace"
        description="Discover high-quality music equipment from trusted sellers in our curated marketplace."
        variant="alternate"
        id="marketplace"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              delay={index * 0.1}
            />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/marketplace">
            <Button size="lg" variant="outline" className="gap-2 group">
              Browse Marketplace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </FeaturedSection>
      
      {/* CTA */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-0"></div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready to take your music industry presence to the next level?
              </h2>
              <p className="text-lg text-rhythm-600">
                Join thousands of music industry professionals who are already connecting, learning, and growing with Rhythm.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="min-w-[160px]">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="min-w-[160px]">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
