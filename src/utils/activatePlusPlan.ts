import { supabase } from '@/integrations/supabase/client';

type PlanType = 'starter' | 'proconnection' | 'teams' | 'dev';

/**
 * Activa un plan para el psicólogo actual
 */
export const activatePlan = async (planType: PlanType) => {
  try {
    // Validar que el planType sea válido
    if (!['starter', 'proconnection', 'teams', 'dev'].includes(planType)) {
      throw new Error(`Tipo de plan inválido: ${planType}`);
    }

    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No se pudo obtener el usuario actual');
    }

    console.log(`=== ACTIVATING ${planType.toUpperCase()} PLAN ===`);
    console.log('User ID:', user.id);

    // Obtener el perfil del psicólogo
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .single();

    if (!profile || profile.user_type !== 'psychologist') {
      throw new Error('El usuario no es un psicólogo');
    }

    // Actualizar el plan_type
    const { error: updateError } = await supabase
      .from('psychologists')
      .update({ plan_type: planType })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating plan:', updateError);
      throw updateError;
    }

    console.log(`✅ Plan ${planType} activado correctamente`);

    // Disparar evento para refrescar las capacidades
    window.dispatchEvent(new CustomEvent('planUpdated'));
    window.dispatchEvent(new CustomEvent('forceRefreshCapabilities'));

    return { success: true, message: `Plan ${planType} activado correctamente` };
  } catch (error) {
    console.error(`Error activating ${planType} plan:`, error);
    throw error;
  }
};

/**
 * Activa el plan Plus para el psicólogo actual (deprecated, usar activatePlan)
 * @deprecated Use activatePlan('proconnection') instead
 */
export const activatePlusPlan = async () => {
  return activatePlan('proconnection');
};

