
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePaymentProof } from '@/hooks/usePaymentProof';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Calculator } from 'lucide-react';

interface PaymentProofUploaderProps {
  psychologistId: string;
  patientId: string;
  expectedAmount?: number;
  onUploadComplete?: () => void;
}

export const PaymentProofUploader: React.FC<PaymentProofUploaderProps> = ({
  psychologistId,
  patientId,
  expectedAmount: propExpectedAmount,
  onUploadComplete
}) => {
  const { uploadPaymentProof, uploading } = usePaymentProof();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [expectedAmount, setExpectedAmount] = useState<string>(propExpectedAmount?.toString() || '');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };


  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus('uploading');

      // Validar tipo y tamaño de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten JPG, PNG y PDF.');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      console.log('Starting file upload:', file.name, file.type, file.size);
      
      // Subir archivo usando el hook existente
      const fileUrl = await uploadPaymentProof(file, psychologistId, patientId);
      
      if (fileUrl) {
        console.log('File uploaded successfully:', fileUrl);
        setUploadStatus('processing');

        // Crear registro en payment_receipts
        const { data, error } = await supabase
          .from('payment_receipts')
          .insert({
            psychologist_id: psychologistId,
            patient_id: patientId,
            original_file_url: fileUrl,
            extraction_status: 'pending',
            validation_status: 'pending'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating receipt record:', error);
          throw error;
        }

        console.log('Receipt record created:', data.id);

        // Iniciar procesamiento OCR
        try {
          const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
            body: {
              fileUrl: fileUrl,
              receiptId: data.id
            }
          });

          if (ocrError) {
            console.error('Error iniciando OCR:', ocrError);
            // No lanzamos error aquí porque el archivo ya se subió exitosamente
            toast({
              title: "⚠️ Comprobante subido con advertencia",
              description: "El archivo se subió correctamente, pero hubo un problema iniciando el procesamiento automático. El profesional puede procesarlo manualmente.",
              variant: "destructive"
            });
          } else {
            console.log('OCR processing initiated:', ocrData);
          }
        } catch (ocrErr) {
          console.error('Error calling OCR function:', ocrErr);
          // Continue with success since the file was uploaded
        }

        setUploadStatus('success');

        toast({
          title: "✅ Comprobante subido exitosamente",
          description: "El comprobante está siendo procesado automáticamente con IA. El profesional lo revisará y validará pronto.",
        });

        onUploadComplete?.();

        // Reset status after a delay
        setTimeout(() => {
          setUploadStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      setUploadStatus('error');
      
      toast({
        title: "❌ Error al subir comprobante",
        description: error instanceof Error ? error.message : 'Error desconocido al procesar el archivo',
        variant: "destructive",
      });

      // Reset status after a delay
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    }
  };

  const getStatusDisplay = () => {
    switch (uploadStatus) {
      case 'uploading':
        return {
          icon: <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>,
          title: "Subiendo archivo...",
          description: "Por favor espera mientras se sube el comprobante",
          color: "text-blue-600"
        };
      case 'processing':
        return {
          icon: <Clock className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />,
          title: "Procesando con IA...",
          description: "El comprobante está siendo analizado automáticamente",
          color: "text-yellow-600"
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />,
          title: "¡Subido exitosamente!",
          description: "El comprobante será revisado por el profesional",
          color: "text-green-600"
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />,
          title: "Error al subir",
          description: "Intenta nuevamente con otro archivo",
          color: "text-red-600"
        };
      default:
        return {
          icon: <Upload className="w-12 h-12 text-slate-400 mx-auto" />,
          title: "Arrastra tu comprobante aquí o haz clic para seleccionar",
          description: "Formatos aceptados: PDF, JPG, PNG (máximo 5MB)",
          color: "text-slate-700"
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const isDisabled = uploading || uploadStatus === 'uploading' || uploadStatus === 'processing';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Subir Comprobante de Pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Campo opcional para importe esperado */}
        <div className="mb-6">
          <Label htmlFor="expected-amount" className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="w-4 h-4" />
            Importe esperado (opcional)
          </Label>
          <Input
            id="expected-amount"
            type="number"
            step="0.01"
            placeholder="Ej: 1500.00"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
            className="mt-1"
            disabled={isDisabled}
          />
          <p className="text-xs text-slate-500 mt-1">
            El importe será extraído automáticamente por el sistema de IA
          </p>
        </div>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive && !isDisabled ? 'border-blue-500 bg-blue-50' : 
            uploadStatus === 'success' ? 'border-green-500 bg-green-50' :
            uploadStatus === 'error' ? 'border-red-500 bg-red-50' :
            uploadStatus === 'processing' ? 'border-yellow-500 bg-yellow-50' :
            'border-gray-300'
          } ${isDisabled ? 'pointer-events-none opacity-75' : 'cursor-pointer hover:border-blue-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {statusDisplay.icon}
            <div>
              <p className={`text-lg font-medium ${statusDisplay.color}`}>
                {statusDisplay.title}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {statusDisplay.description}
              </p>
            </div>
            
            {uploadStatus === 'idle' && (
              <>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleChange}
                  disabled={isDisabled}
                />
                
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar archivo
                </label>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800">Procesamiento automático inteligente</h4>
              <p className="text-sm text-green-700 mt-1">
                Una vez subido, nuestro sistema de IA analizará automáticamente el comprobante para extraer:
                <strong> fecha, monto, tipo de comprobante y método de pago</strong>. 
                El profesional revisará y validará los datos antes de incluirlos en los reportes mensuales.
              </p>
              <p className="text-xs text-green-600 mt-2 font-medium">
                ✨ Esto ahorra tiempo y reduce errores en la gestión contable
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
