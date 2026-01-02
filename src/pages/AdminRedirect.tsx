
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

export const AdminRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  console.log('=== ADMIN REDIRECT DEBUG ===');
  console.log('Auth loading:', authLoading);
  console.log('Admin loading:', adminLoading);
  console.log('User:', user?.id);
  console.log('Is admin:', isAdmin);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      console.log('Redirecting based on admin status:', { user: !!user, isAdmin });
      
      if (user && isAdmin) {
        console.log('Redirecting to admin dashboard...');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Redirecting to admin login...');
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  // Mostrar loading mientras se verifica el estado
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando acceso administrador...</p>
        <div className="mt-2 text-xs text-gray-500">
          Auth: {authLoading ? 'loading' : 'ready'} | Admin: {adminLoading ? 'loading' : 'ready'}
        </div>
      </div>
    </div>
  );
};
