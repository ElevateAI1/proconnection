
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Calendar } from './CalendarView';
import { PatientManagement } from './PatientManagement';
import { MessagingHub } from './MessagingHub';
import { DocumentsSection } from './DocumentsSection';
import { SubscriptionPlans } from './SubscriptionPlans';
import { ProfileSetup } from './ProfileSetup';
import { SettingsModal } from './SettingsModal';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { AffiliateSystem } from './AffiliateSystem';
import { useMercadoPago } from '@/hooks/useMercadoPago';

const Dashboard = () => {
  const { profile, psychologist } = useProfile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const { createPreference } = useMercadoPago();

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (profile.user_type === 'admin') {
    return <AdminDashboard />;
  }

  const handlePlanSelect = async (planId: string) => {
    try {
      const preference = await createPreference(planId);
      if (preference.init_point) {
        window.open(preference.init_point, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment preference:', error);
    }
  };

  const handleProfileComplete = () => {
    // Refresh the page or refetch profile data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pl-64">
        <main className="p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'patients' && <PatientManagement />}
          {activeTab === 'messaging' && <MessagingHub />}
          {activeTab === 'documents' && <DocumentsSection />}
          {activeTab === 'subscription' && <SubscriptionPlans onPlanSelect={handlePlanSelect} />}
          {activeTab === 'affiliates' && <AffiliateSystem />}
          {activeTab === 'profile' && (
            <ProfileSetup 
              userType="psychologist" 
              onComplete={handleProfileComplete} 
            />
          )}
          {activeTab === 'settings' && (
            <SettingsModal 
              isOpen={showSettings} 
              onClose={() => setShowSettings(false)} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
