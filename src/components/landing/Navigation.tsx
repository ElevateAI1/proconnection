import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImprovedNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/80 backdrop-blur-md shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Funciones
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Precios
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection('comparison')}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Comparación
            </button>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex gap-4">
            <Link to="/auth">
              <Button 
                variant="outline" 
                className="hover:scale-105 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/intro">
              <Button 
                className="bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
              >
                Comenzar Ahora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-200">
            <nav className="flex flex-col gap-4 pt-4">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
              >
                Funciones
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
              >
                Precios
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
              >
                Testimonios
              </button>
              <button
                onClick={() => scrollToSection('comparison')}
                className="text-left text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
              >
                Comparación
              </button>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full hover:scale-105 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/intro" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    className="w-full bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                  >
                    Comenzar Ahora
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Componente para el hero mejorado
export const ImprovedHero = () => {
  return (
    <section className="pt-32 pb-20 text-center relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-200/30 rounded-full blur-xl animate-bounce" style={{
        animationDelay: '2s'
      }}></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 px-4">
          Dejá de perder
          <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            {" "}10 horas por semana{" "}
          </span>
          con Excel y WhatsApp
        </h2>
        
        <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed px-4">
          La única plataforma que automatiza tu agenda, pagos y contabilidad AFIP. 
          <span className="font-semibold text-slate-800">Más tiempo para tus pacientes (o para vos).</span>
        </p>
        
        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-slate-600 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <span className="font-medium">Sin tarjeta de crédito</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <span className="font-medium">Cancelá cuando quieras</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <span className="font-medium">Setup en 5 minutos</span>
          </div>
        </div>

        {/* Prueba social inmediata */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">A</div>
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">M</div>
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">C</div>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">L</div>
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">500+ psicólogos</span> ya ahorran 10h/semana
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
            <span className="text-sm text-slate-600 ml-1">4.9/5</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative group">
          <img 
            src="/lovable-uploads/befe2e15-db81-4d89-805b-b994227673d5.png" 
            alt="Dashboard de ProConnection mostrando agenda, pacientes y contabilidad automática" 
            loading="lazy"
            className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full transform group-hover:scale-105 transition-all duration-500 group-hover:shadow-3xl" 
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl group-hover:from-black/10 transition-all duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </section>
  );
};
