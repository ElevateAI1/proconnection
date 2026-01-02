
const baseUrl = 'https://scikpgzpgzevkgwwobrf.supabase.co/functions/v1';

export const API_DOCUMENTATION = {
  baseUrl,
  authentication: {
    header: 'x-api-key',
    description: 'Clave API requerida para todas las llamadas. Contacta al administrador para obtenerla.'
  },
  endpoints: {
    psychologists: {
      description: 'Gestión de psicólogos',
      endpoints: [
        {
          method: 'GET',
          path: '/api-psychologists',
          description: 'Listar todos los psicólogos',
          params: {
            page: 'Número de página (default: 1)',
            limit: 'Límite por página (default: 50)',
            status: 'Filtrar por estado: trial, active, expired, cancelled',
            plan: 'Filtrar por plan: plus, pro'
          },
          response: {
            data: 'Array de psicólogos',
            pagination: 'Información de paginación'
          }
        },
        {
          method: 'GET',
          path: '/api-psychologists/{id}',
          description: 'Obtener psicólogo específico',
          response: {
            data: 'Objeto psicólogo con información del perfil'
          }
        },
        {
          method: 'POST',
          path: '/api-psychologists',
          description: 'Crear nuevo psicólogo',
          body: {
            first_name: 'string (requerido)',
            last_name: 'string (requerido)',
            phone: 'string (opcional)',
            specialization: 'string (opcional)',
            license_number: 'string (opcional)',
            plan_type: 'starter | proconnection | teams (opcional, default: starter)',
            subscription_status: 'trial | active | expired | cancelled (opcional, default: trial)'
          },
          response: {
            data: 'Objeto psicólogo creado',
            auth_details: 'Credenciales temporales'
          }
        },
        {
          method: 'PUT',
          path: '/api-psychologists/{id}',
          description: 'Actualizar psicólogo',
          body: 'Campos a actualizar (opcionales)'
        },
        {
          method: 'DELETE',
          path: '/api-psychologists/{id}',
          description: 'Eliminar psicólogo y su cuenta'
        }
      ]
    },
    patients: {
      description: 'Gestión de pacientes',
      endpoints: [
        {
          method: 'GET',
          path: '/api-patients',
          description: 'Listar pacientes',
          params: {
            page: 'Número de página (default: 1)',
            limit: 'Límite por página (default: 50)',
            psychologist_id: 'Filtrar por psicólogo'
          }
        },
        {
          method: 'GET',
          path: '/api-patients/{id}',
          description: 'Obtener paciente específico'
        },
        {
          method: 'POST',
          path: '/api-patients',
          description: 'Crear nuevo paciente',
          body: {
            first_name: 'string (requerido)',
            last_name: 'string (requerido)',
            psychologist_id: 'string (requerido)',
            phone: 'string (opcional)',
            age: 'number (opcional)',
            notes: 'string (opcional)'
          }
        },
        {
          method: 'PUT',
          path: '/api-patients/{id}',
          description: 'Actualizar paciente'
        },
        {
          method: 'DELETE',
          path: '/api-patients/{id}',
          description: 'Eliminar paciente y su cuenta'
        }
      ]
    },
    accounts: {
      description: 'Gestión completa de cuentas (auth + perfil)',
      endpoints: [
        {
          method: 'POST',
          path: '/api-accounts/psychologist',
          description: 'Crear cuenta completa de psicólogo',
          body: {
            first_name: 'string (requerido)',
            last_name: 'string (requerido)',
            email: 'string (requerido)',
            phone: 'string (opcional)',
            specialization: 'string (opcional)',
            license_number: 'string (opcional)',
            plan_type: 'starter | proconnection | teams (opcional)',
            subscription_status: 'trial | active | expired | cancelled (opcional)'
          }
        },
        {
          method: 'POST',
          path: '/api-accounts/patient',
          description: 'Crear cuenta completa de paciente',
          body: {
            first_name: 'string (requerido)',
            last_name: 'string (requerido)',
            email: 'string (requerido)',
            psychologist_id: 'string (requerido)',
            phone: 'string (opcional)',
            age: 'number (opcional)',
            notes: 'string (opcional)'
          }
        },
        {
          method: 'DELETE',
          path: '/api-accounts/{user_id}',
          description: 'Eliminar cuenta completa (auth + perfil + datos relacionados)'
        }
      ]
    },
    subscriptions: {
      description: 'Gestión de suscripciones y planes',
      endpoints: [
        {
          method: 'PUT',
          path: '/api-subscriptions/{psychologist_id}/status',
          description: 'Cambiar estado de suscripción',
          body: {
            status: 'trial | active | expired | cancelled (requerido)',
            subscription_days: 'number (opcional, para status active)'
          }
        },
        {
          method: 'PUT',
          path: '/api-subscriptions/{psychologist_id}/plan',
          description: 'Cambiar tipo de plan',
          body: {
            plan_type: 'starter | proconnection | teams (requerido)'
          }
        },
        {
          method: 'POST',
          path: '/api-subscriptions/{psychologist_id}/extend',
          description: 'Extender trial o suscripción',
          body: {
            trial_days: 'number (opcional)',
            subscription_days: 'number (opcional)'
          }
        }
      ]
    },
    stats: {
      description: 'Estadísticas y reportes',
      endpoints: [
        {
          method: 'GET',
          path: '/api-stats/overview',
          description: 'Estadísticas generales de la plataforma'
        },
        {
          method: 'GET',
          path: '/api-stats/psychologists',
          description: 'Estadísticas detalladas de psicólogos'
        },
        {
          method: 'GET',
          path: '/api-stats/subscriptions',
          description: 'Análisis de suscripciones y planes'
        }
      ]
    }
  },
  examples: {
    curl: {
      listPsychologists: `curl -X GET "${baseUrl}/api-psychologists?page=1&limit=10" \\
  -H "x-api-key: YOUR_API_KEY"`,
      createPsychologist: `curl -X POST "${baseUrl}/api-psychologists" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+1234567890",
    "specialization": "Psicología Clínica",
    "plan_type": "pro"
  }'`,
      updateSubscription: `curl -X PUT "${baseUrl}/api-subscriptions/USER_ID/status" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "active",
    "subscription_days": 30
  }'`
    },
    javascript: {
      basicRequest: `const response = await fetch('${baseUrl}/api-psychologists', {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
      discordBot: `// Ejemplo para bot de Discord
const Discord = require('discord.js');

async function createPsychologist(interaction, firstName, lastName, email) {
  try {
    const response = await fetch('${baseUrl}/api-accounts/psychologist', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.PROCONNECTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        plan_type: 'starter'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      await interaction.reply(\`✅ Psicólogo creado exitosamente!
      📧 Email: \${result.data.email}
      🔑 Contraseña temporal: \${result.data.temp_password}
      👤 ID: \${result.data.user_id}\`);
    } else {
      await interaction.reply(\`❌ Error: \${result.error}\`);
    }
  } catch (error) {
    console.error(error);
    await interaction.reply('❌ Error interno del servidor');
  }
}`
    }
  }
};
