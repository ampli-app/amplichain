
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface ProfileLoadingStateProps {
  isLoading: boolean;
}

export function ProfileLoadingState({ isLoading }: ProfileLoadingStateProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Ładowanie profilu...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Musisz się zalogować</h2>
          <p className="mb-6">Aby zobaczyć profil, musisz się najpierw zalogować.</p>
          <Button onClick={() => navigate('/login')} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
            Zaloguj się
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
