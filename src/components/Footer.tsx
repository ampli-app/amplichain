
import { Link } from 'react-router-dom';
import { Music, Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">SoundConnect</span>
            </Link>
            <p className="text-rhythm-600 mb-4 max-w-sm">
              Platforma dla profesjonalistów branży muzycznej do nawiązywania kontaktów, współpracy i rozwoju kariery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-rhythm-500 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-rhythm-500 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-rhythm-500 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-rhythm-500 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Produkty</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/feed" className="text-rhythm-600 hover:text-primary transition-colors">
                  Aktualności
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-rhythm-600 hover:text-primary transition-colors">
                  Produkty
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="text-rhythm-600 hover:text-primary transition-colors">
                  Mentorzy
                </Link>
              </li>
              <li>
                <Link to="/connections" className="text-rhythm-600 hover:text-primary transition-colors">
                  Kontakty
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Firma</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-rhythm-600 hover:text-primary transition-colors">
                  O nas
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-rhythm-600 hover:text-primary transition-colors">
                  Kariera
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-rhythm-600 hover:text-primary transition-colors">
                  Dla prasy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-rhythm-600 hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Wsparcie</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-rhythm-600 hover:text-primary transition-colors">
                  Centrum pomocy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-rhythm-600 hover:text-primary transition-colors">
                  Warunki korzystania
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-rhythm-600 hover:text-primary transition-colors">
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-rhythm-600 hover:text-primary transition-colors">
                  Polityka cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-rhythm-500">
            &copy; {currentYear} SoundConnect. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/terms" className="text-sm text-rhythm-500 hover:text-primary transition-colors">
              Warunki korzystania
            </Link>
            <Link to="/privacy" className="text-sm text-rhythm-500 hover:text-primary transition-colors">
              Polityka prywatności
            </Link>
            <Link to="/cookies" className="text-sm text-rhythm-500 hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
