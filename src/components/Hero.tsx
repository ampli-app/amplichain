
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.001)_100%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.001)_100%)] pointer-events-none"></div>
      
      {/* Animated dots pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,transparent_30%,black_70%)]">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-repeat bg-dot-pattern opacity-30 dark:opacity-20"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Połącz się ze społecznością <span className="text-primary">profesjonalistów muzycznych</span>!
            </h1>
            
            <p className="text-xl text-rhythm-600 dark:text-rhythm-400 mb-8 max-w-3xl mx-auto">
              Jedyna platforma dla profesjonalistów w branży muzycznej, która umożliwia nawiązywanie kontaktów, dzielenie się wiedzą i współpracę.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg" className="min-w-48 text-base">
                <Link to="/signup">
                  Rozpocznij za darmo
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-48 text-base group">
                <Link to="/mentorship">
                  Poznaj mentorów
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto shadow-2xl shadow-primary/10 rounded-xl overflow-hidden border border-rhythm-200/70 dark:border-rhythm-800/30">
              <img 
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop" 
                alt="Platforma muzyczna"
                className="w-full rounded-xl"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-xl"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Społeczność producentów</h3>
                    <p className="text-white/90">Współpraca i informacje zwrotne od profesjonalistów</p>
                  </div>
                  <Button className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                    Dołącz teraz
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm border border-white/10 whitespace-nowrap">
              Dołączyło już ponad 10,000+ profesjonalistów
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
