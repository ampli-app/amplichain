
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Feed', path: '/feed' },
    { name: 'Mentorship', path: '/mentorship' },
    { name: 'Marketplace', path: '/marketplace' },
  ];

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-navbar py-2' : 'py-4'
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
          onClick={() => setIsOpen(false)}
        >
          <Music className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold tracking-tight">Rhythm</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-rhythm-600 hover:text-primary transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-navbar border-t animate-fade-in">
          <div className="container px-4 mx-auto py-4 flex flex-col space-y-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-rhythm-600 hover:text-primary py-2 transition-colors text-lg font-medium"
                style={{ '--index': index } as React.CSSProperties}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <Link to="/login" className="w-full" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link to="/signup" className="w-full" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
