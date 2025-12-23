import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, Clock, Users, Zap, Heart, Stethoscope, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const IntroPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getParallaxTransform = (elementRef: React.RefObject<HTMLDivElement>, intensity: number = 0.1) => {
    if (!elementRef.current) return { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' };
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (mousePosition.x - centerX) * intensity;
    const deltaY = (mousePosition.y - centerY) * intensity;
    
    const rotateY = deltaX / 10;
    const rotateX = -deltaY / 10;
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
      transition: 'transform 0.1s ease-out',
    };
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Blue particles */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-blue-petrol/40 rounded-full animate-float-1"></div>
        <div className="absolute top-40 left-1/4 w-4 h-4 bg-blue-soft/50 rounded-full animate-float-2"></div>
        <div className="absolute top-60 left-1/3 w-2 h-2 bg-blue-petrol/30 rounded-full animate-float-3"></div>
        <div className="absolute top-80 left-1/2 w-5 h-5 bg-blue-soft/40 rounded-full animate-float-4"></div>
        <div className="absolute top-32 right-20 w-3 h-3 bg-blue-petrol/35 rounded-full animate-float-5"></div>
        <div className="absolute top-52 right-1/4 w-4 h-4 bg-blue-soft/45 rounded-full animate-float-6"></div>
        <div className="absolute top-72 right-1/3 w-2 h-2 bg-blue-petrol/40 rounded-full animate-float-1"></div>
        
        {/* Emerald/Green particles */}
        <div className="absolute top-28 left-1/5 w-4 h-4 bg-emerald-400/40 rounded-full animate-float-2"></div>
        <div className="absolute top-48 left-2/5 w-3 h-3 bg-emerald-500/35 rounded-full animate-float-3"></div>
        <div className="absolute top-68 left-3/5 w-5 h-5 bg-emerald-400/30 rounded-full animate-float-4"></div>
        <div className="absolute top-88 left-4/5 w-2 h-2 bg-emerald-500/40 rounded-full animate-float-5"></div>
        <div className="absolute top-36 right-1/5 w-3 h-3 bg-emerald-400/45 rounded-full animate-float-6"></div>
        <div className="absolute top-56 right-2/5 w-4 h-4 bg-emerald-500/35 rounded-full animate-float-1"></div>
        <div className="absolute top-76 right-3/5 w-2 h-2 bg-emerald-400/40 rounded-full animate-float-2"></div>
        
        {/* Lavender/Purple particles */}
        <div className="absolute top-24 left-1/6 w-3 h-3 bg-lavender-soft/40 rounded-full animate-float-3"></div>
        <div className="absolute top-44 left-2/6 w-5 h-5 bg-lavender-soft/30 rounded-full animate-float-4"></div>
        <div className="absolute top-64 left-3/6 w-2 h-2 bg-lavender-soft/45 rounded-full animate-float-5"></div>
        <div className="absolute top-84 left-4/6 w-4 h-4 bg-lavender-soft/35 rounded-full animate-float-6"></div>
        <div className="absolute top-32 right-1/6 w-3 h-3 bg-lavender-soft/40 rounded-full animate-float-1"></div>
        <div className="absolute top-52 right-2/6 w-2 h-2 bg-lavender-soft/50 rounded-full animate-float-2"></div>
        <div className="absolute top-72 right-3/6 w-4 h-4 bg-lavender-soft/35 rounded-full animate-float-3"></div>
        
        {/* Larger floating shapes */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-petrol/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl animate-float-slow-delayed"></div>
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-lavender-soft/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-22 h-22 bg-blue-soft/10 rounded-full blur-xl animate-float-slow-delayed"></div>
      </div>

      {/* Header */}
      <header className="bg-white-warm border-b-4 border-blue-petrol/20 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 bg-gradient-to-r from-blue-soft via-green-mint to-peach-pale"
              >
                <Heart className="w-6 h-6 text-white group-hover:animate-pulse" />
              </div>
              <h1 
                className="text-2xl font-bold bg-gradient-to-r from-blue-soft via-green-mint via-peach-pale to-blue-soft bg-clip-text text-transparent animate-text-shine"
                style={{
                  backgroundSize: '200% auto'
                }}
              >
                ProConnection
              </h1>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" className="hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Volver al inicio</span>
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="hover:scale-105 transition-all duration-300">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border-2 border-emerald-300 rounded-full px-6 py-2 mb-6">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-emerald-700">7 DÍAS GRATIS - Sin tarjeta de crédito</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif-display font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-soft via-green-mint via-peach-pale to-blue-soft bg-clip-text text-transparent animate-text-shine" style={{ backgroundSize: '200% auto' }}>
              Bienvenido a ProConnection
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            La plataforma todo-en-uno para profesionales de la salud mental. 
            Gestiona tu práctica, conecta con pacientes y haz crecer tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button 
                size="lg"
                className="bg-blue-petrol text-white-warm border-4 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 font-sans-geometric font-bold text-lg px-8 py-6 rounded-lg flex items-center gap-3"
              >
                <span>Crear mi cuenta gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/plans">
              <Button 
                size="lg"
                variant="outline"
                className="border-4 border-blue-petrol/30 hover:border-blue-petrol hover:bg-blue-petrol/5 font-sans-geometric font-bold text-lg px-8 py-6 rounded-lg transition-all duration-200"
              >
                Ver planes
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16 relative z-10">
          <div 
            ref={card1Ref}
            className="bg-white-warm border-4 border-blue-petrol/20 rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(62,95,120,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)] transition-all duration-300"
            style={getParallaxTransform(card1Ref, 0.15)}
          >
            <div className="w-16 h-16 bg-blue-petrol/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-petrol" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-blue-petrol mb-4">
              Gestión de Pacientes
            </h3>
            <p className="font-sans-geometric text-slate-600 leading-relaxed">
              Organiza toda la información de tus pacientes en un solo lugar. Historiales, notas, citas y más.
            </p>
          </div>

          <div 
            ref={card2Ref}
            className="bg-white-warm border-4 border-emerald-200 rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(16,185,129,0.15)] transition-all duration-300"
            style={getParallaxTransform(card2Ref, 0.2)}
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-blue-petrol mb-4">
              Automatización Inteligente
            </h3>
            <p className="font-sans-geometric text-slate-600 leading-relaxed">
              Reduce el trabajo administrativo con recordatorios automáticos, facturación y reportes.
            </p>
          </div>

          <div 
            ref={card3Ref}
            className="bg-white-warm border-4 border-lavender-soft/50 rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(201,194,230,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(201,194,230,0.15)] transition-all duration-300"
            style={getParallaxTransform(card3Ref, 0.18)}
          >
            <div className="w-16 h-16 bg-lavender-soft/30 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-blue-petrol" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-blue-petrol mb-4">
              Seguridad Total
            </h3>
            <p className="font-sans-geometric text-slate-600 leading-relaxed">
              Cumplimiento HIPAA, encriptación end-to-end y respaldos automáticos para tu tranquilidad.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div 
          ref={benefitsRef}
          className="max-w-4xl mx-auto bg-white-warm border-4 border-blue-petrol/20 rounded-2xl p-12 shadow-[12px_12px_0px_0px_rgba(62,95,120,0.15)] mb-16 relative z-10"
          style={getParallaxTransform(benefitsRef, 0.1)}
        >
          <h2 className="font-serif-display text-4xl font-bold text-blue-petrol text-center mb-8">
            ¿Por qué elegir ProConnection?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-sans-geometric font-bold text-lg text-blue-petrol mb-2">
                  Sin compromisos
                </h4>
                <p className="font-sans-geometric text-slate-600">
                  Cancela en cualquier momento. Sin permanencia ni penalizaciones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-sans-geometric font-bold text-lg text-blue-petrol mb-2">
                  Soporte prioritario
                </h4>
                <p className="font-sans-geometric text-slate-600">
                  Equipo de soporte disponible para ayudarte cuando lo necesites.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-sans-geometric font-bold text-lg text-blue-petrol mb-2">
                  Actualizaciones constantes
                </h4>
                <p className="font-sans-geometric text-slate-600">
                  Nuevas funcionalidades agregadas regularmente sin costo adicional.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-sans-geometric font-bold text-lg text-blue-petrol mb-2">
                  Fácil de usar
                </h4>
                <p className="font-sans-geometric text-slate-600">
                  Interfaz intuitiva diseñada para profesionales ocupados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div 
          ref={ctaRef}
          className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-petrol to-emerald-600 rounded-2xl p-12 shadow-[12px_12px_0px_0px_rgba(62,95,120,0.2)] relative z-10"
          style={getParallaxTransform(ctaRef, 0.12)}
        >
          <h2 className="font-serif-display text-4xl font-bold text-white-warm mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="font-sans-geometric text-xl text-white-warm/90 mb-8">
            Únete a cientos de profesionales que ya están transformando su práctica con ProConnection
          </p>
          <Link to="/register">
            <Button 
              size="lg"
              className="bg-white-warm text-blue-petrol border-4 border-white-warm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 font-sans-geometric font-bold text-lg px-8 py-6 rounded-lg flex items-center gap-3 mx-auto"
            >
              <span>Crear cuenta gratis ahora</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="font-sans-geometric text-sm text-white-warm/80 mt-4">
            ✓ 7 días gratis • ✓ Sin tarjeta de crédito • ✓ Cancela cuando quieras
          </p>
        </div>
      </section>
    </div>
  );
};

