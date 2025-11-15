import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex flex-col items-center justify-between p-6 pb-12">
      <div className="flex items-center gap-2 mt-12">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <div className="w-10 h-10 bg-primary/20 rounded-lg" />
        </div>
        <span className="text-3xl font-bold">monex</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full px-4">
        <div className="w-72 h-72 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center mb-8 shadow-xl">
          <div className="text-8xl">💰</div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome to Monex
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Your personal finance companion for tracking expenses and achieving your financial goals
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        <Button 
          onClick={() => navigate('/auth')} 
          className="w-full h-14 text-base font-semibold"
        >
          GET STARTED
        </Button>
        <Button 
          onClick={() => navigate('/onboarding')} 
          variant="outline"
          className="w-full h-14 text-base font-semibold"
        >
          LEARN MORE
        </Button>
      </div>
    </div>
  );
}
