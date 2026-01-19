import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from './modules/auth';
import { I18nProvider } from './modules/i18n/components/I18nProvider';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
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
  );
}

export default App;