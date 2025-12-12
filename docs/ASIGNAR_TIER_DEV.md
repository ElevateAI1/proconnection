# Cómo Asignar el Tier DEV a una Cuenta

## Opción 1: Desde la Consola del Navegador (Más Rápido)

1. Abre tu dashboard en el navegador
2. Abre la consola del navegador (F12 o clic derecho → Inspeccionar → Console)
3. Ejecuta este código:

```javascript
// Primero obtén tu user ID
const { data: { user } } = await supabase.auth.getUser();
console.log('Tu User ID:', user.id);

// Luego actualiza tu plan a DEV
const { error } = await supabase
  .from('psychologists')
  .update({ plan_type: 'dev' })
  .eq('id', user.id);

if (error) {
  console.error('Error:', error);
} else {
  console.log('✅ Plan DEV asignado correctamente!');
  // Refrescar la página para ver los cambios
  window.location.reload();
}
```

## Opción 2: Desde Supabase SQL Editor

Ve al SQL Editor de Supabase y ejecuta:

```sql
-- Reemplaza 'TU_USER_ID_AQUI' con tu user ID de auth.users
UPDATE public.psychologists
SET plan_type = 'dev'
WHERE id = 'TU_USER_ID_AQUI';
```

Para obtener tu user ID:

```sql
-- Busca tu email en auth.users
SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com';
```

## Opción 3: Usando la Función activatePlan (desde consola)

```javascript
import { activatePlan } from '@/utils/activatePlusPlan';
await activatePlan('dev');
window.location.reload();
```

## Opción 4: Crear un botón temporal en el código

Puedes agregar temporalmente un botón en tu dashboard que ejecute:

```typescript
const assignDevPlan = async () => {
  try {
    await activatePlan('dev');
    window.location.reload();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Verificar que funcionó

Después de asignar el tier DEV, deberías ver:
- Badge verde "DEV" en tu dashboard
- Acceso a todas las funcionalidades
- Todas las opciones del sidebar disponibles

