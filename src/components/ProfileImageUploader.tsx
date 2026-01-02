
import { useState, useRef } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfileImage } from '@/hooks/useProfileImage';

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  psychologistId: string;
  psychologistName: string;
  onImageUpdated: (newUrl: string | null) => void;
}

export const ProfileImageUploader = ({
  currentImageUrl,
  psychologistId,
  psychologistName,
  onImageUpdated
}: ProfileImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfileImage, deleteProfileImage, uploading } = useProfileImage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const newUrl = await uploadProfileImage(file, psychologistId);
      onImageUpdated(newUrl);
      setPreviewUrl(null);
    } catch (error) {
      setPreviewUrl(null);
      // Error already handled in hook
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    try {
      await deleteProfileImage(psychologistId, currentImageUrl);
      onImageUpdated(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const names = psychologistName.split(' ');
    return names.map(name => name[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={displayImageUrl || undefined} alt={psychologistName} />
          <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
        
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={triggerFileInput}
          disabled={uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Subir foto</span>
        </Button>

        {currentImageUrl && !uploading && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center">
        Formatos soportados: JPG, PNG, GIF<br />
        Tamaño máximo: 5MB
      </p>
    </div>
  );
};
