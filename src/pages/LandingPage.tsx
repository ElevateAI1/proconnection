import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, MessageCircle, Calendar, Star, CheckCircle, Award, TrendingUp, Clock, Globe, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import { SeoHead } from "@/components/SeoHead";
import { getPageSeoConfig } from "@/utils/seoConfig";

// Importar los nuevos componentes editoriales neo-brutalistas
import { UrgencyBanner } from '@/components/landing/UrgencyBanner';
import { ImprovedNavigation } from '@/components/landing/Navigation';
import { HeroEditorial } from '@/components/landing/HeroEditorial';
import { FeaturesEditorial } from '@/components/landing/FeaturesEditorial';
import { ComparisonEditorial } from '@/components/landing/ComparisonEditorial';
import { TestimonialsEditorial } from '@/components/landing/TestimonialsEditorial';
import { PricingEditorial } from '@/components/landing/PricingEditorial';
import { CTAFinal } from '@/components/landing/CTAFinal';

export const LandingPage = () => {
  const seoConfig = getPageSeoConfig('landing');

  return (
    <>
      <SeoHead config={seoConfig} canonical={`${window.location.origin}/`} />
      
      {/* Navegación mejorada */}
      <ImprovedNavigation />
      
      {/* Banner de urgencia/escasez */}
      <UrgencyBanner variant="A" />
      
      {/* Hero editorial renacentista-futurista */}
      <HeroEditorial />
      
      {/* Features editoriales */}
      <FeaturesEditorial />
      
      {/* Comparación mundo viejo vs ProConnection */}
      <ComparisonEditorial />
      
      {/* Testimonios editoriales */}
      <TestimonialsEditorial />
      
      {/* Pricing brutalista */}
      <PricingEditorial />
      
      {/* CTA final oscuro */}
      <CTAFinal />

        {/* Footer - Minimalista oscuro con detalles dorados */}
        <footer className="bg-blue-petrol text-white-warm py-16 relative overflow-hidden">
          {/* Soft accent line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-sand-light to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 border-2 border-sand-light rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-sand-light" />
                  </div>
                  <h4 className="font-serif-display text-2xl font-bold text-white">ProConnection</h4>
                </div>
                <p className="font-sans-geometric text-white-warm/70 leading-relaxed">
                  Conectando profesionales de la salud mental con sus pacientes.
                </p>
              </div>

              <div>
                <h5 className="font-sans-geometric font-bold mb-4 text-white">Producto</h5>
                <ul className="space-y-3 font-sans-geometric text-white-warm/70">
                  <li><a href="#features" className="hover:text-sand-light transition-colors duration-200">Características</a></li>
                  <li><a href="#pricing" className="hover:text-sand-light transition-colors duration-200">Precios</a></li>
                  <li><a href="#testimonials" className="hover:text-sand-light transition-colors duration-200">Testimonios</a></li>
                  <li><a href="#comparison" className="hover:text-sand-light transition-colors duration-200">Comparación</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-sans-geometric font-bold mb-4 text-white">Soporte</h5>
                <ul className="space-y-3 font-sans-geometric text-white-warm/70">
                  <li><a href="#" className="hover:text-sand-light transition-colors duration-200">Centro de Ayuda</a></li>
                  <li><a href="#" className="hover:text-sand-light transition-colors duration-200">Contacto</a></li>
                  <li><a href="#" className="hover:text-sand-light transition-colors duration-200">Estado del Sistema</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-sans-geometric font-bold mb-4 text-white">Legal</h5>
                <ul className="space-y-3 font-sans-geometric text-white-warm/70">
                  <li><a href="#" className="hover:text-sand-light transition-colors duration-200">Privacidad</a></li>
                  <li><a href="#" className="hover:text-sand-light transition-colors duration-200">Términos</a></li>
                  <li><a href="#" className="hover:text-sand-light transition-colors duration-200">Cookies</a></li>
                </ul>
              </div>
            </div>

            {/* Divider con dorado */}
            <div className="border-t border-white-warm/20 mb-8"></div>
            
            <div className="text-center">
              <p className="font-sans-geometric text-white-warm/70">
                &copy; 2025 ProConnection. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
    </>
  );
};
