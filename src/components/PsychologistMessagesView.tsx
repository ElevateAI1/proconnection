import { useState } from "react";
import { PsychologistChatList } from "./psychologist/PsychologistChatList";
import { PsychologistChat } from "./psychologist/PsychologistChat";

export const PsychologistMessagesView = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="lg:col-span-1">
        <PsychologistChatList
          onSelectConversation={setSelectedPatientId}
          selectedPatientId={selectedPatientId}
        />
      </div>
      <div className="lg:col-span-2 hidden lg:block">
        {selectedPatientId ? (
          <PsychologistChat patientId={selectedPatientId} />
        ) : (
          <div className="h-full flex items-center justify-center bg-white-warm rounded-lg border-2 border-celeste-gray/30">
            <div className="text-center p-6">
              <p className="text-blue-petrol/70 font-medium">Selecciona una conversación</p>
              <p className="text-sm text-blue-petrol/60 mt-1">Elige un paciente para ver los mensajes</p>
            </div>
          </div>
        )}
      </div>
      {selectedPatientId && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white-warm">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <button
                onClick={() => setSelectedPatientId(undefined)}
                className="text-blue-petrol hover:text-blue-petrol/80"
              >
                ← Volver a conversaciones
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PsychologistChat patientId={selectedPatientId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

