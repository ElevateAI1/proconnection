/**
 * Utilidades para formatear fechas con zona horaria de Argentina (GMT-3)
 */

export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
export const ARGENTINA_LOCALE = 'es-AR';

/**
 * Formatea una fecha con la zona horaria de Argentina
 */
export const formatDateArgentina = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  return dateObj.toLocaleDateString(ARGENTINA_LOCALE, {
    timeZone: ARGENTINA_TIMEZONE,
    ...options
  });
};

/**
 * Formatea una hora con la zona horaria de Argentina
 */
export const formatTimeArgentina = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return 'Hora no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Hora inválida';
  
  return dateObj.toLocaleTimeString(ARGENTINA_LOCALE, {
    timeZone: ARGENTINA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options
  });
};

/**
 * Formatea fecha y hora con la zona horaria de Argentina
 */
export const formatDateTimeArgentina = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return 'Fecha y hora no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Fecha y hora inválida';
  
  return dateObj.toLocaleString(ARGENTINA_LOCALE, {
    timeZone: ARGENTINA_TIMEZONE,
    ...options
  });
};

/**
 * Opciones comunes para formatear fechas
 */
export const dateFormatOptions = {
  full: {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
    timeZone: ARGENTINA_TIMEZONE
  },
  short: {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    timeZone: ARGENTINA_TIMEZONE
  },
  dateOnly: {
    year: 'numeric' as const,
    month: '2-digit' as const,
    day: '2-digit' as const,
    timeZone: ARGENTINA_TIMEZONE
  },
  timeOnly: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    timeZone: ARGENTINA_TIMEZONE
  }
};

