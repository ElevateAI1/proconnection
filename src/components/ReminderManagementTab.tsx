
import { ReminderSystemMonitor } from './ReminderSystemMonitor';
import { AppointmentReminderValidator } from './AppointmentReminderValidator';
import { MissingReminderRecovery } from './MissingReminderRecovery';
import { ReminderSystemAnalyzer } from './ReminderSystemAnalyzer';

export const ReminderManagementTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Gestión Completa de Recordatorios
        </h2>
        <p className="text-slate-600">
          Sistema completo de análisis, validación, recuperación y monitoreo de recordatorios WhatsApp.
        </p>
      </div>
      
      {/* Sistema de Análisis */}
      <ReminderSystemAnalyzer />
      
      {/* Recuperación de Recordatorios Faltantes */}
      <MissingReminderRecovery />
      
      {/* Validador de Recordatorios */}
      <AppointmentReminderValidator />
      
      {/* Monitor del Sistema */}
      <ReminderSystemMonitor />
    </div>
  );
};
