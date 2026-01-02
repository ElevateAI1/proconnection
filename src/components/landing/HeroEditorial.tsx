import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, Check } from 'lucide-react';
import { InteractiveDashboard } from './InteractiveDashboard';

export const HeroEditorial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white-warm via-gray-light to-white-warm"
      style={{ background: 'linear-gradient(180deg, #FDFDFB 0%, #E8EAED 50%, #FDFDFB 100%)' }}
    >
      {/* Background Renaissance-Futuristic Painting Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23E6DCC5;stop-opacity:0.1" /%3E%3Cstop offset="100%25" style="stop-color:%23C9C2E6;stop-opacity:0.05" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23grad)"/%3E%3C/svg%3E')`,
            backgroundSize: '200px 200px',
          }}
        />
        {/* Floating abstract shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-lavender-soft/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-soft/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-green-mint/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Parallax layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Decorative elements at different parallax speeds */}
        <div 
          className="absolute top-32 left-16 w-32 h-32 border-2 border-sand-light/30 rounded-full"
          style={{ transform: 'translateY(0px)' }}
        />
        <div 
          className="absolute bottom-32 right-16 w-24 h-24 border-2 border-lavender-soft/30 rounded-full"
          style={{ transform: 'translateY(0px)' }}
        />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 items-center">
          {/* Left: Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-card-enter' : 'opacity-0'}`}>
            {/* Title - Serif Display */}
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] text-blue-petrol">
              <span className="block">Dejá de perder</span>
              <span className="block bg-gradient-to-r from-blue-soft via-green-mint to-peach-pale bg-clip-text text-transparent">
                10 horas por semana
              </span>
              <span className="block">con Excel y WhatsApp</span>
            </h1>

            {/* Subtitle - Sans Geometric */}
            <p className="font-sans-geometric text-xl sm:text-2xl text-blue-petrol/80 leading-relaxed max-w-2xl">
              La única plataforma que automatiza tu agenda, pagos y contabilidad AFIP.
              <span className="block mt-2 font-semibold text-blue-petrol">
                Más tiempo para tus pacientes (o para vos).
              </span>
            </p>

            {/* Benefits bullets */}
            <ul className="space-y-3 font-sans-geometric text-lg text-blue-petrol/80">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-mint/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-petrol" />
                </div>
                <span>Agenda automática con confirmaciones instantáneas</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-soft/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-petrol" />
                </div>
                <span>Pagos automatizados antes de cada sesión</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-peach-pale/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-petrol" />
                </div>
                <span>Reportes AFIP listos para exportar</span>
              </li>
            </ul>

            {/* Trust badges - Neo-brutalist style */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-4 py-2 bg-white-warm border-2 border-blue-petrol/30 shadow-[4px_4px_0px_0px_rgba(62,95,120,0.2)]">
                <span className="font-sans-geometric font-bold text-sm text-blue-petrol">500+ psicólogos</span>
              </div>
              <div className="px-4 py-2 bg-sand-light/50 border-2 border-sand-light shadow-[4px_4px_0px_0px_rgba(230,220,197,0.3)]">
                <span className="font-sans-geometric font-bold text-sm text-blue-petrol">4.9/5 ⭐</span>
              </div>
              <div className="px-4 py-2 bg-green-mint/30 border-2 border-green-mint shadow-[4px_4px_0px_0px_rgba(185,228,201,0.3)]">
                <span className="font-sans-geometric font-bold text-sm text-blue-petrol">Garantía 30 días</span>
              </div>
            </div>

            {/* CTAs - Brutalist buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto font-sans-geometric text-lg px-8 py-6 bg-blue-petrol text-white-warm border-2 border-blue-petrol shadow-[8px_8px_0px_0px_rgba(108,175,240,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(108,175,240,0.4)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                >
                  Probá gratis 14 días
                </Button>
              </Link>
              <Link to="/demo">
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto font-sans-geometric text-lg px-8 py-6 border-2 border-blue-petrol/50 bg-white-warm text-blue-petrol shadow-[8px_8px_0px_0px_rgba(62,95,120,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(62,95,120,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver demo (60 seg)
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Interactive Dashboard */}
          <div className={`relative ${isVisible ? 'animate-card-enter' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <div className="relative" style={{ perspective: '1000px' }}>
              {/* Floating 3D Dashboard */}
              <div className="relative transform hover:rotate-y-6 transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
                <InteractiveDashboard />
              </div>

              {/* Glow effects */}
              <div className="absolute inset-0 bg-lavender-soft/20 rounded-2xl blur-3xl -z-10 animate-pulse" />
              <div className="absolute inset-0 bg-blue-soft/20 rounded-2xl blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Particle dust effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sand-light/40 rounded-full animate-particle-dust"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
};

