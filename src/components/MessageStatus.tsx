
import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  isOwnMessage: boolean;
  readAt?: string | null;
  createdAt: string;
  className?: string;
}

export const MessageStatus = ({ isOwnMessage, readAt, createdAt, className = "" }: MessageStatusProps) => {
  if (!isOwnMessage) return null;

  // Estado: leído (azul)
  if (readAt) {
    return (
      <div className={`flex items-center gap-0.5 ml-1 ${className}`}>
        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
      </div>
    );
  }

  // Estado: entregado (gris doble check)
  // Asumimos que está entregado si ha pasado al menos 1 segundo desde la creación
  const messageDate = new Date(createdAt);
  const now = new Date();
  const timeDiff = now.getTime() - messageDate.getTime();
  const isDelivered = timeDiff > 1000; // 1 segundo

  if (isDelivered) {
    return (
      <div className={`flex items-center gap-0.5 ml-1 ${className}`}>
        <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
      </div>
    );
  }

  // Estado: enviado (gris simple check)
  return (
    <div className={`flex items-center gap-0.5 ml-1 ${className}`}>
      <Check className="w-3.5 h-3.5 text-slate-400" />
    </div>
  );
};
