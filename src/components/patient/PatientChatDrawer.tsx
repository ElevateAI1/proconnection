import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PatientChat } from "./PatientChat";

interface PatientChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  psychologistId?: string;
  psychologistName?: string;
  psychologistImage?: string | null;
}

export const PatientChatDrawer = ({
  open,
  onOpenChange,
  psychologistId,
  psychologistName,
  psychologistImage
}: PatientChatDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <div className="flex-1 overflow-hidden">
          {psychologistId ? (
            <PatientChat
              psychologistId={psychologistId}
              psychologistName={psychologistName}
              psychologistImage={psychologistImage}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <p className="text-blue-petrol/70">No hay psicólogo vinculado</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

