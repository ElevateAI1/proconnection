
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageCircle, TrendingUp } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    { title: "Pacientes Activos", value: "28", icon: Users, color: "from-blue-500 to-blue-600" },
    { title: "Citas Hoy", value: "6", icon: Calendar, color: "from-emerald-500 to-emerald-600" },
    { title: "Mensajes Nuevos", value: "12", icon: MessageCircle, color: "from-purple-500 to-purple-600" },
    { title: "Sesiones Este Mes", value: "84", icon: TrendingUp, color: "from-orange-500 to-orange-600" },
  ];

  const upcomingAppointments = [
    { time: "09:00", patient: "Ana Martínez", type: "Terapia Individual" },
    { time: "10:30", patient: "Carlos López", type: "Evaluación Inicial" },
    { time: "14:00", patient: "María Rodriguez", type: "Seguimiento" },
    { time: "15:30", patient: "Pedro Sánchez", type: "Terapia Familiar" },
  ];

  const recentMessages = [
    { from: "Ana Martínez", message: "Buenos días doctora, quería confirmar mi cita de mañana...", time: "hace 5 min" },
    { from: "Carlos López", message: "Muchas gracias por la sesión de ayer, me ayudó mucho...", time: "hace 1 hora" },
    { from: "María Rodriguez", message: "¿Podríamos reprogramar la cita del viernes?", time: "hace 2 horas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
        <p className="text-slate-600">Resumen de tu práctica profesional</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5" />
              Citas de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold">
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{appointment.patient}</p>
                      <p className="text-sm text-slate-600">{appointment.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageCircle className="w-5 h-5" />
              Mensajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-slate-800 text-sm">{message.from}</p>
                    <p className="text-xs text-slate-500">{message.time}</p>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{message.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
