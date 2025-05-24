
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, Calendar, MessageCircle } from "lucide-react";

export const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    {
      id: 1,
      name: "Ana Martínez",
      age: 32,
      phone: "+34 612 345 678",
      lastSession: "2024-01-15",
      nextSession: "2024-01-22",
      status: "Activo",
      notes: "Terapia cognitivo-conductual para ansiedad",
    },
    {
      id: 2,
      name: "Carlos López",
      age: 28,
      phone: "+34 698 765 432",
      lastSession: "2024-01-14",
      nextSession: "2024-01-21",
      status: "Activo",
      notes: "Evaluación inicial completada",
    },
    {
      id: 3,
      name: "María Rodriguez",
      age: 45,
      phone: "+34 655 987 321",
      lastSession: "2024-01-12",
      nextSession: "2024-01-19",
      status: "Activo",
      notes: "Terapia familiar - problemas de comunicación",
    },
    {
      id: 4,
      name: "Pedro Sánchez",
      age: 35,
      phone: "+34 677 123 456",
      lastSession: "2024-01-10",
      nextSession: "2024-01-24",
      status: "Activo",
      notes: "Manejo del estrés laboral",
    },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Pacientes</h2>
          <p className="text-slate-600">Administra la información de tus pacientes</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
          Nuevo Paciente
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 border-slate-200 focus:border-blue-500"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">{patient.name}</CardTitle>
                    <p className="text-sm text-slate-600">{patient.age} años</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {patient.status}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600">
                <p><strong>Teléfono:</strong> {patient.phone}</p>
                <p><strong>Última sesión:</strong> {patient.lastSession}</p>
                <p><strong>Próxima cita:</strong> {patient.nextSession}</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">{patient.notes}</p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                  <Calendar className="w-4 h-4" />
                  Cita
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Mensaje
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
