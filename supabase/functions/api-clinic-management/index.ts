import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]

    console.log(`Clinic Management: ${req.method} ${url.pathname}`)

    switch (req.method) {
      case 'GET':
        if (action === 'team') {
          // Obtener equipo del psicólogo
          const { data: team, error: teamError } = await supabase.rpc('get_clinic_team', {
            psychologist_id: user.id
          })

          if (teamError) {
            return new Response(
              JSON.stringify({ error: teamError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ data: team }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'members') {
          const teamId = url.searchParams.get('team_id')
          if (!teamId) {
            return new Response(
              JSON.stringify({ error: 'team_id is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

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
            .eq('clinic_team_id', teamId)

          if (membersError) {
            return new Response(
              JSON.stringify({ error: membersError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ data: members }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'POST':
        if (action === 'invite') {
          const { email, role, team_id } = await req.json()

          if (!email || !role || !team_id) {
            return new Response(
              JSON.stringify({ error: 'email, role, and team_id are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Verificar que el usuario es admin del equipo
          const { data: team } = await supabase
            .from('clinic_teams')
            .select('admin_psychologist_id')
            .eq('id', team_id)
            .single()

          if (!team || team.admin_psychologist_id !== user.id) {
            return new Response(
              JSON.stringify({ error: 'Only team admin can invite members' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Buscar psicólogo por email
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_type')
            .eq('email', email)
            .eq('user_type', 'psychologist')
            .single()

          if (!profile) {
            return new Response(
              JSON.stringify({ error: 'Psychologist not found with this email' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Verificar límite
          const { data: teamData } = await supabase
            .from('clinic_teams')
            .select('max_professionals, current_professionals_count')
            .eq('id', team_id)
            .single()

          if (teamData && teamData.current_professionals_count >= teamData.max_professionals) {
            return new Response(
              JSON.stringify({ error: 'Professional limit reached' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Invitar miembro
          const { data: member, error: inviteError } = await supabase
            .from('team_members')
            .insert({
              clinic_team_id: team_id,
              psychologist_id: profile.id,
              role,
              status: 'pending',
              invited_by: user.id,
              invited_at: new Date().toISOString()
            })
            .select()
            .single()

          if (inviteError) {
            return new Response(
              JSON.stringify({ error: inviteError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ data: member }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PUT':
        const memberId = pathSegments[pathSegments.length - 1]
        if (!memberId) {
          return new Response(
            JSON.stringify({ error: 'member_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { role, permissions, status: memberStatus } = await req.json()

        // Verificar que el usuario es admin
        const { data: memberData } = await supabase
          .from('team_members')
          .select('clinic_team_id, clinic_teams!inner(admin_psychologist_id)')
          .eq('id', memberId)
          .single()

        if (!memberData || (memberData as any).clinic_teams.admin_psychologist_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only team admin can update members' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData: any = {}
        if (role) updateData.role = role
        if (permissions) updateData.permissions = permissions
        if (memberStatus) updateData.status = memberStatus

        const { data: updatedMember, error: updateError } = await supabase
          .from('team_members')
          .update(updateData)
          .eq('id', memberId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ data: updatedMember }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        const deleteMemberId = pathSegments[pathSegments.length - 1]
        if (!deleteMemberId) {
          return new Response(
            JSON.stringify({ error: 'member_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verificar que el usuario es admin
        const { data: deleteMemberData } = await supabase
          .from('team_members')
          .select('clinic_team_id, role, clinic_teams!inner(admin_psychologist_id)')
          .eq('id', deleteMemberId)
          .single()

        if (!deleteMemberData || (deleteMemberData as any).clinic_teams.admin_psychologist_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only team admin can remove members' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if ((deleteMemberData as any).role === 'admin') {
          return new Response(
            JSON.stringify({ error: 'Cannot remove main admin' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabase
          .from('team_members')
          .update({ status: 'inactive' })
          .eq('id', deleteMemberId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Member removed successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in clinic management:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

