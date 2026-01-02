
# Guías de Codificación - Sistema de Gestión Psicológica

## Estilo de Código

### Formato General
- **Indentación**: 2 espacios
- **Comillas**: Dobles para strings ("texto")
- **Punto y coma**: Opcional (seguir configuración del proyecto)
- **Longitud de línea**: Máximo 100 caracteres

### TypeScript
- Usar tipos explícitos cuando sea necesario
- Definir interfaces para objetos complejos
- Usar enums para valores constantes

```typescript
// ✅ Bueno
interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
}

// ❌ Evitar
const patientData: any = { ... };
```

## Componentes React

### Estructura Estándar
```typescript
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

interface ComponentProps {
  onAction?: () => void;
  isLoading?: boolean;
}

export const ComponentName = ({ onAction, isLoading = false }: ComponentProps) => {
  const [localState, setLocalState] = useState<string>("");
  const { profile } = useProfile();

  useEffect(() => {
    // Efectos secundarios
  }, []);

  const handleAction = () => {
    // Lógica del componente
    onAction?.();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      {/* JSX */}
    </div>
  );
};
```

### Props y Estado
- Usar destructuring para props
- Valores por defecto en parámetros
- Estado tipado con TypeScript
- Callbacks opcionales con `?.`

### Hooks Personalizados
```typescript
// hooks/useCustomHook.ts
export const useCustomHook = (dependency: string) => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lógica del hook
  }, [dependency]);

  return { data, loading, refetch: () => {} };
};
```

## Manejo de Datos

### Supabase Queries
```typescript
// ✅ Formato recomendado con TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['appointments', psychologistId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('psychologist_id', psychologistId);
    
    if (error) throw error;
    return data;
  },
});

// ✅ Manejo directo
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};
```

### Manejo de Errores
```typescript
// En componentes
const handleSubmit = async () => {
  try {
    setLoading(true);
    await submitData();
    
    toast({
      title: "Éxito",
      description: "Operación completada"
    });
  } catch (error) {
    console.error('Error in handleSubmit:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Error desconocido",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};
```

## Estilos con Tailwind CSS

### Clases Comunes
```typescript
// Layout
"flex items-center justify-between"
"grid grid-cols-1 md:grid-cols-2 gap-4"
"max-w-md mx-auto"

// Spacing
"p-4 space-y-4"
"mb-4 mt-6"

// Colors
"bg-gradient-to-r from-blue-500 to-emerald-500"
"text-slate-600 hover:text-slate-800"
"border border-slate-200"

// Interactive
"hover:bg-slate-50 transition-colors"
"focus-visible:ring-2 focus-visible:ring-ring"
```

### Responsive Design
```typescript
// Mobile first
"text-sm md:text-base"
"flex flex-col md:flex-row"
"hidden md:block"
"p-4 md:p-6 lg:p-8"
```

## Formularios

### Validación
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.requiredField) {
    toast({
      title: "Error",
      description: "Campo requerido faltante",
      variant: "destructive"
    });
    return;
  }
  
  // Procesar formulario
};
```

### Campos Controlados
```typescript
<input
  type="text"
  value={formData.field}
  onChange={(e) => setFormData({...formData, field: e.target.value})}
  className="w-full p-2 border rounded"
  required
/>
```

## Fechas y Horarios

### Formato Correcto
```typescript
// ✅ Para fechas locales
const formatLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('es-ES');
};

// ✅ Para timestamps
const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('es-ES');
};

// ❌ Evitar conversiones UTC innecesarias
new Date(dateString) // Puede causar problemas de zona horaria
```

## Debugging

### Console Logs Estructurados
```typescript
console.log('=== FUNCTION_NAME ===');
console.log('Input parameters:', { param1, param2 });
console.log('State before operation:', currentState);
console.log('Result:', result);
console.log('State after operation:', newState);

// Para errores
console.error('Error in functionName:', {
  error: error.message,
  stack: error.stack,
  context: { relevantData }
});
```

### Naming para Debug
- Usar nombres descriptivos para funciones y variables
- Incluir contexto en mensajes de error
- Logear puntos críticos del flujo

## Performance

### Optimizaciones
```typescript
// Memoización cuando sea necesario
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(deps);
}, [deps]);

// Callbacks estables
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);

// Lazy loading
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### Evitar Re-renders
- No crear objetos/funciones en render
- Usar `useCallback` para funciones pasadas como props
- Separar estado que cambia frecuentemente

## Convenciones de Nombres

### Archivos
- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.tsx`
- Utilidades: `camelCase.ts`
- Páginas: `PascalCase.tsx`

### Variables y Funciones
```typescript
// Variables
const userName = "value";
const isLoading = true;
const itemCount = 5;

// Funciones
const handleSubmit = () => {};
const fetchUserData = async () => {};
const validateForm = () => {};

// Componentes
const UserProfile = () => {};
const AppointmentCard = () => {};

// Constants
const API_ENDPOINTS = {};
const DEFAULT_VALUES = {};
```

## Testing y QA

### Checklist Básico
- [ ] Componente se renderiza sin errores
- [ ] Estados de loading funcionan
- [ ] Manejo de errores implementado
- [ ] Responsive en móvil y desktop
- [ ] Accesibilidad básica (labels, contraste)
- [ ] Console.logs para debugging

### Casos Edge
- [ ] Datos vacíos o null
- [ ] Estados de error de red
- [ ] Usuarios no autenticados
- [ ] Permisos insuficientes
- [ ] Validación de formularios

Estas guías aseguran consistencia y calidad en el desarrollo del sistema de gestión psicológica.
