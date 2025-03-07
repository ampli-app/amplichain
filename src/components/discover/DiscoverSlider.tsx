
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useDiscoverSliders, type DiscoverSlider as DiscoverSliderType } from '@/hooks/useDiscoverSliders';
import { motion, AnimatePresence } from 'framer-motion';

export function DiscoverSlider() {
  const navigate = useNavigate();
  const { sliders, loading, error } = useDiscoverSliders();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Ustaw domyślny slider, gdy dane są ładowane
  const defaultSlider: DiscoverSliderType = {
    id: 'default',
    title: 'Dołącz do społeczności producentów',
    description: 'Ponad 1000 profesjonalistów z branży muzycznej czeka na Ciebie. Wymieniaj się wiedzą, uzyskaj feedback i rozwiń swoje umiejętności.',
    button_text: 'Dołącz teraz',
    image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop',
    link: '/groups',
    active: true,
    sort_order: 0
  };

  const currentSlider = sliders.length > 0 ? sliders[currentIndex] : defaultSlider;

  const goToNext = () => {
    if (sliders.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }
  };

  const goToPrev = () => {
    if (sliders.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
    }
  };

  // Automatycznie przewijaj co 3 sekundy zamiast 5
  useEffect(() => {
    if (sliders.length <= 1) return;
    
    const interval = setInterval(goToNext, 6000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  if (error) {
    return (
      <div className="w-full h-64 rounded-xl overflow-hidden relative mb-8 bg-red-50 flex items-center justify-center">
        <p className="text-red-500">Błąd podczas ładowania: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative mb-8 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlider.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${currentSlider.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: currentSlider.background_position || 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlider.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-2">{currentSlider.title}</h2>
            <p className="text-white/80 mb-4 max-w-xl">{currentSlider.description}</p>
            <Button 
              onClick={() => navigate(currentSlider.link)}
              className="w-fit bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20"
            >
              {currentSlider.button_text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {sliders.length > 1 && (
        <>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-80 transition-opacity"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-80 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {sliders.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
