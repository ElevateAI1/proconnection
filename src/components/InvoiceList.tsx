import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useProfile } from '@/hooks/useProfile';
import { downloadInvoicePDF, openInvoicePDF } from '@/utils/invoicePDFGenerator';
import {
  FileText,
  Download,
  Eye,
  X,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InvoiceListProps {
  psychologistId?: string;
}

export const InvoiceList = ({ psychologistId }: InvoiceListProps) => {
  const { invoices, loading, cancelInvoice, updateInvoiceStatus, fetchInvoices } = useInvoices(psychologistId);
  const { psychologist } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      draft: {
        label: 'Borrador',
        variant: 'outline',
        className: 'border-gray-300 text-gray-700',
      },
      generated: {
        label: 'Generada',
        variant: 'default',
        className: 'bg-blue-petrol/20 text-blue-petrol border-blue-petrol/30',
      },
      sent: {
        label: 'Enviada',
        variant: 'default',
        className: 'bg-green-mint/50 text-blue-petrol border-green-mint',
      },
      cancelled: {
        label: 'Cancelada',
        variant: 'destructive',
        className: 'bg-red-100 text-red-700 border-red-300',
      },
      voided: {
        label: 'Anulada',
        variant: 'destructive',
        className: 'bg-red-100 text-red-700 border-red-300',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatInvoiceNumber = (invoice: Invoice) => {
    return `${invoice.point_of_sale.toString().padStart(4, '0')}-${invoice.invoice_number.toString().padStart(8, '0')}`;
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!psychologist) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener la información del profesional',
        variant: 'destructive',
      });
      return;
    }

    try {
      await downloadInvoicePDF(invoice, {
        first_name: psychologist.first_name,
        last_name: psychologist.last_name,
        professional_code: psychologist.professional_code,
        license_number: psychologist.license_number,
        specialization: psychologist.specialization,
        phone: psychologist.phone,
        email: psychologist.email || undefined,
        cuit: psychologist.cuit || undefined,
        address: psychologist.address || undefined,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el PDF de la factura',
        variant: 'destructive',
      });
    }
  };

  const handleViewPDF = async (invoice: Invoice) => {
    if (!psychologist) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener la información del profesional',
        variant: 'destructive',
      });
      return;
    }

    try {
      await openInvoicePDF(invoice, {
        first_name: psychologist.first_name,
        last_name: psychologist.last_name,
        professional_code: psychologist.professional_code,
        license_number: psychologist.license_number,
        specialization: psychologist.specialization,
        phone: psychologist.phone,
        email: psychologist.email || undefined,
        cuit: psychologist.cuit || undefined,
        address: psychologist.address || undefined,
      });
    } catch (error) {
      console.error('Error viewing PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo abrir el PDF de la factura',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsSent = async (invoice: Invoice) => {
    try {
      await updateInvoiceStatus(invoice.id, 'sent');
      toast({
        title: '✅ Factura marcada como enviada',
        description: 'La factura se marcó como enviada exitosamente',
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleCancel = async (invoice: Invoice) => {
    if (!confirm(`¿Estás seguro de que quieres cancelar la factura ${formatInvoiceNumber(invoice)}?`)) {
      return;
    }

    const reason = prompt('Motivo de cancelación (opcional):') || undefined;

    try {
      await cancelInvoice(invoice.id, reason);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  // Filtrar facturas
  const filteredInvoices = invoices.filter((invoice) => {
    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        invoice.client_name.toLowerCase().includes(searchLower) ||
        formatInvoiceNumber(invoice).includes(searchTerm) ||
        invoice.service_description.toLowerCase().includes(searchLower) ||
        invoice.client_document_number?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro de estado
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }

    // Filtro de fecha
    if (dateFilter !== 'all') {
      const invoiceDate = new Date(invoice.invoice_date);
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      if (dateFilter === 'this_month') {
        if (invoiceDate.getMonth() !== thisMonth || invoiceDate.getFullYear() !== thisYear) {
          return false;
        }
      } else if (dateFilter === 'this_year') {
        if (invoiceDate.getFullYear() !== thisYear) {
          return false;
        }
      }
    }

    return true;
  });

  if (loading && invoices.length === 0) {
    return (
      <Card className="bg-white-warm border-2 border-blue-petrol/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-soft border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-petrol/70">Cargando facturas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white-warm border-2 border-blue-petrol/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-petrol">
            <FileText className="w-5 h-5" />
            Facturas Generadas ({filteredInvoices.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-petrol/50" />
            <Input
              placeholder="Buscar por cliente, número, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-petrol/20"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-blue-petrol/20">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="generated">Generada</SelectItem>
              <SelectItem value="sent">Enviada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
              <SelectItem value="voided">Anulada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="border-blue-petrol/20">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="this_month">Este mes</SelectItem>
              <SelectItem value="this_year">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de facturas */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-blue-petrol/30 rounded-lg bg-gradient-to-br from-blue-soft/10 via-white-warm to-green-mint/10">
            <FileText className="w-16 h-16 mx-auto mb-4 text-blue-petrol/30" />
            <h3 className="text-lg font-semibold text-blue-petrol mb-2">
              {invoices.length === 0 ? 'No hay facturas generadas' : 'No se encontraron facturas'}
            </h3>
            <p className="text-sm text-blue-petrol/70">
              {invoices.length === 0
                ? 'Crea tu primera factura usando el generador de facturas'
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="border border-blue-petrol/20 hover:border-blue-petrol/40 hover:shadow-md transition-all bg-white-warm"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-blue-petrol">
                          Factura {formatInvoiceNumber(invoice)}
                        </h4>
                        {getStatusBadge(invoice.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-petrol/70">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{invoice.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(invoice.invoice_date).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{invoice.service_description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-blue-petrol">
                            ${invoice.total_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPDF(invoice)}
                        className="border-blue-petrol/30 text-blue-petrol hover:bg-blue-soft/20"
                        title="Ver PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(invoice)}
                        className="border-blue-petrol/30 text-blue-petrol hover:bg-blue-soft/20"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {invoice.status === 'generated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsSent(invoice)}
                          className="border-green-mint/30 text-blue-petrol hover:bg-green-mint/20"
                          title="Marcar como enviada"
                        >
                          Enviada
                        </Button>
                      )}
                      {invoice.status !== 'cancelled' && invoice.status !== 'voided' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(invoice)}
                          className="border-red-300/50 text-red-600 hover:bg-red-50"
                          title="Cancelar factura"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

