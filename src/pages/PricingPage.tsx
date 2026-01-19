import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/Header';
import { PricingPage as PricingComponent } from '../components/PricingPage';

export function PricingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <PricingComponent />
      </main>
    </div>
  );
}