
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
    title: "Krąg Producentów",
    description: "Ucz się od najlepszych producentów muzycznych i otrzymuj opinie na temat swoich utworów.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    members: 1250,
    rating: 4.9,
    features: [
      "Cotygodniowe sesje na żywo z profesjonalistami",
      "Ocena i recenzje utworów",
      "Ekskluzywne zasoby produkcyjne",
      "Prywatne możliwości networkingu"
    ],
    popular: true
  },
  {
    title: "Spostrzeżenia A&R",
    description: "Dowiedz się, czego szukają dyrektorzy A&R u nowych artystów.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop",
    members: 850,
    rating: 4.7,
    features: [
      "Możliwości mentoringu A&R",
      "Informacje zwrotne dotyczące demo",
      "Analiza trendów branżowych",
      "Zasoby do rozwoju artystycznego"
    ]
  },
  {
    title: "Laboratorium Inżynierii Dźwięku",
    description: "Opanuj techniczną stronę muzyki z ekspertami inżynierii dźwięku.",
    image: "https://images.unsplash.com/photo-1588479839125-731d7ae923f6?q=80&w=2000&auto=format&fit=crop",
    members: 950,
    rating: 4.8,
    features: [
      "Tutoriale sprzętu studyjnego",
      "Warsztaty miksowania i masteringu",
      "Akustyka i projektowanie studia",
      "Rozwiązywanie problemów technicznych"
    ]
  }
];

const marketplaceItems = [
  {
    id: 1,
    title: "Neumann U87 Mikrofon Pojemnościowy",
    price: 2999.99,
    image: "https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2000&auto=format&fit=crop",
    category: "Mikrofony",
    rating: 5.0,
    reviewCount: 124
  },
  {
    id: 2,
    title: "Universal Audio Apollo Twin X Duo",
    price: 899.00,
    image: "https://images.unsplash.com/photo-1558612846-ec0107aaf552?q=80&w=2000&auto=format&fit=crop",
    category: "Interfejsy Audio",
    rating: 4.8,
    reviewCount: 86,
    sale: true,
    salePercentage: 15
  },
  {
    id: 3,
    title: "Ableton Push 2 Kontroler MIDI",
    price: 799.00,
    image: "https://images.unsplash.com/photo-1553526665-10042bd50dd1?q=80&w=2000&auto=format&fit=crop",
    category: "Kontrolery",
    rating: 4.9,
    reviewCount: 102
  },
  {
    id: 4,
    title: "Yamaha HS8 Monitory Studyjne (Para)",
    price: 699.99,
    image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?q=80&w=2000&auto=format&fit=crop",
    category: "Monitory",
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
                title: "Aktualności Branżowe",
                description: "Bądź na bieżąco z najnowszymi aktualizacjami, trendami i możliwościami w branży muzycznej.",
                link: "/feed"
              },
              {
                icon: Users,
                title: "Społeczności Mentoringowe",
                description: "Dołącz do ekskluzywnych społeczności prowadzonych przez ekspertów branżowych, aby przyspieszyć swój rozwój i wiedzę.",
                link: "/mentorship"
              },
              {
                icon: ShoppingBag,
                title: "Rynek Sprzętu",
                description: "Odkrywaj, kupuj i sprzedawaj profesjonalny sprzęt muzyczny na naszym zaufanym rynku.",
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
                    Dowiedz się więcej
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
        title="Pozostań w Kontakcie"
        description="Dołącz do rozmowy z profesjonalistami branżowymi, dziel się spostrzeżeniami i odkrywaj nowe możliwości."
        variant="alternate"
        id="feed"
      >
        <FeedPreview />
      </FeaturedSection>
      
      {/* Mentorship */}
      <FeaturedSection
        title="Ekskluzywne Społeczności Mentoringowe"
        description="Dołącz do zamkniętych społeczności prowadzonych przez ekspertów branżowych, aby przyspieszyć swój rozwój i poszerzyć swoją sieć kontaktów."
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
              Zobacz Wszystkie Społeczności
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </FeaturedSection>
      
      {/* Marketplace */}
      <FeaturedSection
        title="Profesjonalny Rynek Sprzętu"
        description="Odkryj wysokiej jakości sprzęt muzyczny od zaufanych sprzedawców w naszym wyselekcjonowanym sklepie."
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
              Przeglądaj Sklep
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
                Gotowy, aby przenieść swoją obecność w branży muzycznej na wyższy poziom?
              </h2>
              <p className="text-lg text-rhythm-600">
                Dołącz do tysięcy profesjonalistów z branży muzycznej, którzy już nawiązują kontakty, uczą się i rozwijają z Amplichain.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="min-w-[160px]">
                  Rozpocznij
                </Button>
                <Button size="lg" variant="outline" className="min-w-[160px]">
                  Dowiedz się więcej
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
