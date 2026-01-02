
import { WhatsAppReminderTester } from './WhatsAppReminderTester';

export const ReminderTestingTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Pruebas del Sistema de Recordatorios
        </h2>
        <p className="text-slate-600">
          Utiliza esta herramienta para probar el sistema completo de recordatorios de WhatsApp.
        </p>
      </div>
      
      <WhatsAppReminderTester />
    </div>
  );
};
