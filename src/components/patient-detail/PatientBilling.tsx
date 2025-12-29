
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  Calendar, 
  Plus,
  Eye,
  Download
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PatientBillingProps {
  patientId?: string;
}

interface BillingRecord {
  id: string;
  amount: number;
  receipt_date: string;
  receipt_type: string;
  payment_method: string;
  validation_status: string;
  receipt_number?: string;
}

export const PatientBilling = ({ patientId }: PatientBillingProps) => {
  const { psychologist } = useProfile();
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (patientId && psychologist?.id) {
      fetchBillingRecords();
    }
  }, [patientId, psychologist?.id]);

  const fetchBillingRecords = async () => {
    if (!patientId || !psychologist?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologist.id)
        .order('receipt_date', { ascending: false });

      if (error) {
        console.error('Error fetching billing records:', error);
        toast({
          title: "Error",
          description: "Failed to fetch billing records",
          variant: "destructive",
        });
        return;
      }

      setBillingRecords(data || []);
      const total = data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching billing records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch billing records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading billing information...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-slate-800">${totalAmount.toFixed(2)}</p>
            <p className="text-sm text-slate-600">Total Facturado</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-slate-800">{billingRecords.length}</p>
            <p className="text-sm text-slate-600">Total Recibos</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-bold text-slate-800">
              {billingRecords.length > 0 && billingRecords[0].receipt_date
                ? (() => {
                    const date = new Date(billingRecords[0].receipt_date);
                    return !isNaN(date.getTime()) ? date.toLocaleDateString('es-ES') : 'Fecha inválida';
                  })()
                : 'Sin registros'
              }
            </p>
            <p className="text-sm text-slate-600">Último Recibo</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Records */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Historial de Facturación
            </span>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Recibo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay registros de facturación para este paciente</p>
              <p className="text-sm text-gray-500 mt-2">
                Los recibos aparecerán aquí cuando se carguen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">${record.amount?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-gray-600">
                        {record.receipt_type} - {record.receipt_date 
                          ? (() => {
                              const date = new Date(record.receipt_date);
                              return !isNaN(date.getTime()) ? date.toLocaleDateString('es-ES') : 'Fecha inválida';
                            })()
                          : 'Fecha no disponible'}
                      </p>
                      {record.receipt_number && (
                        <p className="text-xs text-gray-500">Recibo: {record.receipt_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(record.validation_status)}>
                      {getStatusLabel(record.validation_status)}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
