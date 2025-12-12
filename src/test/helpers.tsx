import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { RealtimeProvider } from '@/contexts/RealtimeContext';

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      <AuthProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

