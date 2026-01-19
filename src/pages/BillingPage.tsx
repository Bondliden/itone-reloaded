import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/Header';
import { SubscriptionManager } from '../components/SubscriptionManager';
import { PlatformUploadPricing } from '../components/PlatformUploadPricing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CreditCard, Upload } from 'lucide-react';

export function BillingPage() {
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscriptions</h1>
          <p className="text-gray-300 text-lg">
            Manage your subscription, billing, and platform upload costs
          </p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg p-1">
            <TabsTrigger value="subscription" className="data-[state=active]:bg-white/20">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="uploads" className="data-[state=active]:bg-white/20">
              <Upload className="h-4 w-4 mr-2" />
              Platform Uploads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="uploads">
            <PlatformUploadPricing />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}