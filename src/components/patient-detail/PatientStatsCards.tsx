
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, MessageCircle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientStats {
  totalAppointments: number;
  totalDocuments: number;
  unreadMessages: number;
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
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      title: "Documentos",
      value: stats.totalDocuments,
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
    },
    {
      title: "Mensajes Sin Leer",
      value: stats.unreadMessages,
      icon: MessageCircle,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
    {
      title: "Última Cita",
      value: stats.lastAppointment 
        ? new Date(stats.lastAppointment).toLocaleDateString('es-ES')
        : 'Sin citas',
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      isDate: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${stat.bgColor} p-6 relative`}>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${stat.isDate ? 'text-sm' : ''} text-slate-800`}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
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
