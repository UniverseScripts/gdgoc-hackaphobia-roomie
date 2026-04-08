'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/services/authService';
import { getOnboardingStatus } from '@/services/onBoardingService'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/Logo';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // 1. Perform Login
      await loginUser(formData);

      // 2. Check Onboarding Status
      const status = await getOnboardingStatus();

      // 3. Smart Redirection Logic
      if (!status.profile_completed) {
        // Case 1: New Account -> Needs Profile
        router.push('/onboarding/profile');
      } else if (!status.test_completed) {
        // Case 1.5: Profile Done -> Needs Personality Test
        router.push('/test');
      } else {
        // Case 2: Everything Done -> Go to App
        router.push('/explore'); 
      }

    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
      <div className="mb-8"><Logo /></div>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Username</label>
              <Input name="username" required placeholder="Enter your username" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <Input name="password" type="password" required placeholder="••••••••" />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {loading ? 'Checking account...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}