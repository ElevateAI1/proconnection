import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClinicTeam } from '@/hooks/useClinicTeam';
import { UserPlus, Trash2, Edit, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const ClinicTeamManagement = () => {
  const { clinicTeam, teamMembers, loading, inviteMember, updateMemberRole, removeMember } = useClinicTeam();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'psychologist' | 'assistant' | 'admin_staff'>('psychologist');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un email válido',
        variant: 'destructive'
      });
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('psychologist');
      setIsInviteDialogOpen(false);
    } catch (err) {
      // Error ya manejado en el hook
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole as any);
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que deseas remover a este miembro del equipo?')) {
      return;
    }
    try {
      await removeMember(memberId);
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-600">Cargando equipo...</p>
        </CardContent>
      </Card>
    );
  }

  if (!clinicTeam) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-600">
            No tienes un equipo de clínica configurado. Contacta soporte para crear uno.
          </p>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = clinicTeam.max_professionals - clinicTeam.current_professionals_count;
  const isAtLimit = availableSlots <= 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Equipo</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {clinicTeam.team_name}
              </p>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={isAtLimit || !clinicTeam.is_admin}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invitar Miembro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invitar Miembro al Equipo</DialogTitle>
                  <DialogDescription>
                    Ingresa el email del profesional que deseas invitar. Debe estar registrado en la plataforma.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email del profesional</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="profesional@ejemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="psychologist">Psicólogo</SelectItem>
                        <SelectItem value="assistant">Asistente</SelectItem>
                        <SelectItem value="admin_staff">Personal Administrativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isAtLimit && (
                    <p className="text-sm text-amber-600">
                      Has alcanzado el límite de profesionales. Contacta soporte para agregar más.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvite} disabled={isInviting || isAtLimit}>
                    {isInviting ? 'Enviando...' : 'Enviar Invitación'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Profesionales Incluidos</p>
              <p className="text-2xl font-bold text-blue-petrol">{clinicTeam.max_professionals}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Actualmente Activos</p>
              <p className="text-2xl font-bold text-green-600">{clinicTeam.current_professionals_count}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Disponibles</p>
              <p className="text-2xl font-bold text-amber-600">{availableSlots}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Miembros del Equipo</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No hay miembros en el equipo
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.psychologist 
                          ? `${member.psychologist.first_name} ${member.psychologist.last_name}`
                          : 'Cargando...'}
                      </TableCell>
                      <TableCell>
                        {clinicTeam.is_admin ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateRole(member.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="psychologist">Psicólogo</SelectItem>
                              <SelectItem value="assistant">Asistente</SelectItem>
                              <SelectItem value="admin_staff">Admin Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{member.role}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                        >
                          {member.status === 'active' ? 'Activo' : member.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {clinicTeam.is_admin && member.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

