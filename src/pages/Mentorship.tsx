
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MentorshipCard } from '@/components/MentorshipCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

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
    image: "https://images.unsplash.com/photo-1588479839125-731d7ae923f6?q=80&w=2000&auto=format&fit=crop",
    members: 950,
    rating: 4.8,
    features: [
      "Studio equipment tutorials",
      "Mixing and mastering workshops",
      "Acoustics and studio design",
      "Technical problem-solving"
    ]
  },
  {
    title: "Artist Management Circle",
    description: "Connect with artist managers and learn the business side of music.",
    image: "https://images.unsplash.com/photo-1560184611-ff3e53f00e8f?q=80&w=2000&auto=format&fit=crop",
    members: 620,
    rating: 4.6,
    features: [
      "Career development strategies",
      "Contract negotiation insights",
      "Tour planning and execution",
      "Brand building for artists"
    ]
  },
  {
    title: "Songwriters Guild",
    description: "Perfect your craft with feedback from established songwriters.",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2000&auto=format&fit=crop",
    members: 1100,
    rating: 4.9,
    features: [
      "Co-writing sessions",
      "Lyrics and melody workshops",
      "Publishing opportunities",
      "Songwriting challenges"
    ],
    popular: true
  },
  {
    title: "Music Marketing Pros",
    description: "Learn cutting-edge strategies to promote your music effectively.",
    image: "https://images.unsplash.com/photo-1661956600684-97d3a4320e45?q=80&w=2000&auto=format&fit=crop",
    members: 780,
    rating: 4.7,
    features: [
      "Social media optimization",
      "Playlist pitching strategies",
      "PR and press coverage",
      "Fan engagement tactics"
    ]
  }
];

export default function Mentorship() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Mentorship Communities</h1>
              <p className="text-lg text-rhythm-600 max-w-2xl mx-auto">
                Join exclusive communities led by industry experts to accelerate your growth,
                expand your network, and take your career to the next level.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                <Input 
                  placeholder="Search communities..." 
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter Options
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
