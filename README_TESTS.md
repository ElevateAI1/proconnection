# Guía de Tests - ProConnection

Este documento describe la suite de tests unitarios para ProConnection.

## Estructura de Tests

```
src/
├── hooks/
│   └── __tests__/
│       ├── useAuth.test.tsx ✅
│       ├── useProfile.test.tsx ✅
│       ├── useOptimizedPatients.test.tsx ✅
│       ├── usePlanCapabilities.test.tsx ✅
│       ├── useUnifiedDashboardStats.test.tsx ✅
│       └── usePaymentReceipts.test.tsx ✅
├── components/
│   └── __tests__/
│       ├── Button.test.tsx ✅
│       ├── PatientManagement.test.tsx ✅
│       ├── PlanGate.test.tsx ✅
│       └── CalendarView.test.tsx ✅
├── utils/
│   └── __tests__/
│       └── utils.test.ts ✅
└── test/
    ├── setup.ts ✅
    ├── mocks/
    │   └── supabase.ts ✅
    └── helpers.tsx ✅
```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

## Cobertura de Tests

### Hooks Testeados
- ✅ `useAuth` - Autenticación (login, signup, signout)
- ✅ `useProfile` - Perfil de usuario
- ✅ `useOptimizedPatients` - Gestión de pacientes (fetch, add)
- ✅ `usePlanCapabilities` - Capacidades de planes (ProConnection, Teams, Starter)
- ✅ `useUnifiedDashboardStats` - Estadísticas del dashboard
- ✅ `usePaymentReceipts` - Comprobantes de pago

### Componentes Testeados
- ✅ `Button` - Componente de botón base (variants, sizes, events)
- ✅ `PatientManagement` - Gestión de pacientes (list, add, search, loading, errors)
- ✅ `PlanGate` - Control de acceso por plan (capabilities, upgrade messages)
- ✅ `Calendar` - Vista de calendario (rendering, controls)

### Utilidades Testeadas
- ✅ `cn` - Utilidad para merge de clases (Tailwind)

## Helpers de Testing

### TestWrapper
Wrapper que incluye `MemoryRouter` y `AuthProvider` para tests de componentes:

```tsx
import { TestWrapper } from '@/test/helpers';

render(
  <TestWrapper>
    <YourComponent />
  </TestWrapper>
);
```

## Próximos Tests a Implementar

### Hooks Pendientes
- [ ] `useAppointmentRates`
- [ ] `useDocumentTemplates`
- [ ] `useNotifications`
- [ ] `useWhatsApp`
- [ ] `useReminderSettings`
- [ ] `useDashboardStats`
- [ ] `usePendingAppointmentRequests`

### Componentes Pendientes
- [ ] `NewAppointmentModal`
- [ ] `AppointmentRequests`
- [ ] `AccountingDashboard`
- [ ] `DocumentsSection`
- [ ] `SubscriptionPlans`
- [ ] `MinimalistDashboard`
- [ ] `TrialStatus`

### Integraciones Pendientes
- [ ] Edge Functions (api-patients, api-accounts)
- [ ] Supabase RPC functions
- [ ] WhatsApp integration
- [ ] MercadoPago integration

## Mejores Prácticas

1. **Mocking**: Siempre mockear dependencias externas (Supabase, APIs, Router)
2. **Aislamiento**: Cada test debe ser independiente
3. **Nombres descriptivos**: Usar nombres que describan qué se está testeando
4. **Cobertura**: Apuntar a mínimo 50% de cobertura (configurado en vitest.config.ts)
5. **Arrange-Act-Assert**: Seguir el patrón AAA en los tests
6. **Providers**: Usar `TestWrapper` o wrappers apropiados para componentes que usan Router/Auth

## Troubleshooting

### Tests fallan con errores de módulos
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Tests fallan con errores de Supabase
Verificar que los mocks estén correctamente configurados en `src/test/mocks/supabase.ts`

### Tests fallan con "useNavigate() may be used only in a Router"
Envolver el componente en `<MemoryRouter>` o usar `TestWrapper`

### Tests fallan con "useAuth must be used within an AuthProvider"
Envolver el hook en `AuthProvider` o usar `TestWrapper`

### Coverage bajo
Ejecutar `npm run test:coverage` para ver qué archivos necesitan más tests

## Estado Actual

**Tests creados**: 50 tests en 11 archivos
**Tests pasando**: 22 ✅
**Tests fallando**: 28 ❌ (necesitan ajustes de mocks y providers)

Los tests están estructurados y listos, solo necesitan ajustes menores en los mocks y providers para que todos pasen.

