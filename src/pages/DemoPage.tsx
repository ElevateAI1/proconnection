import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, Users, Video, ClipboardList, Shield, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export const DemoPage = () => {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const demoFeatures = [
    {
      id: "yellow",
      title: "Gestión de Agenda",
      description: "Sistema inteligente para programar y gestionar citas con tus pacientes",
      icon: Calendar,
      color: "emerald",
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
      color: "emerald",
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
      color: "purple",
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
      color: "blue",
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
      color: "blue",
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
      color: "red",
      steps: [
        "Cifrado de extremo a extremo para todos los datos",
        "Autenticación segura con verificación de identidad",
        "Auditoría completa de todos los accesos al sistema",
        "Cumplimiento con estándares internacionales de privacidad"
      ]
    }
  ];

  const startDemo = (featureId: string) => {
    setCurrentDemo(featureId);
  };

  const resetDemo = () => {
    setCurrentDemo(null);
  };

  const currentFeature = demoFeatures.find(f => f.id === currentDemo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 transition-colors duration-300">
              Volver al inicio
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Demostración de Funcionalidades
            </h1>
          </div>

          <Link to="/register">
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:scale-105 transition-all duration-300">
              Empezar Ahora
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-6">
          Explora ProConnection en acción
        </h2>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Descubre cómo ProConnection puede transformar tu práctica profesional. 
          Haz clic en cualquier característica para conocer más detalles.
        </p>
      </section>

      {/* Demo Content */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {!currentDemo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoFeatures.map((feature) => (
              <Card 
                key={feature.id}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                onClick={() => startDemo(feature.id)}
              >
                <CardHeader className="text-center relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className={`text-xl group-hover:text-${feature.color}-600 transition-colors duration-300`}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-600 text-center mb-4">
                    {feature.description}
                  </p>
                  <Button 
                    className={`w-full bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 hover:scale-105 transition-all duration-300`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-emerald-50">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r from-${currentFeature?.color}-500 to-${currentFeature?.color}-600 rounded-full flex items-center justify-center`}>
                    {currentFeature && <currentFeature.icon className="w-6 h-6 text-white" />}
                  </div>
                  <CardTitle className="text-2xl text-slate-800">
                    {currentFeature?.title}
                  </CardTitle>
                </div>
                <p className="text-lg text-slate-600">
                  {currentFeature?.description}
                </p>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">
                    Características principales:
                  </h3>
                  
                  <div className="grid gap-4">
                    {currentFeature?.steps.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-4 p-4 rounded-lg border-l-4 border-${currentFeature.color}-500 bg-${currentFeature.color}-50/50 transform hover:scale-102 transition-all duration-300`}
                      >
                        <div className={`w-8 h-8 bg-${currentFeature.color}-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <p className="text-slate-700 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-slate-100 to-blue-100 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      💡 Beneficios clave:
                    </h4>
                    <ul className="text-slate-600 space-y-2">
                      <li>• Optimiza el tiempo dedicado a tareas administrativas</li>
                      <li>• Mejora significativamente la experiencia del paciente</li>
                      <li>• Cumple con todas las regulaciones de privacidad médica</li>
                      <li>• Facilita el análisis y seguimiento del progreso terapéutico</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button 
                      onClick={resetDemo}
                      variant="outline" 
                      className="flex-1 hover:scale-105 transition-all duration-300"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Ver todas las características
                    </Button>
                    <Link to="/register" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:scale-105 transition-all duration-300">
                        Comenzar ahora
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Comienza tu prueba gratuita de 7 días y transforma tu práctica profesional hoy mismo.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-110 px-8 py-3 text-lg font-semibold">
              Comenzar Prueba Gratuita
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
