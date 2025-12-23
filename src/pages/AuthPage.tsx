import { UserTypeSelectionModal } from "@/components/UserTypeSelectionModal";

export const AuthPage = () => {
  const handleCloseModal = () => {
    // Si cierran sin seleccionar, el modal se cierra automáticamente
  };

  return (
    <UserTypeSelectionModal
      isOpen={true}
      onClose={handleCloseModal}
      redirectTo="auth"
    />
  );
};

