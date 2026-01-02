import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Edit,
  FileText,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Calendar,
  Hash,
  CreditCard,
  User,
  Zap
} from "lucide-react";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { toast } from "@/hooks/use-toast";

interface ReceiptValidationPanelProps {
  psychologistId: string;
}

export const ReceiptValidationPanel = ({ psychologistId }: ReceiptValidationPanelProps) => {
  const { receipts, validateReceipt, updateReceiptInclusion, retryOCRProcessing, loading } = usePaymentReceipts(psychologistId);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [validationNotes, setValidationNotes] = useState('');

  const pendingReceipts = receipts.filter(r => 
    r.validation_status === 'pending' || 
    r.validation_status === 'needs_review' ||
    r.extraction_status === 'processing'
  );

  // Función para determinar el método de extracción
  const getExtractionMethod = (receipt: any) => {
    if (receipt.extracted_data?.method) {
      switch (receipt.extracted_data.method) {
        case 'gpt4_fallback':
        case 'gpt4_processing':
          return { label: 'IA GPT-4o', icon: FileText, color: 'bg-blue-100 text-blue-800', description: 'Procesado con Inteligencia Artificial' };
        case 'bank_extraction':
          return { label: 'Extracción Bancaria', icon: FileText, color: 'bg-green-100 text-green-800', description: 'Extraído automáticamente del comprobante' };
        default:
          return { label: 'Manual', icon: Edit, color: 'bg-purple-100 text-purple-800', description: 'Ingresado manualmente' };
      }
    }
    return { label: 'Desconocido', icon: AlertCircle, color: 'bg-gray-100 text-gray-800', description: 'Método no especificado' };
  };

  const handleEditData = (receipt: any) => {
    setSelectedReceipt(receipt);
    setEditingData({
      receipt_date: receipt.receipt_date || '',
      amount: receipt.amount || '',
      receipt_type: receipt.receipt_type || '',
      receipt_number: receipt.receipt_number || '',
      patient_cuit: receipt.patient_cuit || '',
      payment_method: receipt.payment_method || ''
    });
    setValidationNotes('');
  };

  const handleApprove = async (receiptId: string) => {
    await validateReceipt(receiptId, 'approved', validationNotes);
    setSelectedReceipt(null);
    setEditingData({});
    setValidationNotes('');
  };

  const handleReject = async (receiptId: string) => {
    await validateReceipt(receiptId, 'rejected', validationNotes);
    setSelectedReceipt(null);
    setValidationNotes('');
  };

  const handleRetryOCR = async (receipt: any) => {
    if (receipt.original_file_url) {
      try {
        await retryOCRProcessing(receipt.id);
        toast({
          title: "✅ Procesando comprobante con IA",
          description: "El sistema de inteligencia artificial está extrayendo los datos del comprobante. Esto puede tardar unos segundos...",
        });
      } catch (error) {
        toast({
          title: "❌ Error al procesar con IA",
          description: "No se pudo ejecutar el procesamiento automático. Intenta nuevamente o ingresa los datos manualmente.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'needs_review':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Requiere revisión</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      case 'needs_correction':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Requiere corrección</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getExtractionStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendiente OCR</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="animate-pulse">
          <Zap className="w-3 h-3 mr-1" />
          Procesando...
        </Badge>;
      case 'extracted':
        return <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          OCR Completado
        </Badge>;
      case 'error':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Error OCR
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return 'No especificado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getReceiptTypeDisplay = (type?: string) => {
    const types = {
      'factura_a': 'Factura A',
      'factura_b': 'Factura B',
      'factura_c': 'Factura C',
      'ticket': 'Ticket',
      'recibo': 'Recibo'
    };
    return types[type as keyof typeof types] || type || 'No especificado';
  };

  const getPaymentMethodDisplay = (method?: string) => {
    const methods = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'tarjeta_debito': 'Tarjeta de débito',
      'tarjeta_credito': 'Tarjeta de crédito'
    };
    return methods[method as keyof typeof methods] || method || 'No especificado';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validación de Comprobantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-slate-600">Cargando comprobantes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Validación de Comprobantes
          {pendingReceipts.length > 0 && (
            <Badge variant="outline">{pendingReceipts.length} pendientes</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(receipt.validation_status)}
                    {getExtractionStatusBadge(receipt.extraction_status)}
                    {(() => {
                      const method = getExtractionMethod(receipt);
                      const IconComponent = method.icon;
                      return (
                        <Badge variant="outline" className={`${method.color} border-0`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {method.label}
                        </Badge>
                      );
                    })()}
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(receipt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Información principal destacada */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-600">Monto</p>
                          <p className={`font-bold text-lg ${
                            receipt.amount > 0 ? 'text-green-600' : 'text-slate-400'
                          }`}>
                            {receipt.amount > 0 ? formatCurrency(receipt.amount) : 'No especificado'}
                          </p>
                          {receipt.amount === 0 && receipt.extraction_status === 'pending' && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              ⚠️ No se procesó automáticamente. Haz clic en "Procesar con IA" para extraer los datos del comprobante.
                            </p>
                          )}
                          {receipt.amount > 0 && (() => {
                            const method = getExtractionMethod(receipt);
                            return (
                              <p className="text-xs text-green-600 font-medium">
                                ✨ {method.description}
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-600">Fecha del comprobante</p>
                          <p className="font-semibold">
                            {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 'No especificada'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-600">Tipo</p>
                          <p className="font-semibold">{receipt.receipt_type || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {(receipt.receipt_number || receipt.payment_method || receipt.patient_cuit) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                      {receipt.receipt_number && (
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-slate-500" />
                          <span className="font-medium text-slate-700">Nº:</span>
                          <span>{receipt.receipt_number}</span>
                        </div>
                      )}
                      
                      {receipt.payment_method && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span className="font-medium text-slate-700">Pago:</span>
                          <span>{receipt.payment_method}</span>
                        </div>
                      )}
                      
                      {receipt.patient_cuit && (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="font-medium text-slate-700">CUIT:</span>
                          <span>{receipt.patient_cuit}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {receipt.validation_notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-blue-800 font-medium mb-1">Notas de procesamiento:</p>
                      <p className="text-sm text-blue-700">{receipt.validation_notes}</p>
                    </div>
                  )}

                  {receipt.extracted_data && (
                    <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <p className="text-xs font-medium text-green-700 mb-1">🤖 Datos extraídos por IA:</p>
                      <div className="text-xs text-green-600">
                        {receipt.extracted_data.confidence && (
                          <span className="font-semibold">Confianza: {Math.round(receipt.extracted_data.confidence * 100)}%</span>
                        )}
                        {receipt.extracted_data.description && (
                          <span className="ml-2">• {receipt.extracted_data.description}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 ml-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={receipt.include_in_report}
                      onCheckedChange={(checked) => updateReceiptInclusion(receipt.id, checked)}
                    />
                    <Label className="text-xs">Incluir en reporte</Label>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {receipt.original_file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={receipt.original_file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver comprobante
                        </a>
                      </Button>
                    )}
                    
                    {(receipt.extraction_status === 'error' || 
                      (receipt.extraction_status === 'pending' && !receipt.amount) ||
                      (receipt.extraction_status === 'processing' && !receipt.amount)) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRetryOCR(receipt)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Procesar con IA
                      </Button>
                    )}
                    
                    {(receipt.validation_status === 'pending' || receipt.validation_status === 'needs_review') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditData(receipt)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Revisar y validar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {selectedReceipt?.id === receipt.id && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-medium mb-3 text-slate-800">Revisar y validar datos del comprobante</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="receipt_date">Fecha del comprobante</Label>
                      <Input
                        id="receipt_date"
                        type="date"
                        value={editingData.receipt_date}
                        onChange={(e) => setEditingData({...editingData, receipt_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Monto (ARS) - Campo requerido</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editingData.amount}
                        onChange={(e) => setEditingData({...editingData, amount: parseFloat(e.target.value) || 0})}
                        className="font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receipt_type">Tipo de comprobante</Label>
                      <select
                        id="receipt_type"
                        className="w-full p-2 border rounded"
                        value={editingData.receipt_type}
                        onChange={(e) => setEditingData({...editingData, receipt_type: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="factura_a">Factura A</option>
                        <option value="factura_b">Factura B</option>
                        <option value="factura_c">Factura C</option>
                        <option value="ticket">Ticket</option>
                        <option value="recibo">Recibo</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="receipt_number">Número de comprobante</Label>
                      <Input
                        id="receipt_number"
                        placeholder="Ej: 001-001-00000123"
                        value={editingData.receipt_number}
                        onChange={(e) => setEditingData({...editingData, receipt_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Método de pago</Label>
                      <select
                        id="payment_method"
                        className="w-full p-2 border rounded"
                        value={editingData.payment_method}
                        onChange={(e) => setEditingData({...editingData, payment_method: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta_debito">Tarjeta de débito</option>
                        <option value="tarjeta_credito">Tarjeta de crédito</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="patient_cuit">CUIT del paciente</Label>
                      <Input
                        id="patient_cuit"
                        placeholder="XX-XXXXXXXX-X"
                        value={editingData.patient_cuit}
                        onChange={(e) => setEditingData({...editingData, patient_cuit: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="validation_notes">Notas de validación</Label>
                    <Textarea
                      id="validation_notes"
                      placeholder="Agregar notas sobre la validación..."
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(receipt.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar y validar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(receipt.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedReceipt(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {receipts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay comprobantes para revisar</p>
              <p className="text-sm">Los comprobantes subidos por pacientes aparecerán aquí para su validación.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
