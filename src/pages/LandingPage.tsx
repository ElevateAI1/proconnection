import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, MessageCircle, Calendar, Star, CheckCircle, Award, TrendingUp, Clock, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Heart className="w-6 h-6 text-white group-hover:animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-500">
              PsiConnect
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to="/app">
              <Button variant="outline" className="hover:scale-105 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/app">
              <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <span className="relative z-10">Comenzar Ahora</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-200/30 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s'}}></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-slate-800 mb-6 animate-fade-in">
            Conecta con la
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-500 cursor-default">
              {" "}salud mental{" "}
            </span>
            del futuro
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
            PsiConnect es la plataforma integral que une a psicólogos y pacientes 
            en un entorno seguro, profesional y tecnológicamente avanzado.
          </p>
          <div className="flex justify-center gap-4 mb-12 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Link to="/app">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-emerald-500 px-8 py-3 text-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <span className="relative z-10">Empezar Gratis</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg hover:scale-105 hover:shadow-lg hover:bg-slate-50 transition-all duration-300">
              Ver Demo
            </Button>
          </div>
          
          {/* Hero Image */}
          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Profesional de la salud mental usando PsiConnect"
              className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full transform group-hover:scale-105 transition-all duration-500 group-hover:shadow-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl group-hover:from-black/10 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-emerald-50/50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group hover:scale-110 transition-all duration-300 cursor-default">
              <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:animate-pulse">500+</div>
              <div className="text-slate-600 group-hover:text-blue-600 transition-colors duration-300">Psicólogos Registrados</div>
            </div>
            <div className="group hover:scale-110 transition-all duration-300 cursor-default" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl font-bold text-emerald-600 mb-2 group-hover:animate-pulse">10,000+</div>
              <div className="text-slate-600 group-hover:text-emerald-600 transition-colors duration-300">Pacientes Atendidos</div>
            </div>
            <div className="group hover:scale-110 transition-all duration-300 cursor-default" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:animate-pulse">50,000+</div>
              <div className="text-slate-600 group-hover:text-purple-600 transition-colors duration-300">Sesiones Completadas</div>
            </div>
            <div className="group hover:scale-110 transition-all duration-300 cursor-default" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl font-bold text-orange-600 mb-2 group-hover:animate-pulse">98%</div>
              <div className="text-slate-600 group-hover:text-orange-600 transition-colors duration-300">Satisfacción del Cliente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4 hover:text-blue-600 transition-colors duration-300">
            ¿Por qué elegir PsiConnect?
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ofrecemos las herramientas más avanzadas para facilitar la conexión 
            entre profesionales de la salud mental y sus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Shield className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">Seguridad Garantizada</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 text-center group-hover:text-slate-700 transition-colors duration-300">
                Cumplimos con los más altos estándares de seguridad y privacidad 
                para proteger la información sensible de pacientes y profesionales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Users className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors duration-300">Gestión de Pacientes</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 text-center group-hover:text-slate-700 transition-colors duration-300">
                Sistema completo para administrar historiales, citas y seguimiento 
                de pacientes de manera eficiente y organizada.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <MessageCircle className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl group-hover:text-purple-600 transition-colors duration-300">Comunicación Segura</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 text-center group-hover:text-slate-700 transition-colors duration-300">
                Mensajería cifrada y llamadas seguras para mantener la confidencialidad 
                en todas las comunicaciones profesionales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Calendar className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300">Agenda Inteligente</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 text-center group-hover:text-slate-700 transition-colors duration-300">
                Programación automática de citas, recordatorios y gestión 
                optimizada del tiempo para maximizar la productividad.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Star className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl group-hover:text-pink-600 transition-colors duration-300">Interfaz Intuitiva</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 text-center group-hover:text-slate-700 transition-colors duration-300">
                Diseño moderno y fácil de usar que permite enfocarse en lo importante: 
                el bienestar de los pacientes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Heart className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors duration-300">Soporte 24/7</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 text-center group-hover:text-slate-700 transition-colors duration-300">
                Equipo de soporte especializado disponible en todo momento 
                para resolver cualquier duda o inconveniente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gradient-to-br from-slate-100 to-blue-50 py-20 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl animate-bounce"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4 hover:text-blue-600 transition-colors duration-300">
              ¿Cómo funciona PsiConnect?
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simplificamos el proceso para que puedas enfocarte en lo que realmente importa: 
              brindar la mejor atención a tus pacientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:scale-105 transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:shadow-xl">
                <span className="text-2xl font-bold text-white group-hover:animate-pulse">1</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">Regístrate</h4>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Crea tu perfil profesional en minutos. Verifica tu identidad y 
                comienza a configurar tu espacio de trabajo digital.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-all duration-500" style={{animationDelay: '0.1s'}}>
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:shadow-xl">
                <span className="text-2xl font-bold text-white group-hover:animate-pulse">2</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors duration-300">Conecta</h4>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Los pacientes pueden encontrarte y agendar citas según tu disponibilidad. 
                Recibe notificaciones y confirma automáticamente.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-all duration-500" style={{animationDelay: '0.2s'}}>
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:shadow-xl">
                <span className="text-2xl font-bold text-white group-hover:animate-pulse">3</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">Atiende</h4>
              <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                Utiliza nuestras herramientas integradas para realizar sesiones, 
                llevar registros y dar seguimiento a tus pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            Lo que dicen nuestros usuarios
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Miles de profesionales ya confían en PsiConnect para mejorar 
            su práctica y brindar mejor atención a sus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Dra. Ana García"
                  className="w-12 h-12 rounded-full mr-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <h5 className="font-semibold text-slate-800">Dra. Ana García</h5>
                  <p className="text-sm text-slate-600">Psicóloga Clínica</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current hover:scale-125 transition-transform duration-200" />
                ))}
              </div>
              <p className="text-slate-600">
                "PsiConnect ha transformado completamente mi práctica. La gestión de pacientes 
                es mucho más eficiente y mis pacientes están más satisfechos."
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Dr. Carlos Mendoza"
                  className="w-12 h-12 rounded-full mr-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <h5 className="font-semibold text-slate-800">Dr. Carlos Mendoza</h5>
                  <p className="text-sm text-slate-600">Psicoterapeuta</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current hover:scale-125 transition-transform duration-200" />
                ))}
              </div>
              <p className="text-slate-600">
                "La seguridad y privacidad que ofrece PsiConnect me da total tranquilidad. 
                Mis pacientes confían plenamente en la plataforma."
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Dra. María López"
                  className="w-12 h-12 rounded-full mr-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <h5 className="font-semibold text-slate-800">Dra. María López</h5>
                  <p className="text-sm text-slate-600">Psicóloga Infantil</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current hover:scale-125 transition-transform duration-200" />
                ))}
              </div>
              <p className="text-slate-600">
                "Las herramientas de comunicación son excelentes. Puedo mantener contacto 
                seguro con las familias y dar seguimiento efectivo a mis pacientes."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-emerald-600/90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="group">
              <h3 className="text-4xl font-bold text-white mb-6 group-hover:scale-105 transition-transform duration-300">
                Beneficios únicos para profesionales
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-white group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Aumenta tu productividad</h4>
                    <p className="text-blue-100">
                      Automatiza tareas administrativas y enfócate en lo que sabes hacer mejor: ayudar a tus pacientes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <TrendingUp className="w-5 h-5 text-white group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Expande tu alcance</h4>
                    <p className="text-blue-100">
                      Conecta con pacientes de toda tu región y ofrece consultas presenciales o virtuales.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Award className="w-5 h-5 text-white group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Mejora la calidad de atención</h4>
                    <p className="text-blue-100">
                      Herramientas avanzadas para seguimiento, análisis y personalización del tratamiento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Profesional usando PsiConnect"
                className="rounded-2xl shadow-2xl group-hover:scale-105 group-hover:shadow-3xl transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl group-hover:from-black/10 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4 hover:text-blue-600 transition-colors duration-300">
            Planes diseñados para tu crecimiento
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu práctica profesional. 
            Todos incluyen soporte 24/7 y actualizaciones gratuitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2 group-hover:text-blue-600 transition-colors duration-300">Básico</CardTitle>
              <div className="text-4xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">$49</div>
              <div className="text-slate-600">/mes</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Hasta 50 pacientes</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.1s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Agenda básica</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.2s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Mensajería segura</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.3s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Soporte por email</span>
                </li>
              </ul>
              <Button className="w-full hover:scale-105 transition-all duration-300" variant="outline">
                Empezar Prueba Gratuita
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 shadow-lg hover:shadow-2xl transition-all duration-500 relative group hover:scale-105 hover:-translate-y-4 bg-gradient-to-br from-white to-blue-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                Más Popular
              </span>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2 group-hover:text-blue-600 transition-colors duration-300">Profesional</CardTitle>
              <div className="text-4xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">$99</div>
              <div className="text-slate-600">/mes</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Pacientes ilimitados</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.1s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Agenda avanzada</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.2s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Videollamadas HD</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.3s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Reportes y analytics</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.4s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-all duration-300 group-hover:shadow-xl">
                Empezar Prueba Gratuita
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:scale-105 hover:-translate-y-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2 group-hover:text-purple-600 transition-colors duration-300">Empresa</CardTitle>
              <div className="text-4xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">$199</div>
              <div className="text-slate-600">/mes</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Equipos ilimitados</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.1s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>API personalizada</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.2s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Integraciones avanzadas</span>
                </li>
                <li className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: '0.3s'}}>
                  <CheckCircle className="w-5 h-5 text-green-500 group-hover:scale-125 transition-transform duration-200" />
                  <span>Soporte dedicado</span>
                </li>
              </ul>
              <Button className="w-full hover:scale-105 transition-all duration-300" variant="outline">
                Contactar Ventas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/90 to-emerald-600/90"></div>
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h3 className="text-4xl font-bold text-white mb-6 hover:scale-105 transition-transform duration-300">
            ¿Listo para revolucionar tu práctica?
          </h3>
          <p className="text-xl text-blue-100 mb-8 hover:text-white transition-colors duration-300">
            Únete a cientos de profesionales que ya confían en PsiConnect 
            para brindar la mejor atención a sus pacientes.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-110 px-8 py-3 text-lg font-semibold hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <span className="relative z-10">Comenzar Prueba Gratuita</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="flex items-center gap-3 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Heart className="w-5 h-5 text-white group-hover:animate-pulse" />
                </div>
                <h4 className="text-xl font-bold group-hover:text-blue-400 transition-colors duration-300">PsiConnect</h4>
              </div>
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                Conectando profesionales de la salud mental con sus pacientes.
              </p>
            </div>

            <div className="group">
              <h5 className="font-semibold mb-4 group-hover:text-blue-400 transition-colors duration-300">Producto</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Características</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Precios</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Seguridad</a></li>
              </ul>
            </div>

            <div className="group">
              <h5 className="font-semibold mb-4 group-hover:text-emerald-400 transition-colors duration-300">Soporte</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Contacto</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Estado del Sistema</a></li>
              </ul>
            </div>

            <div className="group">
              <h5 className="font-semibold mb-4 group-hover:text-purple-400 transition-colors duration-300">Legal</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Privacidad</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Términos</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 hover:text-slate-300 transition-colors duration-300">
            <p>&copy; 2024 PsiConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
