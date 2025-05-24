
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

export const AdminPanel = () => {
  const { isAdmin, psychologistStats, loading, refetch } = useAdmin();

  useEffect(() => {
    if (isAdmin) {
      refetch();
    }
  }, [isAdmin, refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600">No tienes permisos para acceder al panel de administración.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    switch (status) {
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const totalPsychologists = psychologistStats.length;
  const activePsychologists = psychologistStats.filter(p => p.subscription_status === 'active').length;
  const trialPsychologists = psychologistStats.filter(p => p.subscription_status === 'trial').length;
  const expiredPsychologists = psychologistStats.filter(p => p.is_expired).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
          <p className="text-slate-600">Gestiona psicólogos y monitorea suscripciones</p>
        </div>
        <Button onClick={refetch} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Psicólogos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPsychologists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePsychologists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Trial</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{trialPsychologists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredPsychologists}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de psicólogos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Psicólogos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días Trial</TableHead>
                <TableHead>Días Suscripción</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {psychologistStats.map((psychologist) => (
                <TableRow key={psychologist.id}>
                  <TableCell className="font-medium">
                    {psychologist.first_name} {psychologist.last_name}
                  </TableCell>
                  <TableCell>{psychologist.email}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                      {psychologist.professional_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(psychologist.subscription_status, psychologist.is_expired)}
                  </TableCell>
                  <TableCell>
                    {psychologist.subscription_status === 'trial' ? (
                      <span className={psychologist.trial_days_remaining <= 2 ? 'text-red-600 font-bold' : 'text-blue-600'}>
                        {psychologist.trial_days_remaining}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {psychologist.subscription_status === 'active' ? (
                      <span className={psychologist.subscription_days_remaining <= 7 ? 'text-orange-600 font-bold' : 'text-green-600'}>
                        {psychologist.subscription_days_remaining}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{formatDate(psychologist.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {psychologistStats.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No hay psicólogos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
