
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, MapPinOff, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="container px-4 mx-auto">
          <div className="max-w-lg mx-auto text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <MapPin className="absolute h-32 w-32 text-primary/20" />
              <MapPinOff className="absolute h-32 w-32 text-primary/90 animate-pulse" />
            </div>
            
            <h1 className="text-7xl font-bold text-primary mb-6">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Chyba zgubiliśmy się w trasie...
            </h2>
            <p className="text-rhythm-600 mb-8">
              Strona, której szukasz, nie istnieje lub została przeniesiona. 
              Sprawdź adres URL lub wróć do strony głównej.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="min-w-40 gap-2">
                <Link to="/">
                  <Compass className="h-4 w-4" />
                  Powrót do strony głównej
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
