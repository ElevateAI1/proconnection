# PsiConnect - Sistema de Gestión para Psicólogos

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

Sistema integral de gestión para psicólogos que permite administrar consultorios de manera profesional. Incluye portales diferenciados para psicólogos y pacientes, con funcionalidades completas de gestión, comunicación y administración contable.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Prerrequisitos](#-prerrequisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Guía de Desarrollo](#-guía-de-desarrollo)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### Para Psicólogos
- ✅ Gestión completa de pacientes y expedientes
- ✅ Calendario integrado con sistema de citas
- ✅ Comunicación segura con pacientes (mensajería en tiempo real)
- ✅ Reportes contables automatizados
- ✅ Herramientas de visibilidad online (SEO)
- ✅ Sistema de videollamadas integrado (Jitsi Meet)
- ✅ OCR automático para comprobantes de pago
- ✅ Sistema de afiliados con comisiones

### Para Pacientes
- ✅ Solicitud de citas de manera simple
- ✅ Comunicación directa con su psicólogo
- ✅ Acceso a historial de sesiones
- ✅ Subir comprobantes de pago

### Administración
- ✅ Dashboard administrativo completo
- ✅ Gestión de usuarios y suscripciones
- ✅ Control del sistema de afiliados
- ✅ Métricas y analytics del negocio

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes UI
- **TanStack Query** - Data fetching y cache
- **React Router DOM** - Navegación
- **Lucide React** - Iconografía
- **Recharts** - Gráficos y visualizaciones

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Storage - Almacenamiento de archivos
  - Edge Functions - Funciones serverless
  - Real-time - Subscripciones en tiempo real
- **Row Level Security (RLS)** - Seguridad a nivel de fila

### Integraciones Externas
- **OpenAI GPT-4o** - OCR de comprobantes
- **MercadoPago** - Procesamiento de pagos
- **Jitsi Meet** - Videollamadas
- **Resend** - Envío de emails
- **N8N** - Workflows automatizados (opcional)

## 📦 Prerrequisitos

- **Node.js** 18.0.0 o superior
- **npm** 8.0.0 o superior (o yarn/pnpm)
- **Cuenta de Supabase** - [Crear cuenta](https://supabase.com/)
- **Cuenta de OpenAI** - Para OCR (opcional)
- **Cuenta de MercadoPago** - Para pagos (opcional)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd psi-connect-chat-57
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales (ver sección [Configuración](#-configuración))

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:8080`

## ⚙️ Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase
VITE_SUPABASE_URL=https://ehkbqmiasdyuxreqrijw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoa2JxbWlhc2R5dXhyZXFyaWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODcyMDAsImV4cCI6MjA4MTA2MzIwMH0.Q0V-sBPJQ8Hr5CBuK98xbnOkQhaO8B2p3y2hdHMHj1A

# OpenAI (para OCR)
VITE_OPENAI_API_KEY=sk-...

# MercadoPago (opcional)
VITE_MERCADOPAGO_PUBLIC_KEY=...

# Resend (para emails)
VITE_RESEND_API_KEY=...

# N8N Webhook (opcional)
VITE_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/...
```

### Configuración de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com/)
2. Ejecutar las migraciones en `supabase/migrations/`
3. Configurar Row Level Security (RLS) policies
4. Configurar Storage buckets:
   - `payment-proofs` - Para comprobantes de pago
   - `documents` - Para documentos de pacientes

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (puerto 8080)

# Build
npm run build           # Build de producción
npm run build:dev       # Build de desarrollo
npm run preview         # Preview del build de producción

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Ejecutar tests en modo watch
npm run test:ui         # Ejecutar tests con UI interactiva
npm run test:coverage   # Ejecutar tests con coverage

# Linting
npm run lint            # Ejecutar ESLint
```

## 📁 Estructura del Proyecto

```
psi-connect-chat-57/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── forms/         # Formularios
│   │   └── visibility/    # Módulos de visibilidad
│   ├── hooks/             # Custom hooks
│   │   └── __tests__/     # Tests de hooks
│   ├── pages/             # Páginas principales
│   ├── integrations/      # Configuración de integraciones
│   │   └── supabase/      # Cliente y tipos de Supabase
│   ├── utils/             # Utilidades generales
│   ├── contexts/          # React contexts
│   ├── lib/               # Librerías y helpers
│   └── test/              # Configuración de tests
├── supabase/
│   ├── functions/         # Edge Functions
│   └── migrations/        # Migraciones de base de datos
├── docs/                  # Documentación
├── vitest.config.ts       # Configuración de Vitest
├── vite.config.ts         # Configuración de Vite
├── tailwind.config.ts     # Configuración de Tailwind
└── package.json           # Dependencias y scripts
```

## 💻 Guía de Desarrollo

### Convenciones de Código

- **Componentes**: PascalCase (ej: `AppointmentCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useProfile.tsx`)
- **Utilidades**: camelCase (ej: `phoneValidation.ts`)
- **Constantes**: SCREAMING_SNAKE_CASE
- **Base de datos**: snake_case

### Patrones de Código

```typescript
// Usar formato objeto en useQuery
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
});

// Manejo de fechas en zona local
const [year, month, day] = dateString.split('-');
const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

// Componentes pequeños y enfocados (máximo 200 líneas)
export const ComponentName = ({ prop }: Props) => {
  // Una responsabilidad por componente
};
```

### Debugging

El proyecto usa console.log extensivo para debugging. Buscar logs con formato:
```typescript
console.log('=== FUNCTION_NAME ===');
console.log('Input:', input);
console.log('Result:', result);
```

## 🧪 Testing

El proyecto usa **Vitest** como framework de testing.

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Modo watch (desarrollo)
npm run test:watch

# Con UI interactiva
npm run test:ui

# Con coverage
npm run test:coverage
```

### Escribir Tests

Los tests se encuentran en `src/hooks/__tests__/` y siguen el patrón:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should initialize with null user', () => {
    // Test implementation
  });
});
```

### Cobertura Mínima

- Líneas: 50%
- Funciones: 50%
- Branches: 50%
- Statements: 50%

## 🚢 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Otros Proveedores

El proyecto puede desplegarse en cualquier plataforma que soporte Node.js:
- Netlify
- AWS Amplify
- Railway
- Render

### Build de Producción

```bash
npm run build
```

Los archivos se generan en `dist/` y están listos para deployment.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Contribución

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 📞 Soporte

Para soporte, por favor:
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

## 🔗 Enlaces Útiles

- [Documentación Completa](./docs/project-knowledge-complete.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Desarrollado con ❤️ para psicólogos profesionales**
