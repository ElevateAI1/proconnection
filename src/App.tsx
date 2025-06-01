
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthPage } from '@/components/AuthPage';
import Index from '@/pages/Index';
import { RegisterPage } from '@/pages/RegisterPage';
import { DemoPage } from '@/pages/DemoPage';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminDashboard } from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { AdminRoute } from '@/components/AdminRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { HelmetProvider } from 'react-helmet-async';
import { PublicProfilePage } from "@/pages/PublicProfilePage";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/perfil/:profileUrl" element={<PublicProfilePage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
