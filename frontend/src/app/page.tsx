import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { getOnboardingStatus } from '@/services/onBoardingService';
import { ArrowRight, Shield, Users, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="mr-1 h-3 w-3" />
            New: AI Matching Algorithm
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            Find your perfect <br/>
            <span className="text-primary">roommate</span> today.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FitNest connects you with compatible roommates based on lifestyle, habits, and personality. No more awkward living situations.
          </p>

          <div className="flex justify-center gap-4 pt-4">
             <Link href="/signup">
               <Button className="h-12 px-8 text-lg rounded-full">
                 Start Matching <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
             <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Shield className="h-6 w-6"/></div>
                <span className="font-semibold">Verified Profiles</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-green-50 rounded-full text-green-600"><Users className="h-6 w-6"/></div>
                <span className="font-semibold">Smart Matching</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600"><Sparkles className="h-6 w-6"/></div>
                <span className="font-semibold">Lifestyle Fit</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}