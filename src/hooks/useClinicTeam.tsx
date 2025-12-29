import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from '@/hooks/use-toast';
import { canExecuteRateLimited, recordRateLimitedExecution } from '@/utils/rateLimiter';

interface ClinicTeam {
  team_id: string;
  team_name: string;
  admin_psychologist_id: string;
  max_professionals: number;
  current_professionals_count: number;
  subscription_status: string;
  is_admin: boolean;
  member_role?: string;
  member_status?: string;
}

interface TeamMember {
  id: string;
  clinic_team_id: string;
  psychologist_id: string;
  role: 'admin' | 'psychologist' | 'assistant' | 'admin_staff';
  permissions: Record<string, any>;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  status: 'pending' | 'active' | 'inactive';
  psychologist?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export const useClinicTeam = () => {
  const { psychologist } = useProfile();
  const [clinicTeam, setClinicTeam] = useState<ClinicTeam | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinicTeam = useCallback(async () => {
    if (!psychologist?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Rate limiting: solo 1 vez por día
      const rateLimitKey = `get_clinic_team_${psychologist.id}`;
      
      if (!canExecuteRateLimited(rateLimitKey, psychologist.id, 1)) {
        console.log('Rate limit: get_clinic_team ya fue llamado hoy para este psicólogo');
        setLoading(false);
        return;
      }

      const { data, error: teamError } = await supabase.rpc('get_clinic_team', {
        p_psychologist_id: psychologist.id
      });

      // Registrar la ejecución solo si no hay error
      if (!teamError) {
        recordRateLimitedExecution(rateLimitKey, psychologist.id);
      }

      if (teamError) {
        console.error('Error fetching clinic team:', teamError);
        setClinicTeam(null);
        setLoading(false);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const team = data[0] as ClinicTeam;
        setClinicTeam(team);

        // Si hay equipo, obtener miembros
        if (team.team_id) {
          const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
              *,
              psychologist:psychologists!team_members_psychologist_id_fkey (
                id,
                first_name,
                last_name
              )
            `)
            .eq('clinic_team_id', team.team_id)
            .order('created_at', { ascending: true });

          if (membersError) {
            console.error('Error fetching team members:', membersError);
          } else {
            setTeamMembers(members as TeamMember[]);
          }
        }
      } else {
        setClinicTeam(null);
        setTeamMembers([]);
      }
    } catch (err) {
      console.error('Error in fetchClinicTeam:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [psychologist?.id]);

  useEffect(() => {
    fetchClinicTeam();
  }, [fetchClinicTeam]);

  const inviteMember = useCallback(async (
    email: string,
    role: 'admin' | 'psychologist' | 'assistant' | 'admin_staff'
  ) => {
    if (!clinicTeam || !psychologist?.id) {
      throw new Error('No hay equipo de clínica disponible');
    }

    if (!clinicTeam.is_admin) {
      throw new Error('Solo el administrador puede invitar miembros');
    }

    try {
      // Verificar si el email ya tiene cuenta
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('email', email)
        .eq('user_type', 'psychologist')
        .single();

      if (!profile) {
        throw new Error('El email no está registrado como psicólogo en la plataforma');
      }

      // Verificar si ya es miembro
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('clinic_team_id', clinicTeam.id)
        .eq('psychologist_id', profile.id)
        .single();

      if (existingMember) {
        throw new Error('Este profesional ya es miembro del equipo');
      }

      // Verificar límite de profesionales
      if (clinicTeam.current_professionals_count >= clinicTeam.max_professionals) {
        throw new Error('Se ha alcanzado el límite de profesionales. Contacta soporte para agregar más.');
      }

      // Invitar miembro
      const { error: inviteError } = await supabase
        .from('team_members')
        .insert({
          clinic_team_id: clinicTeam.id,
          psychologist_id: profile.id,
          role,
          status: 'pending',
          invited_by: psychologist.id,
          invited_at: new Date().toISOString()
        });

      if (inviteError) {
        throw inviteError;
      }

      toast({
        title: 'Invitación enviada',
        description: `Se ha invitado a ${email} al equipo.`
      });

      await fetchClinicTeam();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al invitar miembro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [clinicTeam, psychologist?.id, fetchClinicTeam]);

  const updateMemberRole = useCallback(async (
    memberId: string,
    role: 'admin' | 'psychologist' | 'assistant' | 'admin_staff'
  ) => {
    if (!clinicTeam || !clinicTeam.is_admin) {
      throw new Error('Solo el administrador puede actualizar roles');
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId)
        .eq('clinic_team_id', clinicTeam.id);

      if (error) throw error;

      toast({
        title: 'Rol actualizado',
        description: 'El rol del miembro ha sido actualizado correctamente.'
      });

      await fetchClinicTeam();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rol';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [clinicTeam, fetchClinicTeam]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!clinicTeam || !clinicTeam.is_admin) {
      throw new Error('Solo el administrador puede remover miembros');
    }

    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (member?.role === 'admin') {
        throw new Error('No se puede remover al administrador principal');
      }

      const { error } = await supabase
        .from('team_members')
        .update({ status: 'inactive' })
        .eq('id', memberId)
        .eq('clinic_team_id', clinicTeam.id);

      if (error) throw error;

      toast({
        title: 'Miembro removido',
        description: 'El miembro ha sido removido del equipo.'
      });

      await fetchClinicTeam();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al remover miembro';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [clinicTeam, teamMembers, fetchClinicTeam]);

  const updatePermissions = useCallback(async (
    memberId: string,
    permissions: Record<string, any>
  ) => {
    if (!clinicTeam || !clinicTeam.is_admin) {
      throw new Error('Solo el administrador puede actualizar permisos');
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ permissions })
        .eq('id', memberId)
        .eq('clinic_team_id', clinicTeam.id);

      if (error) throw error;

      toast({
        title: 'Permisos actualizados',
        description: 'Los permisos han sido actualizados correctamente.'
      });

      await fetchClinicTeam();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar permisos';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [clinicTeam, fetchClinicTeam]);

  const createClinicTeam = useCallback(async (name: string) => {
    if (!psychologist?.id) {
      throw new Error('No hay psicólogo autenticado');
    }

    if (psychologist.plan_type?.toLowerCase() !== 'clinicas') {
      throw new Error('Solo los usuarios con Plan Clínicas pueden crear equipos');
    }

    try {
      const { data: teamData, error: createError } = await supabase
        .from('clinic_teams')
        .insert({
          admin_psychologist_id: psychologist.id,
          name,
          plan_type: 'clinicas',
          max_professionals: 4,
          current_professionals_count: 1,
          subscription_status: 'active'
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!teamData) throw new Error('No se pudo crear el equipo');

      if (createError) throw createError;

      // Agregar al admin como miembro
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          clinic_team_id: teamData.id,
          psychologist_id: psychologist.id,
          role: 'admin',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        // Si falla agregar el miembro, eliminar el equipo creado
        await supabase.from('clinic_teams').delete().eq('id', teamData.id);
        throw memberError;
      }

      toast({
        title: 'Equipo creado',
        description: `El equipo "${name}" ha sido creado correctamente.`
      });

      await fetchClinicTeam();
      return teamData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear equipo';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [psychologist, fetchClinicTeam]);

  return {
    clinicTeam,
    teamMembers,
    loading,
    error,
    inviteMember,
    updateMemberRole,
    removeMember,
    updatePermissions,
    createClinicTeam,
    refreshTeam: fetchClinicTeam
  };
};

