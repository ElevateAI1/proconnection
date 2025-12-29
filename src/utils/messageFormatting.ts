/**
 * Formatea timestamps de mensajes de forma flexible
 * Hoy: "14:30"
 * Ayer: "Ayer 14:30"
 * Más viejo: "15 Dic"
 */
export const formatMessageTime = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  // Comparar solo fechas (sin hora)
  if (messageDay.getTime() === today.getTime()) {
    // Hoy: solo hora
    return messageDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (messageDay.getTime() === yesterday.getTime()) {
    // Ayer: "Ayer HH:MM"
    return `Ayer ${messageDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } else {
    // Más viejo: "DD MMM"
    return messageDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }
};

