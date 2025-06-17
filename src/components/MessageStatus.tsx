
import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  isOwnMessage: boolean;
  readAt?: string;
  createdAt: string;
}

export const MessageStatus = ({ isOwnMessage, readAt, createdAt }: MessageStatusProps) => {
  if (!isOwnMessage) return null;

  return (
    <div className="flex items-center gap-1 ml-2">
      {readAt ? (
        <CheckCheck className="w-3 h-3 text-blue-500" />
      ) : (
        <Check className="w-3 h-3 text-slate-400" />
      )}
    </div>
  );
};
