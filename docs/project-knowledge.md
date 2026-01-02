
# Conocimiento del Proyecto - Sistema de Gestión Psicológica

## Visión General del Proyecto

Este es un sistema completo de gestión para psicólogos que incluye:
- Portal del psicólogo con dashboard, gestión de pacientes, calendario y mensajería
- Portal del paciente para solicitar citas y comunicarse
- Sistema de afiliados para referidos
- Integración con Supabase para backend y autenticación

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Estado**: React hooks + TanStack Query para data fetching
- **Iconos**: Lucide React
- **Gráficos**: Recharts

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
├── hooks/              # Hooks personalizados
├── pages/              # Páginas principales
├── integrations/       # Integraciones externas (Supabase)
└── lib/                # Utilidades
```

## Reglas de Desarrollo

### Convenciones de Nomenclatura
- **Componentes**: PascalCase (ej: `PatientPortal.tsx`)
- **Hooks**: camelCase con prefijo "use" (ej: `useProfile.tsx`)
- **Archivos de utilidades**: camelCase (ej: `dateUtils.ts`)
- **Variables y funciones**: camelCase
- **Constantes**: SCREAMING_SNAKE_CASE

### Estructura de Componentes
```typescript
// Importaciones en orden:
// 1. React/hooks
// 2. Librerías externas
// 3. Componentes internos
// 4. Hooks personalizados
// 5. Tipos/interfaces
// 6. Utilidades

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CustomComponent } from "@/components/CustomComponent";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
```

### Manejo de Estado
- Usar `useState` para estado local del componente
- Usar `useEffect` para efectos secundarios
- Usar TanStack Query para data fetching con formato de objeto:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
});
```

### Manejo de Fechas y Horarios
- **CRÍTICO**: Siempre manejar fechas en zona horaria local
- Para fechas de citas, usar formato YYYY-MM-DD sin conversión UTC
- Crear fechas directamente con componentes de fecha:
```typescript
const [year, month, day] = dateString.split('-');
const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
```

## Patrones de Diseño

### Responsive Design
- Mobile-first approach con Tailwind CSS
- Usar clases responsive: `sm:`, `md:`, `lg:`, `xl:`
- Asegurar que todos los componentes funcionen en móvil

### Loading States
```typescript
if (loading) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600">Cargando...</p>
    </div>
  );
}
```

### Error Handling
- Usar toast notifications para feedback al usuario
- Mostrar mensajes de error amigables
- Incluir logs de consola para debugging

### Autenticación
- Verificar siempre auth.uid() en políticas RLS
- Usar `useProfile` hook para datos del usuario
- Manejar estados de loading correctamente

## Base de Datos (Supabase)

### Convenciones de Tablas
- Nombres en inglés, snake_case
- Siempre incluir `id`, `created_at`, `updated_at`
- Usar UUID para primary keys
- Implementar RLS en todas las tablas sensibles

### Políticas RLS
- Una política por operación (SELECT, INSERT, UPDATE, DELETE)
- Usar `auth.uid()` para filtrar por usuario
- Nombrar políticas descriptivamente:
```sql
CREATE POLICY "Users can view their own appointments" 
  ON appointments FOR SELECT 
  USING (patient_id = auth.uid() OR psychologist_id = auth.uid());
```

### Tipos de Usuario
- `psychologist`: Profesionales con acceso completo
- `patient`: Pacientes con acceso limitado
- Usar enum para `user_type` en profiles

## Componentes Específicos del Dominio

### Gestión de Citas
- Estados: `pending`, `scheduled`, `confirmed`, `completed`, `cancelled`
- Siempre incluir duración en minutos (default: 60)
- Manejar cancelaciones con razón y timestamp

### Tipos de Terapia
```typescript
type TherapyType = 'individual' | 'couple' | 'family' | 'evaluation' | 'follow_up';
```

### Horarios Disponibles
- Slots de 30 minutos desde 08:00 hasta 19:30
- Verificar disponibilidad antes de crear citas
- Manejar zona horaria local consistentemente

## UI/UX Guidelines

### Colores del Sistema
- Primary: Blue-500 a Emerald-500 (gradientes)
- Secondary: Slate colors
- Success: Emerald/Green
- Error: Red
- Warning: Yellow/Orange

### Espaciado Consistente
- Usar clases de Tailwind: `p-4`, `p-6`, `p-8`
- Espaciado entre componentes: `space-y-4`, `space-y-6`
- Márgenes consistentes en cards y modales

### Iconografía
- Usar Lucide React para todos los iconos
- Tamaño estándar: `w-4 h-4` para inline, `w-5 h-5` para botones
- Íconos temáticos: Calendar, Clock, User, MessageCircle, etc.

## Mejores Prácticas

### Performance
- Lazy loading para componentes grandes
- Memoización con `useMemo` y `useCallback` cuando sea necesario
- Optimizar re-renders innecesarios

### Accesibilidad
- Usar labels apropiados en formularios
- Contraste de colores adecuado
- Navegación con teclado funcional

### Seguridad
- Validar todos los inputs del usuario
- Usar RLS en todas las operaciones de base de datos
- No exponer IDs sensibles en URLs públicas

### Testing
- Incluir console.logs para debugging
- Validar estados de loading y error
- Probar flujos de autenticación completos

## Flujos Principales

### Registro y Autenticación
1. Usuario se registra como psicólogo o paciente
2. Sistema crea perfil en tabla correspondiente
3. Redirige al dashboard apropiado

### Solicitud de Citas (Paciente)
1. Paciente selecciona fecha y hora preferida
2. Sistema verifica disponibilidad
3. Crea solicitud pendiente
4. Psicólogo aprueba/rechaza
5. Se crea cita confirmada si se aprueba

### Gestión de Pacientes (Psicólogo)
1. Psicólogo puede ver lista de pacientes asignados
2. Acceso a historial de citas y documentos
3. Capacidad de crear nuevas citas directamente

## Debugging y Logging

### Console Logs Útiles
```typescript
console.log('=== FUNCTION_NAME ===');
console.log('Input data:', inputData);
console.log('Result:', result);
console.log('Error details:', error);
```

### Puntos de Debug Comunes
- Auth state changes
- Data fetching operations
- Date/time conversions
- Form submissions
- Database operations

## Limitaciones y Consideraciones

### Zona Horaria
- Todo el sistema asume zona horaria local del usuario
- No hay soporte para múltiples zonas horarias
- Las fechas se manejan sin conversión UTC

### Escalabilidad
- Diseñado para psicólogos individuales
- Límites de trial de 7 días
- Sistema de afiliados básico

### Integraciones Futuras
- Pagos con MercadoPago
- Videollamadas con Jitsi Meet
- Notificaciones por email
