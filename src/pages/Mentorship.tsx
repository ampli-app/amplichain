
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MentorshipCard } from '@/components/MentorshipCard';
import { MentorCard } from '@/components/MentorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, Star, UserPlus, Calendar, ArrowRight, DollarSign } from 'lucide-react';

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

const individualMentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D",
    title: "Senior Producer",
    company: "Atlantis Records",
    experience: "10+ years of experience in music production",
    bio: "Hi there! 👋 I'm Sarah, a music producer with over a decade of experience working with Grammy-winning artists. I specialize in pop and R&B production, and I've helped countless artists develop their sound. My approach combines technical expertise with creative direction to help you achieve your unique sound. Whether you're a beginner looking to learn the basics or an experienced producer wanting to refine your skills, I'm here to help you reach your goals.",
    rating: 4.9,
    reviewCount: 48,
    skills: ["Music Production", "Sound Design", "Mixing", "Mastering", "Logic Pro", "Ableton Live"],
    price: 75,
    quickResponder: true,
    availableSpots: 2
  },
  {
    id: 2,
    name: "Marcus Rivera",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Artist Manager",
    company: "Elevation Management",
    experience: "8+ years of experience in artist management",
    bio: "I'm Marcus, an artist manager with experience guiding musicians from local venues to major festivals. I focus on building sustainable careers through strategic planning, branding, and industry connections. My mentees learn to navigate contracts, build teams, and make smart business decisions while staying true to their artistic vision.",
    rating: 4.7,
    reviewCount: 32,
    skills: ["Artist Management", "Career Strategy", "Branding", "Tour Planning", "Contract Negotiation"],
    price: 65
  },
  {
    id: 3,
    name: "Yvette Kondoh",
    image: "/lovable-uploads/9b8af26a-e395-4b2d-b30e-ff147a5f2eac.png",
    title: "Data Scientist",
    company: "Kraft Heinz",
    experience: "7+ years of experience in data and analytics",
    bio: "Hi there! 👋 I am Yvette, a data scientist with a background in Actuarial Science and Statistics currently working at Kraft Heinz. In my 7+ years of experience, I have partnered with different stakeholders to build data products and solutions that solve critical business problems across a number of industries.",
    rating: 5.0,
    reviewCount: 2,
    skills: ["Engineering & Data", "Data Science", "Data Visualization", "Python", "SQL", "Data Analytics", "Machine Learning"],
    price: 39,
    quickResponder: true,
    availableSpots: 4
  },
  {
    id: 4,
    name: "Daniel Lee",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
    title: "Music Marketing Specialist",
    company: "Pinnacle Digital",
    experience: "6+ years of experience in digital marketing",
    bio: "Hey! I'm Daniel, a music marketing specialist focused on helping independent artists reach new audiences. I've developed and executed marketing campaigns that have helped artists go from unknown to having millions of streams. I can teach you effective strategies for growing your fan base, optimizing your social media presence, and getting your music on key playlists.",
    rating: 4.8,
    reviewCount: 27,
    skills: ["Digital Marketing", "Social Media Strategy", "Playlist Pitching", "Content Creation", "Analytics"],
    price: 55
  },
  {
    id: 5,
    name: "Aisha Williams",
    image: "https://images.unsplash.com/photo-1589156288859-f0cb0d82b065?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjB3b21hbiUyMHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D",
    title: "A&R Director",
    company: "Horizon Records",
    experience: "12+ years of experience in A&R",
    bio: "I'm Aisha, an A&R Director with 12+ years of experience discovering and developing artists. I've signed multiple platinum-selling acts and helped shape their careers from the ground up. My mentoring focuses on helping artists understand what labels are looking for, how to present yourself professionally, and how to create music that resonates with both audiences and industry gatekeepers.",
    rating: 4.9,
    reviewCount: 41,
    skills: ["A&R Strategy", "Talent Scouting", "Artist Development", "Repertoire Selection", "Industry Networking"],
    price: 85,
    quickResponder: true
  },
  {
    id: 6,
    name: "James Taylor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    title: "Sound Engineer",
    company: "Crystal Sound Studios",
    experience: "15+ years of experience in sound engineering",
    bio: "I'm James, a veteran sound engineer with experience across studio recording, live sound, and post-production. I've worked on Grammy-winning albums and engineered sound for major tours and festivals. I specialize in teaching both the technical and artistic aspects of sound engineering, from microphone selection and placement to mixing techniques that bring out the best in every recording.",
    rating: 4.8,
    reviewCount: 56,
    skills: ["Recording Techniques", "Live Sound", "Pro Tools", "Acoustic Treatment", "Signal Processing", "Microphone Techniques"],
    price: 70,
    availableSpots: 3
  }
];

export default function Mentorship() {
  const [activeTab, setActiveTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredCommunities = mentorshipCommunities.filter(community => 
    community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredMentors = individualMentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Mentorship</h1>
              <p className="text-lg text-rhythm-600 max-w-2xl mx-auto">
                Connect with industry experts to accelerate your growth,
                expand your network, and take your career to the next level.
              </p>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mb-8"
            >
              <div className="flex items-center justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="groups" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Mentorship Groups
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    1-on-1 Mentoring
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mt-6 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    placeholder={`Search ${activeTab === 'groups' ? 'communities' : 'mentors'}...`} 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Options
                </Button>
              </div>
              
              <TabsContent value="groups">
                {searchQuery && filteredCommunities.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-rhythm-500">No communities found matching "{searchQuery}"</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredCommunities.map((community, index) => (
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
                )}
                
                <div className="flex justify-center mt-10">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("individual")}
                    className="gap-2"
                  >
                    Looking for 1-on-1 mentoring instead?
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="individual">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {searchQuery ? `${filteredMentors.length} mentors found` : '838 mentors available'}
                  </h2>
                  
                  <Button variant="outline" className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                    <Star className="h-4 w-4" />
                    Browse all mentors
                  </Button>
                </div>
                
                {searchQuery && filteredMentors.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-rhythm-500">No mentors found matching "{searchQuery}"</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMentors.map((mentor, index) => (
                      <MentorCard
                        key={mentor.id}
                        id={mentor.id}
                        name={mentor.name}
                        image={mentor.image}
                        title={mentor.title}
                        company={mentor.company}
                        experience={mentor.experience}
                        bio={mentor.bio}
                        rating={mentor.rating}
                        reviewCount={mentor.reviewCount}
                        skills={mentor.skills}
                        price={mentor.price}
                        quickResponder={mentor.quickResponder}
                        availableSpots={mentor.availableSpots}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex justify-center mt-10">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("groups")}
                    className="gap-2"
                  >
                    Looking for group mentoring instead?
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-16 p-6 border rounded-xl bg-rhythm-50/50 dark:bg-rhythm-900/50">
                  <h3 className="text-xl font-semibold mb-4">Become a Mentor</h3>
                  <p className="text-rhythm-600 mb-4">
                    Are you an industry professional? Share your expertise and earn by mentoring others.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Set your own rates</p>
                        <p className="text-sm text-rhythm-500">You decide how much to charge</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Flexible scheduling</p>
                        <p className="text-sm text-rhythm-500">Mentor when it works for you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Grow your network</p>
                        <p className="text-sm text-rhythm-500">Connect with aspiring professionals</p>
                      </div>
                    </div>
                  </div>
                  <Button>Apply to become a mentor</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
