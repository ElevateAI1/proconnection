
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";

export const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const appointments = [
    { id: 1, time: "09:00", patient: "Ana Martínez", type: "Terapia Individual", duration: "50 min" },
    { id: 2, time: "10:30", patient: "Carlos López", type: "Evaluación Inicial", duration: "90 min" },
    { id: 3, time: "14:00", patient: "María Rodriguez", type: "Seguimiento", duration: "50 min" },
    { id: 4, time: "15:30", patient: "Pedro Sánchez", type: "Terapia Familiar", duration: "60 min" },
  ];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Calendario</h2>
          <p className="text-slate-600">Gestiona tus citas y horarios</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
          Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <CalendarIcon className="w-5 h-5" />
              Enero 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    day === 15
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                      : day === 22 || day === 19 || day === 24
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Clock className="w-5 h-5" />
                Agenda del Día - 15 Enero 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeSlots.map((time) => {
                  const appointment = appointments.find(apt => apt.time === time);
                  return (
                    <div key={time} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="w-16 text-sm font-medium text-slate-600 text-center">
                        {time}
                      </div>
                      {appointment ? (
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{appointment.patient}</p>
                              <p className="text-sm text-slate-600">{appointment.type}</p>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">{appointment.duration}</span>
                        </div>
                      ) : (
                        <div className="flex-1 text-slate-400 text-sm">
                          Disponible
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
