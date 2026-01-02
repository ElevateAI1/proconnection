
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, MessageCircle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateArgentina } from "@/utils/dateFormatting";

interface PatientStats {
  totalAppointments: number;
  totalDocuments: number;
  lastAppointment?: string;
}

interface PatientStatsCardsProps {
  stats: PatientStats;
  loading?: boolean;
}

export const PatientStatsCards = ({ stats, loading = false }: PatientStatsCardsProps) => {
  const statsCards = [
    {
      title: "Total Citas",
      value: stats.totalAppointments,
      icon: Calendar,
      iconColor: "from-blue-500 to-blue-600",
      iconTextColor: "text-white",
      bgColor: "from-blue-50 to-blue-100",
      textColor: "text-slate-600",
    },
    {
      title: "Documentos",
      value: stats.totalDocuments,
      icon: FileText,
      iconColor: "bg-blue-petrol",
      iconTextColor: "text-white-warm",
      bgColor: "from-emerald-50 to-emerald-100",
      textColor: "text-blue-petrol",
    },
    {
      title: "Última Cita",
      value: stats.lastAppointment 
        ? formatDateArgentina(stats.lastAppointment)
        : 'Sin citas',
      icon: Activity,
      iconColor: "from-orange-500 to-orange-600",
      iconTextColor: "text-white",
      bgColor: "from-orange-50 to-orange-100",
      textColor: "text-slate-600",
      isDate: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        const iconBgClass = stat.iconColor.includes('bg-') 
          ? stat.iconColor 
          : `bg-gradient-to-br ${stat.iconColor}`;
        return (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden h-full">
            <CardContent className="p-0 h-full">
              <div className={`bg-gradient-to-br ${stat.bgColor} p-6 relative h-full min-h-[140px] flex flex-col`}>
                <div className={`w-12 h-12 ${iconBgClass} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconTextColor}`} />
                </div>
                <div className="space-y-2 flex-1">
                  <p className={`text-2xl font-bold ${stat.isDate ? 'text-sm' : ''} text-slate-800`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm font-medium ${stat.textColor}`}>{stat.title}</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
