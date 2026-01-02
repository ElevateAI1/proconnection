
// Utilidades para validación de números telefónicos argentinos
export const formatArgentinePhoneNumber = (phone: string): string => {
  // Remover todos los caracteres no numéricos excepto el +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si no tiene código de país, asumir Argentina (+54)
  if (!cleaned.startsWith('+') && !cleaned.startsWith('54')) {
    // Si empieza con 0, quitarlo (formato local argentino)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Para números argentinos móviles, necesitamos agregar el '9'
    // Si el número tiene 10 dígitos y no empieza con 9, agregarlo
    if (cleaned.length === 10 && !cleaned.startsWith('9')) {
      cleaned = '9' + cleaned;
    }
    
    cleaned = '+54' + cleaned;
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('+')) {
    // Si empieza con 54 pero no tiene +
    const numberPart = cleaned.substring(2);
    if (numberPart.length === 10 && !numberPart.startsWith('9')) {
      cleaned = '+54' + '9' + numberPart;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  // Asegurar que tenga el + al inicio
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

export const isValidArgentinePhoneNumber = (phone: string): boolean => {
  const formatted = formatArgentinePhoneNumber(phone);
  // Número argentino móvil: +54 9 + código de área (2-4 dígitos) + número (6-8 dígitos)
  return /^\+549\d{8,12}$/.test(formatted);
};

export const displayPhoneNumber = (phone: string): string => {
  const formatted = formatArgentinePhoneNumber(phone);
  if (formatted.startsWith('+549')) {
    // Formato: +54 9 11 1234-5678
    const withoutCountry = formatted.substring(3); // Remove +54
    const areaCode = withoutCountry.substring(1, 3); // Remove 9, get area code
    const number = withoutCountry.substring(3);
    
    if (number.length >= 7) {
      return `+54 9 ${areaCode} ${number.substring(0, 4)}-${number.substring(4)}`;
    }
  }
  return formatted;
};
