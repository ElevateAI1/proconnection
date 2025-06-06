
import { useOptimizedProfile } from "@/hooks/useOptimizedProfile";
import { useUnifiedDashboardStats } from "@/hooks/useUnifiedDashboardStats";
import { OptimizedDashboard } from "./OptimizedDashboard";

type ViewType = "dashboard" | "patients" | "calendar" | "messages" | "affiliates" | "seo" | "reports" | "support" | "early-access" | "visibility" | "rates" | "accounting";

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { psychologist } = useOptimizedProfile();
  const { psychologistName, planType } = useUnifiedDashboardStats(psychologist?.id);

  return (
    <OptimizedDashboard 
      onViewChange={onViewChange}
      psychologistId={psychologist?.id}
      psychologistName={psychologistName}
      planType={planType}
    />
  );
};
