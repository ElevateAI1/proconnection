import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign,
  CalendarCheck,
  ChevronRight,
  Copy,
  Heart,
  LogOut,
  Check,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  TrendingUp,
  AlertCircle,
  FileText,
  Phone,
  Mail
} from 'lucide-react';

type ViewType = "dashboard" | "patients" | "appointment-requests" | "calendar" | "accounting";

// Datos hardcodeados
const mockStats = {
  psychologistName: 'Dr. María López',
  professionalCode: 'PS-6A3C9C',
  todayAppointments: 4,
  pendingRequests: 2,
  activePatients: 28,
  monthlyIncome: 165000,
  pendingReceipts: 3,
  approvedReceipts: 45,
};

const mockTodayAppointments = [
  { id: 1, patient: 'María González', time: '09:00', status: 'confirmada' },
  { id: 2, patient: 'Juan Pérez', time: '10:30', status: 'pendiente' },
  { id: 3, patient: 'Ana Martínez', time: '14:00', status: 'confirmada' },
  { id: 4, patient: 'Carlos Rodríguez', time: '16:00', status: 'confirmada' },
];

const mockPatients = [
  { id: 1, name: 'María González', email: 'maria@email.com', phone: '+54 11 1234-5678', lastAppointment: '2025-01-10' },
  { id: 2, name: 'Juan Pérez', email: 'juan@email.com', phone: '+54 11 2345-6789', lastAppointment: '2025-01-08' },
  { id: 3, name: 'Ana Martínez', email: 'ana@email.com', phone: '+54 11 3456-7890', lastAppointment: '2025-01-12' },
  { id: 4, name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+54 11 4567-8901', lastAppointment: '2025-01-05' },
];

const mockPendingRequests = [
  { id: 1, patient: 'Laura Sánchez', requestedDate: '2025-01-20', time: '11:00' },
  { id: 2, patient: 'Pedro Fernández', requestedDate: '2025-01-21', time: '15:30' },
];

const mockPayments = [
  { id: 1, patient: 'María González', amount: 15000, date: '2025-01-15', status: 'completado' },
  { id: 2, patient: 'Juan Pérez', amount: 15000, date: '2025-01-15', status: 'pendiente' },
  { id: 3, patient: 'Ana Martínez', amount: 18000, date: '2025-01-14', status: 'completado' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const InteractiveDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    { id: "patients" as ViewType, label: "Pacientes", icon: Users },
    { id: "appointment-requests" as ViewType, label: "Solicitudes", icon: CalendarCheck, badge: mockStats.pendingRequests },
    { id: "calendar" as ViewType, label: "Calendario", icon: Calendar },
    { id: "accounting" as ViewType, label: "Finanzas", icon: DollarSign, badge: mockStats.pendingReceipts },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-blue-petrol">
                <span>{getGreeting()}, </span>
                <span className="text-blue-soft">{mockStats.psychologistName}</span>
              </h1>
              <p className="text-xs text-blue-petrol/70">{getCurrentDate()}</p>
            </div>

            {/* Tareas de hoy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-blue-soft to-green-mint rounded-full"></div>
                <h2 className="text-sm font-bold text-blue-petrol">Tareas de hoy</h2>
                <Badge className="text-[10px] px-2 py-0.5 bg-peach-pale/20 text-blue-petrol">
                  {mockStats.todayAppointments + mockStats.pendingRequests} pendientes
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Card className="border border-slate-200 p-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-soft/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-petrol" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-petrol">Citas de hoy</p>
                        <p className="text-[10px] text-blue-petrol/70">{mockStats.todayAppointments} programadas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-blue-petrol/50" />
                  </div>
                </Card>
                
                <Card className="border border-slate-200 p-2 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-mint/30 rounded-lg flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4 text-blue-petrol" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-petrol">Solicitudes</p>
                        <p className="text-[10px] text-blue-petrol/70">Esperando aprobación</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-blue-petrol/50" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Resumen general */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-green-mint to-blue-soft rounded-full"></div>
                <h2 className="text-sm font-bold text-blue-petrol">Resumen general</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Card className="border border-slate-200 p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-petrol/70 uppercase">Pacientes activos</p>
                      <p className="text-lg font-bold text-blue-petrol">{mockStats.activePatients}</p>
                    </div>
                    <Users className="w-6 h-6 text-green-mint/50" />
                  </div>
                </Card>
                
                <Card className="border border-slate-200 p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-petrol/70 uppercase">Ingresos del mes</p>
                      <p className="text-lg font-bold text-blue-petrol">${mockStats.monthlyIncome.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-blue-soft/50" />
                  </div>
                </Card>
                
                <Card className="border border-slate-200 p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-petrol/70 uppercase">Pendientes</p>
                      <p className="text-lg font-bold text-blue-petrol">{mockStats.pendingReceipts}</p>
                    </div>
                    <Clock className="w-6 h-6 text-peach-pale/50" />
                  </div>
                </Card>
                
                <Card className="border border-slate-200 p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-petrol/70 uppercase">Aprobados</p>
                      <p className="text-lg font-bold text-blue-petrol">{mockStats.approvedReceipts}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-mint/50" />
                  </div>
                </Card>
              </div>
            </div>

            {/* Gestión rápida */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-lavender-soft to-blue-soft rounded-full"></div>
                <h2 className="text-sm font-bold text-blue-petrol">Gestión rápida</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Plus, title: "Nuevo paciente", desc: "Agregar paciente" },
                  { icon: Calendar, title: "Programar cita", desc: "Crear nueva cita" },
                  { icon: Eye, title: "Ver pacientes", desc: "Lista completa" },
                  { icon: TrendingUp, title: "Reportes", desc: "Análisis y estadísticas" },
                ].map((item, idx) => (
                  <Card key={idx} className="border border-slate-200 p-2 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-soft/30 rounded-lg flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-blue-petrol" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-petrol">{item.title}</p>
                          <p className="text-[10px] text-blue-petrol/70">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-blue-petrol/50" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case "patients":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-petrol">Pacientes</h2>
              <Button size="sm" className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Nuevo
              </Button>
            </div>
            
            <div className="space-y-2">
              {mockPatients.map(patient => (
                <Card key={patient.id} className="border border-slate-200 p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-soft/30 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-petrol" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-petrol">{patient.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-blue-petrol/60">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-blue-petrol/50" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "appointment-requests":
        return (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-blue-petrol">Solicitudes de cita</h2>
            
            <div className="space-y-2">
              {mockPendingRequests.map(request => (
                <Card key={request.id} className="border border-peach-pale/50 p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-peach-pale/30 rounded-lg flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4 text-blue-petrol" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-petrol">{request.patient}</p>
                        <p className="text-[10px] text-blue-petrol/70">{request.requestedDate} a las {request.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">Rechazar</Button>
                      <Button size="sm" className="h-6 text-[10px] px-2">Aprobar</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-blue-petrol">Calendario</h2>
            
            <Card className="border border-slate-200 p-2">
              <div className="text-xs font-semibold text-blue-petrol mb-2">Citas de hoy</div>
              <div className="space-y-1.5">
                {mockTodayAppointments.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-petrol/50" />
                      <span className="text-xs text-blue-petrol">{apt.time}</span>
                      <span className="text-xs font-semibold text-blue-petrol">{apt.patient}</span>
                    </div>
                    <Badge className={`text-[10px] px-1.5 py-0.5 ${
                      apt.status === 'confirmada' ? 'bg-green-mint/20 text-green-700' : 'bg-peach-pale/20 text-amber-700'
                    }`}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case "accounting":
        return (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-blue-petrol">Finanzas</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <Card className="border border-slate-200 p-2">
                <p className="text-[10px] text-blue-petrol/70 uppercase mb-1">Ingresos del mes</p>
                <p className="text-lg font-bold text-blue-petrol">${mockStats.monthlyIncome.toLocaleString()}</p>
              </Card>
              
              <Card className="border border-slate-200 p-2">
                <p className="text-[10px] text-blue-petrol/70 uppercase mb-1">Pendientes</p>
                <p className="text-lg font-bold text-blue-petrol">{mockStats.pendingReceipts}</p>
              </Card>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-semibold text-blue-petrol">Últimos pagos</div>
              {mockPayments.map(payment => (
                <Card key={payment.id} className="border border-slate-200 p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-petrol">{payment.patient}</p>
                      <p className="text-[10px] text-blue-petrol/70">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-petrol">${payment.amount.toLocaleString()}</p>
                      <Badge className={`text-[10px] px-1.5 py-0.5 mt-1 ${
                        payment.status === 'completado' ? 'bg-green-mint/20 text-green-700' : 'bg-peach-pale/20 text-amber-700'
                      }`}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-[900px] mx-auto" style={{ height: '600px' }}>
      {/* Badge superior derecho - Fuera del contenedor */}
      <div className="absolute -top-4 -right-4 bg-green-mint text-blue-petrol px-3 py-1.5 rounded-lg border-2 border-blue-petrol/30 shadow-lg font-sans-geometric font-bold text-xs flex items-center gap-1.5 z-20">
        <Check className="w-4 h-4" />
        Pagos automáticos
      </div>

      {/* Badge inferior izquierdo - Fuera del contenedor */}
      <div className="absolute -bottom-4 -left-4 bg-blue-soft text-white-warm px-3 py-1.5 rounded-lg border-2 border-blue-petrol/30 shadow-lg font-sans-geometric font-bold text-xs flex items-center gap-1.5 z-20">
        <Calendar className="w-4 h-4" />
        Agenda llena
      </div>

      {/* Contenedor del dashboard */}
      <div className="bg-white-warm rounded-2xl shadow-2xl border-4 border-blue-petrol/20 w-full overflow-hidden flex h-full">

      {/* Sidebar */}
      <div className="w-56 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-soft rounded flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-petrol">ProConnection</div>
              <div className="text-[10px] text-blue-petrol/60">Panel Profesional</div>
            </div>
          </div>
          
          {/* Código Profesional */}
          <Card className="border border-blue-soft/30 p-2 mt-2">
            <div className="text-[10px] text-blue-petrol/70 mb-1">Código Profesional</div>
            <Badge className="bg-blue-soft text-white text-xs px-2 py-1 mb-1 w-full justify-center">
              {mockStats.professionalCode}
            </Badge>
            <div className="text-[10px] text-blue-petrol/60 mb-1">Comparte este código con tus pacientes</div>
            <Button size="sm" variant="outline" className="w-full h-6 text-[10px]">
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
          </Card>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-[10px] font-semibold text-blue-petrol/70 uppercase mb-2 px-2">PRINCIPAL</div>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-blue-soft/20 text-blue-petrol font-semibold'
                      : 'text-blue-petrol/70 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge className="bg-peach-pale text-blue-petrol text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 px-2">
            <button className="w-full flex items-center justify-between text-[10px] text-blue-petrol/70 hover:text-blue-petrol">
              <span>MÁS OPCIONES</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-soft/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-petrol">ML</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-petrol">{mockStats.psychologistName}</div>
              <div className="text-[10px] text-blue-petrol/60">psychologist</div>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 text-[10px] text-blue-petrol/70 hover:text-blue-petrol">
            <LogOut className="w-3 h-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-white to-slate-50">
        {/* Top Bar */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <span className="text-xs text-blue-petrol font-semibold">{mockStats.psychologistName}</span>
          <Badge className="text-[10px] px-2 py-0.5 bg-blue-soft/15 text-blue-petrol">DEV</Badge>
          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
            Ver Planes
          </Button>
        </div>
        
        {renderContent()}
      </div>
      </div>
    </div>
  );
};
