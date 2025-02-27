
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // This is where you would integrate with your authentication system
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Your account has been created!",
      });
      
      navigate('/feed');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    
    // This is where you would integrate with Google Authentication
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "You've successfully signed up with Google!",
      });
      
      navigate('/feed');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-rhythm-50 dark:bg-rhythm-950/50">
      <header className="py-6">
        <div className="container px-4 mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold tracking-tight">Rhythm</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex justify-center items-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-8 py-10 bg-white dark:bg-rhythm-900 rounded-xl shadow-sm border"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-rhythm-600 dark:text-rhythm-400">Join the music industry network</p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mb-6 h-11 gap-2"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 186.69 190.5">
              <g transform="translate(1184.583 765.171)">
                <path d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" fill="#4285f4"/>
                <path d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z" fill="#34a853"/>
                <path d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z" fill="#fbbc05"/>
                <path d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z" fill="#ea4335"/>
              </g>
            </svg>
            Sign up with Google
          </Button>
          
          <div className="relative mb-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white dark:bg-rhythm-900 px-2 text-sm text-rhythm-500">or continue with email</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    id="name"
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10" 
                    placeholder="John Doe" 
                    autoComplete="name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10" 
                    placeholder="name@example.com" 
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <p className="text-xs text-rhythm-500">Password must be at least 8 characters long</p>
              </div>
              
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
                {!isLoading && <UserPlus className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-rhythm-600 dark:text-rhythm-400">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
          
          <p className="mt-8 text-xs text-center text-rhythm-500">
            By creating an account, you agree to our
            <Link to="/terms" className="text-primary hover:underline mx-1">Terms of Service</Link>
            and
            <Link to="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
