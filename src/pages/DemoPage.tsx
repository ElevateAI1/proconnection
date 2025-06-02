import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, Users, Video, ClipboardList, Shield, ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export const DemoPage = () => {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const demoFeatures = [
    {
      id: "calendar",
      title: "Gestión de Agenda",
      description: "Sistema inteligente para programar y gestionar citas con tus pacientes",
      icon: Calendar,
      colorClass: "from-blue-500 to-blue-600",
      steps: [
        "Selecciona fecha y hora disponible en el calendario",
        "El sistema verifica automáticamente conflictos horarios",
        "Envía recordatorios automáticos por email al paciente",
        "Permite reprogramar o cancelar con un solo clic"
      ]
    },
    {
      id: "patients",
      title: "Gestión de Pacientes",
      description: "Mantén organizados los historiales y datos de todos tus pacientes",
      icon: Users,
      colorClass: "from-blue-500 to-blue-600",
      steps: [
        "Registro completo de datos personales del paciente",
        "Historial médico y notas detalladas de cada sesión",
        "Seguimiento de progreso y objetivos terapéuticos",
        "Acceso rápido a toda la información relevante"
      ]
    },
    {
      id: "messaging",
      title: "Comunicación Segura",
      description: "Mensajería cifrada para mantener contacto profesional",
      icon: MessageCircle,
      colorClass: "from-blue-500 to-blue-600",
      steps: [
        "Mensajes cifrados para proteger la confidencialidad",
        "Notificaciones en tiempo real para comunicación fluida",
        "Compartir documentos de forma segura",
        "Historial completo de todas las conversaciones"
      ]
    },
    {
      id: "video",
      title: "Consultas Virtuales",
      description: "Videollamadas de alta calidad para sesiones remotas",
      icon: Video,
      colorClass: "from-red-500 to-red-600",
      steps: [
        "Videollamadas HD con conexión estable",
        "Enlaces únicos generados automáticamente",
        "Compatible con cualquier dispositivo",
        "Grabación opcional con consentimiento del paciente"
      ]
    },
    {
      id: "forms",
      title: "Formularios Digitales",
      description: "Crea y gestiona formularios de evaluación personalizados",
      icon: ClipboardList,
      colorClass: "from-red-500 to-red-600",
      steps: [
        "Formularios de evaluación completamente personalizables",
        "Consentimientos informados digitales",
        "Generación automática de reportes de progreso",
        "Integración directa con el historial del paciente"
      ]
    },
    {
      id: "security",
      title: "Seguridad y Privacidad",
      description: "Cumplimiento total con regulaciones de privacidad médica",
      icon: Shield,
      colorClass: "from-red-500 to-red-600",
      steps: [
        "Cifrado de extremo a extremo para todos los datos",
        "Autenticación segura con verificación de identidad",
        "Auditoría completa de todos los accesos al sistema",
        "Cumplimiento con estándares internacionales de privacidad"
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {currentDemo ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setCurrentDemo(null)} size="icon">
                <ArrowLeft />
              </Button>
              <CardTitle>{demoFeatures.find(f => f.id === currentDemo)?.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-2">
              {demoFeatures.find(f => f.id === currentDemo)?.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoFeatures.map((feature) => (
            <Card
              key={feature.id}
              className="cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setCurrentDemo(feature.id)}
            >
              <div className={`rounded-t-xl h-2 bg-gradient-to-r ${feature.colorClass}`} />
              <CardHeader>
                <feature.icon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
