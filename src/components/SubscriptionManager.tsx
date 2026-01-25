<<<<<<< HEAD
import { useState } from 'react';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, XCircle, Download, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
=======
import React, { useState } from 'react';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, XCircle, Download, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../modules/auth';
>>>>>>> origin/main
import { useUserSubscription, useUpdateSubscription } from '../hooks/useSubscription';
import { toast } from './ui/toast';

export function SubscriptionManager() {
<<<<<<< HEAD
  const { user } = useAuth();
=======
  const { state: { user } } = useAuth();
>>>>>>> origin/main
  const { data: subscription } = useUserSubscription(user?.id);
  const updateSubscriptionMutation = useUpdateSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionId: subscription.id,
        updates: { cancel_at_period_end: true }
      });

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the current billing period.",
      });
      setShowCancelDialog(false);
<<<<<<< HEAD
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
=======
    } catch (error) {
>>>>>>> origin/main
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionId: subscription.id,
        updates: { cancel_at_period_end: false }
      });

      toast({
        title: "Subscription Reactivated",
        description: "Your subscription will continue at the next billing period.",
      });
<<<<<<< HEAD
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
=======
    } catch (error) {
>>>>>>> origin/main
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'trialing': return 'text-blue-400';
      case 'past_due': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      case 'expired': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'trialing': return <Crown className="h-5 w-5 text-blue-400" />;
      case 'past_due': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'expired': return <XCircle className="h-5 w-5 text-gray-400" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!subscription) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
        <p className="text-gray-300 mb-6">
          Subscribe to unlock premium features and enhance your karaoke experience.
        </p>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          View Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Subscription Management</h2>
          {getStatusIcon(subscription.status)}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Current Plan</h3>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <span className="text-xl font-bold text-white">{subscription.plan?.name}</span>
                </div>
                <p className="text-gray-300">${subscription.plan?.price_monthly}/month</p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Status</h3>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(subscription.status)}
                  <span className={`font-medium capitalize ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.status === 'trialing' && subscription.trial_end && (
                  <p className="text-gray-400 text-sm mt-1">
                    Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Billing Period</h3>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-white text-sm">
<<<<<<< HEAD
                    {new Date(subscription.current_period_start).toLocaleDateString()} -
=======
                    {new Date(subscription.current_period_start).toLocaleDateString()} - 
>>>>>>> origin/main
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Payment Method</h3>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-green-400" />
                  <span className="text-white text-sm">•••• •••• •••• 4242</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Expires 12/2027</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <CreditCard className="h-4 w-4 mr-2" />
            Update Payment Method
          </Button>
<<<<<<< HEAD

=======
          
>>>>>>> origin/main
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Download Invoices
          </Button>

          {subscription.cancel_at_period_end ? (
<<<<<<< HEAD
            <Button
=======
            <Button 
>>>>>>> origin/main
              onClick={handleReactivateSubscription}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Reactivate Subscription
            </Button>
          ) : (
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-400/50 text-red-400 hover:bg-red-500/20">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Cancel Subscription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Are you sure you want to cancel your {subscription.plan?.name} subscription?
                  </p>
                  <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Important</span>
                    </div>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Your subscription will remain active until {new Date(subscription.current_period_end).toLocaleDateString()}</li>
                      <li>• You'll lose access to premium features after this date</li>
                      <li>• Your recordings will be preserved but limited to standard quality</li>
                      <li>• You can reactivate anytime before the period ends</li>
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>
                      Keep Subscription
                    </Button>
<<<<<<< HEAD
                    <Button
=======
                    <Button 
>>>>>>> origin/main
                      onClick={handleCancelSubscription}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm Cancellation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Cancellation Notice */}
        {subscription.cancel_at_period_end && (
          <div className="mt-4 bg-red-600/20 border border-red-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 font-medium">Subscription Cancelled</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
<<<<<<< HEAD
              Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}.
=======
              Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}. 
>>>>>>> origin/main
              You can reactivate it anytime before this date.
            </p>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Billing History</h3>
        <div className="space-y-3">
          {/* Mock billing history */}
          {[
            { date: '2025-01-01', amount: subscription.plan?.price_monthly || 0, status: 'paid', invoice: 'INV-2025-001' },
            { date: '2024-12-01', amount: subscription.plan?.price_monthly || 0, status: 'paid', invoice: 'INV-2024-012' },
            { date: '2024-11-01', amount: subscription.plan?.price_monthly || 0, status: 'paid', invoice: 'INV-2024-011' }
          ].map((bill, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-white font-medium">${bill.amount.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">{new Date(bill.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-sm capitalize">{bill.status}</span>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-1" />
                  Invoice
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}