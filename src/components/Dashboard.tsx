
import { MinimalistDashboard } from "./MinimalistDashboard";

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  return <MinimalistDashboard onNavigate={onNavigate} />;
};
