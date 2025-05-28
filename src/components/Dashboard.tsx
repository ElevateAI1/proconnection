import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { CalendarView } from './CalendarView';
import { PatientManagement } from './PatientManagement';
import { MessagingHub } from './MessagingHub';
import { DocumentsSection } from './DocumentsSection';
import { SubscriptionPlans } from './SubscriptionPlans';
import { ProfileSetup } from './ProfileSetup';
import { SettingsModal } from './SettingsModal';
import { AdminDashboard } from './AdminDashboard';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { AffiliateSystem } from './AffiliateSystem';

const Dashboard = () => {
  const { profile, psychologist } = useProfile();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (profile.user_type === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pl-64">
        <main className="p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'patients' && <PatientManagement />}
          {activeTab === 'messaging' && <MessagingHub />}
          {activeTab === 'documents' && <DocumentsSection />}
          {activeTab === 'subscription' && <SubscriptionPlans />}
          {activeTab === 'affiliates' && <AffiliateSystem />}
          {activeTab === 'profile' && <ProfileSetup />}
          {activeTab === 'settings' && <SettingsModal />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
