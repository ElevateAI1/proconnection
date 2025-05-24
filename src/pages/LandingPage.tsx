
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, MessageCircle, Calendar, Star, CheckCircle, Award, TrendingUp, Clock, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              PsiConnect
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to="/app">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link to="/app">
              <Button className="bg-gradient-to-r from-blue-500 to-emerald-500">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-800 mb-6">
            Conecta con la
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {" "}salud mental{" "}
            </span>
            del futuro
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            PsiConnect es la plataforma integral que une a psicólogos y pacientes 
            en un entorno seguro, profesional y tecnológicamente avanzado.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <Link to="/app">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-emerald-500 px-8 py-3 text-lg">
                Empezar Gratis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Ver Demo
            </Button>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Profesional de la salud mental usando PsiConnect"
              className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-slate-600">Psicólogos Registrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">10,000+</div>
              <div className="text-slate-600">Pacientes Atendidos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50,000+</div>
              <div className="text-slate-600">Sesiones Completadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-slate-600">Satisfacción del Cliente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            ¿Por qué elegir PsiConnect?
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ofrecemos las herramientas más avanzadas para facilitar la conexión 
            entre profesionales de la salud mental y sus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Seguridad Garantizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Cumplimos con los más altos estándares de seguridad y privacidad 
                para proteger la información sensible de pacientes y profesionales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Gestión de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Sistema completo para administrar historiales, citas y seguimiento 
                de pacientes de manera eficiente y organizada.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Comunicación Segura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Mensajería cifrada y llamadas seguras para mantener la confidencialidad 
                en todas las comunicaciones profesionales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Agenda Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Programación automática de citas, recordatorios y gestión 
                optimizada del tiempo para maximizar la productividad.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Interfaz Intuitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Diseño moderno y fácil de usar que permite enfocarse en lo importante: 
                el bienestar de los pacientes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Soporte 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Equipo de soporte especializado disponible en todo momento 
                para resolver cualquier duda o inconveniente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              ¿Cómo funciona PsiConnect?
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simplificamos el proceso para que puedas enfocarte en lo que realmente importa: 
              brindar la mejor atención a tus pacientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-4">Regístrate</h4>
              <p className="text-slate-600">
                Crea tu perfil profesional en minutos. Verifica tu identidad y 
                comienza a configurar tu espacio de trabajo digital.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-4">Conecta</h4>
              <p className="text-slate-600">
                Los pacientes pueden encontrarte y agendar citas según tu disponibilidad. 
                Recibe notificaciones y confirma automáticamente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-4">Atiende</h4>
              <p className="text-slate-600">
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
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Dra. Ana García"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h5 className="font-semibold text-slate-800">Dra. Ana García</h5>
                  <p className="text-sm text-slate-600">Psicóloga Clínica</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600">
                "PsiConnect ha transformado completamente mi práctica. La gestión de pacientes 
                es mucho más eficiente y mis pacientes están más satisfechos."
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Dr. Carlos Mendoza"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h5 className="font-semibold text-slate-800">Dr. Carlos Mendoza</h5>
                  <p className="text-sm text-slate-600">Psicoterapeuta</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600">
                "La seguridad y privacidad que ofrece PsiConnect me da total tranquilidad. 
                Mis pacientes confían plenamente en la plataforma."
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Dra. María López"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h5 className="font-semibold text-slate-800">Dra. María López</h5>
                  <p className="text-sm text-slate-600">Psicóloga Infantil</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
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
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-6">
                Beneficios únicos para profesionales
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Aumenta tu productividad</h4>
                    <p className="text-blue-100">
                      Automatiza tareas administrativas y enfócate en lo que sabes hacer mejor: ayudar a tus pacientes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Expande tu alcance</h4>
                    <p className="text-blue-100">
                      Conecta con pacientes de toda tu región y ofrece consultas presenciales o virtuales.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-5 h-5 text-white" />
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
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Profesional usando PsiConnect"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            Planes diseñados para tu crecimiento
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu práctica profesional. 
            Todos incluyen soporte 24/7 y actualizaciones gratuitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Básico</CardTitle>
              <div className="text-4xl font-bold text-slate-800">$49</div>
              <div className="text-slate-600">/mes</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Hasta 50 pacientes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Agenda básica</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Mensajería segura</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Soporte por email</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Empezar Prueba Gratuita
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 shadow-lg hover:shadow-xl transition-shadow relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Más Popular
              </span>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Profesional</CardTitle>
              <div className="text-4xl font-bold text-slate-800">$99</div>
              <div className="text-slate-600">/mes</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Pacientes ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Agenda avanzada</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Videollamadas HD</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Reportes y analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500">
                Empezar Prueba Gratuita
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Empresa</CardTitle>
              <div className="text-4xl font-bold text-slate-800">$199</div>
              <div className="text-slate-600">/mes</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Equipos ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>API personalizada</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Integraciones avanzadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Soporte dedicado</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contactar Ventas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-4xl font-bold text-white mb-6">
            ¿Listo para revolucionar tu práctica?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de profesionales que ya confían en PsiConnect 
            para brindar la mejor atención a sus pacientes.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">PsiConnect</h4>
              </div>
              <p className="text-slate-400">
                Conectando profesionales de la salud mental con sus pacientes.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Producto</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 PsiConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
