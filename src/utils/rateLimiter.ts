/**
 * Rate limiter utility para limitar llamadas a funciones costosas
 * Usa localStorage para trackear llamadas por IP + Account ID + User Agent
 */

interface RateLimitKey {
  key: string;
  timestamp: number;
}

const RATE_LIMIT_PREFIX = 'rate_limit_';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Genera una clave única basada en función, account ID y user agent
 */
function generateRateLimitKey(
  functionName: string,
  accountId: string,
  userAgent?: string
): string {
  // Usar una combinación de función, account ID y user agent
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown');
  // Crear un hash simple de la combinación
  const combined = `${functionName}_${accountId}_${ua}`;
  return `${RATE_LIMIT_PREFIX}${btoa(combined).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Verifica si se puede ejecutar una función basado en rate limiting
 * @param functionName Nombre de la función
 * @param accountId ID de la cuenta/usuario
 * @param maxCallsPerDay Máximo de llamadas por día (default: 1)
 * @returns true si se puede ejecutar, false si está limitado
 */
export function canExecuteRateLimited(
  functionName: string,
  accountId: string,
  maxCallsPerDay: number = 1
): boolean {
  if (typeof window === 'undefined' || !localStorage) {
    // Si no hay localStorage, permitir ejecución (server-side)
    return true;
  }

  const key = generateRateLimitKey(functionName, accountId);
  const stored = localStorage.getItem(key);

  if (!stored) {
    // Primera vez, permitir ejecución
    return true;
  }

  try {
    const data: RateLimitKey = JSON.parse(stored);
    const now = Date.now();
    const timeSinceLastCall = now - data.timestamp;

    // Si pasó más de un día, permitir ejecución
    if (timeSinceLastCall >= ONE_DAY_MS) {
      return true;
    }

    // Si no ha pasado un día, verificar cuántas llamadas se han hecho
    // Para simplificar, solo trackeamos la última llamada
    // Si maxCallsPerDay > 1, necesitaríamos un array de timestamps
    if (maxCallsPerDay === 1) {
      return false; // Ya se llamó hoy
    }

    // Para múltiples llamadas, necesitaríamos un contador
    // Por ahora, solo soportamos 1 llamada por día
    return false;
  } catch (error) {
    console.error('Error parsing rate limit data:', error);
    return true; // En caso de error, permitir ejecución
  }
}

/**
 * Registra una ejecución de función para rate limiting
 */
export function recordRateLimitedExecution(
  functionName: string,
  accountId: string
): void {
  if (typeof window === 'undefined' || !localStorage) {
    return;
  }

  const key = generateRateLimitKey(functionName, accountId);
  const data: RateLimitKey = {
    key: functionName,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing rate limit data:', error);
  }
}

/**
 * Limpia el rate limit para una función (útil para testing)
 */
export function clearRateLimit(functionName: string, accountId: string): void {
  if (typeof window === 'undefined' || !localStorage) {
    return;
  }

  const key = generateRateLimitKey(functionName, accountId);
  localStorage.removeItem(key);
}

