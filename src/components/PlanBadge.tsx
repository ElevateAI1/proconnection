
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';

export const PlanBadge = () => {
  const { isTeamsUser, isProConnectionUser, isDevUser, loading } = usePlanCapabilities();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (isDevUser()) {
    return (
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
        <Crown className="w-3 h-3 mr-1" />
        DEV
      </Badge>
    );
  }

  if (isTeamsUser()) {
    return (
      <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
        <Crown className="w-3 h-3 mr-1" />
        Teams
      </Badge>
    );
  }

  if (isProConnectionUser()) {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
        <Star className="w-3 h-3 mr-1" />
        ProConnection
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      Starter
    </Badge>
  );
};
