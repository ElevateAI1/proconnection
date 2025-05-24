
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, FileText, Clock } from "lucide-react";

export const PatientPortal = () => {
  const upcomingAppointments = [
    { date: "2024-01-22", time: "10:00", type: "Terapia Individual", status: "Confirmada" },
    { date: "2024-01-29", time: "10:00", type: "Seguimiento", status: "Pendiente" },
  ];

  const recentMessages = [
    { from: "Dr. María González", message: "Perfecto, dedicaremos tiempo a revisar las técnicas...", time: "hace 2 horas" },
    { from: "Dr. María González", message: "Recuerda practicar los ejercicios que vimos...", time: "hace 2 días" },
  ];

  const documents = [
    { name: "Formulario de Consentimiento", date: "2024-01-10", status: "Completado" },
    { name: "Evaluación Inicial", date: "2024-01-15", status: "Pendiente" },
    { name: "Plan de Tratamiento", date: "2024-01-12", status: "Disponible" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Portal del Paciente</h2>
        <p className="text-slate-600">Bienvenida, Ana Martínez</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Próxima Cita</p>
                <p className="text-2xl font-bold text-slate-800">22 Ene</p>
                <p className="text-sm text-slate-600">10:00 AM</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Mensajes Nuevos</p>
                <p className="text-2xl font-bold text-slate-800">2</p>
                <p className="text-sm text-slate-600">De tu psicóloga</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Sesiones Realizadas</p>
                <p className="text-2xl font-bold text-slate-800">8</p>
                <p className="text-sm text-slate-600">Este año</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5" />
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {appointment.date.split('-')[2]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{appointment.type}</p>
                      <p className="text-sm text-slate-600">{appointment.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "Confirmada" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
              <button className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                Solicitar nueva cita
              </button>
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
                <div key={index} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-800 text-sm">{message.from}</p>
                    <p className="text-xs text-slate-500">{message.time}</p>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{message.message}</p>
                </div>
              ))}
              <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Ver todos los mensajes
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5" />
            Documentos y Formularios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === "Completado" 
                      ? "bg-green-100 text-green-700"
                      : doc.status === "Pendiente"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{doc.name}</h3>
                <p className="text-sm text-slate-600">{doc.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
