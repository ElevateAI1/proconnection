
import React from 'react';
import { useProfile } from '@/hooks/useProfile';

const Dashboard = () => {
  const { profile, psychologist } = useProfile();

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (profile.user_type === 'admin') {
    return <div>Admin Dashboard (Not implemented)</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control profesional
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pacientes Activos</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Citas Esta Semana</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Mensajes Nuevos</h3>
          <p className="text-3xl font-bold text-orange-600">3</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
