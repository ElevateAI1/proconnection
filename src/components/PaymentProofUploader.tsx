
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Eye } from "lucide-react";
import { usePaymentProof } from "@/hooks/usePaymentProof";

interface PaymentProofUploaderProps {
  psychologistId: string;
  patientId: string;
  onUploadComplete: (url: string) => void;
  currentProofUrl?: string;
}

export const PaymentProofUploader = ({ 
  psychologistId, 
  patientId, 
  onUploadComplete,
  currentProofUrl 
}: PaymentProofUploaderProps) => {
  const { uploadPaymentProof, uploading } = usePaymentProof();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const url = await uploadPaymentProof(selectedFile, psychologistId, patientId);
    if (url) {
      onUploadComplete(url);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileViewer = (url: string) => {
    // Con Supabase Storage, simplemente abrimos la URL directamente
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="paymentProof">Comprobante de Pago *</Label>
        <p className="text-sm text-slate-600 mb-2">
          Sube una imagen o PDF de tu comprobante de pago (máximo 5MB)
        </p>
        
        {/* Mostrar comprobante actual si existe */}
        {currentProofUrl && !selectedFile && (
          <Card className="border-emerald-200 bg-emerald-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    Comprobante subido
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openFileViewer(currentProofUrl)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
          <input
            ref={fileInputRef}
            id="paymentProof"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!selectedFile ? (
            <div>
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-2">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar Archivo
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                Formatos permitidos: PDF, JPG, PNG (máx. 5MB)
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <File className="w-8 h-8 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-800">{selectedFile.name}</p>
                  <p className="text-sm text-slate-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveFile}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Preview para imágenes */}
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {uploading ? "Subiendo..." : "Subir Comprobante"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
