import React, { useState, useEffect } from 'react';
import { Bell, X, CreditCard, AlertTriangle, CheckCircle, Calendar, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../modules/auth';
import { useUserSubscription } from '../hooks/useSubscription';

interface Notification {
  id: string;
  type: 'billing' | 'subscription' | 'trial' | 'renewal' | 'payment_failed';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

export function NotificationCenter() {
  const { state: { user } } = useAuth();
  // Mock subscription for demo
  const subscription = null;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Generate notifications based on subscription status
    const generateNotifications = () => {
      const notifs: Notification[] = [];

      if (subscription) {
        const periodEnd = new Date(subscription.current_period_end);
        const daysUntilRenewal = Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        // Trial ending notification
        if (subscription.status === 'trialing' && subscription.trial_end) {
          const trialEnd = new Date(subscription.trial_end);
          const daysUntilTrialEnd = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilTrialEnd <= 3 && daysUntilTrialEnd > 0) {
            notifs.push({
              id: 'trial-ending',
              type: 'trial',
              title: 'Trial Ending Soon',
              message: `Your ${subscription.plan?.name} trial ends in ${daysUntilTrialEnd} day${daysUntilTrialEnd !== 1 ? 's' : ''}. Add a payment method to continue.`,
              timestamp: new Date(),
              read: false,
              actionLabel: 'Add Payment Method',
              actionUrl: '/billing'
            });
          }
        }

        // Renewal reminder
        if (subscription.status === 'active' && daysUntilRenewal <= 7 && daysUntilRenewal > 0) {
          notifs.push({
            id: 'renewal-reminder',
            type: 'renewal',
            title: 'Subscription Renewal',
            message: `Your ${subscription.plan?.name} subscription renews in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''} for $${subscription.plan?.price_monthly}.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: false
          });
        }

        // Cancellation confirmation
        if (subscription.cancel_at_period_end) {
          notifs.push({
            id: 'cancellation-confirmed',
            type: 'subscription',
            title: 'Subscription Cancelled',
            message: `Your subscription will end on ${periodEnd.toLocaleDateString()}. You can reactivate anytime before this date.`,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            read: false,
            actionLabel: 'Reactivate',
            actionUrl: '/billing'
          });
        }
      }

      // Mock additional notifications
      notifs.push(
        {
          id: 'welcome',
          type: 'subscription',
          title: 'Welcome to iTone!',
          message: 'Your account has been created successfully. Start exploring our song library!',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          read: true
        },
        {
          id: 'payment-success',
          type: 'billing',
          title: 'Payment Successful',
          message: 'Your monthly subscription payment of $19.99 has been processed successfully.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          read: true
        }
      );

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    };

    generateNotifications();
  }, [subscription]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'billing': return <CreditCard className="h-5 w-5 text-green-400" />;
      case 'trial': return <Crown className="h-5 w-5 text-blue-400" />;
      case 'renewal': return <Calendar className="h-5 w-5 text-yellow-400" />;
      case 'payment_failed': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'subscription': return <CheckCircle className="h-5 w-5 text-purple-400" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-purple-400" />
              <span>Notifications</span>
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-purple-400 hover:bg-purple-500/20"
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  notification.read 
                    ? 'bg-gray-800/50 border-gray-700' 
                    : 'bg-blue-600/10 border-blue-400/30 hover:bg-blue-600/20'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium text-sm">
                        {notification.title}
                      </h4>
                      <span className="text-gray-400 text-xs">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {notification.message}
                    </p>
                    {notification.actionLabel && (
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      >
                        {notification.actionLabel}
                      </Button>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}