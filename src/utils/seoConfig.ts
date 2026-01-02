
export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
  image?: string;
  url?: string;
  type?: string;
}

export const defaultSeoConfig: SeoConfig = {
  title: "ProConnection - Plataforma de Gestión Psicológica Profesional",
  description: "Conecta con profesionales de la salud mental. ProConnection es la plataforma integral que une a psicólogos y pacientes en un entorno seguro y tecnológicamente avanzado.",
  keywords: "psicólogo online, consulta psicológica, salud mental, terapia online, gestión psicológica, plataforma psicológica, psicólogos profesionales, terapia virtual",
  image: "/lovable-uploads/befe2e15-db81-4d89-805b-b994227673d5.png",
  type: "website"
};

export const pageSeoConfigs: Record<string, SeoConfig> = {
  landing: {
    title: "ProConnection - Conecta con la Salud Mental del Futuro",
    description: "Plataforma profesional para psicólogos y pacientes. Gestión de citas, historiales seguros, comunicación cifrada y herramientas avanzadas para la práctica psicológica.",
    keywords: "psicólogo online, plataforma psicológica, terapia online, consulta psicológica, salud mental digital, gestión de pacientes, citas psicológicas",
    type: "website"
  },
  demo: {
    title: "Demo ProConnection - Prueba Nuestra Plataforma Psicológica",
    description: "Descubre cómo ProConnection revoluciona la práctica psicológica. Prueba nuestras herramientas de gestión, comunicación segura y seguimiento de pacientes.",
    keywords: "demo plataforma psicológica, prueba gratis psicólogo, software psicológico, herramientas terapeutas",
    type: "website"
  },
  register: {
    title: "Registro Psicólogos - Únete a ProConnection",
    description: "Regístrate como psicólogo profesional en ProConnection. Accede a herramientas avanzadas para gestionar tu práctica y conectar con pacientes.",
    keywords: "registro psicólogo, plataforma psicólogos, software consulta psicológica, herramientas profesionales",
    type: "website"
  },
  auth: {
    title: "Iniciar Sesión - ProConnection",
    description: "Accede a tu cuenta profesional en ProConnection. Gestiona pacientes, citas y comunicación de forma segura.",
    keywords: "login psicólogo, acceso plataforma, sesión profesional",
    type: "website"
  }
};

export const getPageSeoConfig = (page: string): SeoConfig => {
  return { ...defaultSeoConfig, ...pageSeoConfigs[page] };
};

export const generateStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ProConnection",
    "description": "Plataforma integral para profesionales de la salud mental y sus pacientes",
    "url": window.location.origin,
    "logo": `${window.location.origin}/lovable-uploads/befe2e15-db81-4d89-805b-b994227673d5.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+54-911-4413-3576",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR"
    },
    "sameAs": []
  };
};
