import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
<<<<<<< HEAD
import { Toaster } from './components/ui/toast';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PricingPage } from './pages/PricingPage';
import { BillingPage } from './pages/BillingPage';
import { KaraokePage } from './pages/KaraokePage';
=======
import { AuthProvider } from './modules/auth';
import { I18nProvider } from './modules/i18n/components/I18nProvider';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorBoundary } from './components/ErrorBoundary';
>>>>>>> origin/main

const queryClient = new QueryClient();

function App() {
  return (
<<<<<<< HEAD
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/pricing" component={PricingPage} />
              <Route path="/billing" component={BillingPage} />
              <Route path="/dashboard" component={DashboardPage} />
              <Route path="/karaoke" component={KaraokePage} />
              <Route>
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-gray-300">Page not found</p>
                  </div>
                </div>
              </Route>
            </Switch>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
=======
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route>
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                        <p className="text-gray-300">Page not found</p>
                      </div>
                    </div>
                  </Route>
                </Switch>
              </div>
            </Router>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>
>>>>>>> origin/main
  );
}

export default App;