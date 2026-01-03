import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sanitizeAttachment, SanitizedAttachment } from '@/utils/attachments';

const BUCKET = 'message-attachments';

export type UploadedAttachmentMeta = {
  path: string;
  name: string;
  mime: string;
  size: number;
};

export const useAttachmentUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadAttachment = useCallback(
    async (file: File, conversationId: string): Promise<{ meta: UploadedAttachmentMeta; kind: SanitizedAttachment['kind'] } | null> => {
      setUploading(true);
      try {
        const { file: cleanFile, kind } = await sanitizeAttachment(file);
        const ext = cleanFile.name.split('.').pop() || 'bin';
        const objectName = `${conversationId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(objectName, cleanFile, { contentType: cleanFile.type, cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Upload error', uploadError);
          toast({
            title: 'Error al subir adjunto',
            description: 'No se pudo subir el archivo. Verifica el bucket message-attachments y los permisos.',
            variant: 'destructive'
          });
          return null;
        }

        return {
          kind,
          meta: {
            path: objectName,
            name: cleanFile.name,
            mime: cleanFile.type,
            size: cleanFile.size
          }
        };
      } catch (error) {
        console.error('Attachment upload failed', error);
        toast({
          title: 'Error al procesar adjunto',
          description: 'No se pudo procesar o comprimir el archivo.',
          variant: 'destructive'
        });
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return { uploadAttachment, uploading };
};
