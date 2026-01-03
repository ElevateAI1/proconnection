import { tryDecryptContent } from '@/utils/secureMessaging';

export type AttachmentContent = {
  path: string;
  name?: string;
  mime?: string;
  size?: number;
};

export type DecodedMessage = {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  message_type?: string;
  read_at?: string | null;
  created_at: string;
  attachment?: AttachmentContent | null;
  _raw?: any;
};

export const decodeMessage = async (raw: any, conversationId: string): Promise<DecodedMessage> => {
  let decodedContent: string | null = null;
  let attachment: AttachmentContent | null = null;

  // Intentar descifrar
  decodedContent = await tryDecryptContent(raw.content || '', conversationId);

  // Si no hay cifrado, usar el contenido tal cual
  const usableContent = decodedContent ?? raw.content ?? '';

  if (raw.message_type && raw.message_type !== 'text') {
    try {
      const meta = JSON.parse(usableContent);
      if (meta?.path) {
        attachment = {
          path: meta.path,
          name: meta.name,
          mime: meta.mime,
          size: meta.size
        };
      }
    } catch {
      // El contenido puede ser una URL o path plano
      attachment = { path: usableContent };
    }
  }

  return {
    id: raw.id,
    sender_id: raw.sender_id,
    conversation_id: raw.conversation_id,
    content: raw.message_type === 'text' ? usableContent : usableContent,
    message_type: raw.message_type,
    read_at: raw.read_at,
    created_at: raw.created_at,
    attachment,
    _raw: raw
  };
};
