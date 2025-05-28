
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailVerificationNoticeProps {
  email: string;
  onClose: () => void;
}

export const EmailVerificationNotice = ({ email, onClose }: EmailVerificationNoticeProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-800">
            ¡Verifica tu email!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-slate-600">
              Te hemos enviado un email de verificación a:
            </p>
            <p className="font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-md">
              {email}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Importante</span>
            </div>
            <p className="text-sm text-yellow-700">
              Debes hacer clic en el enlace del email antes de poder iniciar sesión en tu cuenta.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Revisa tu bandeja de entrada</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Revisa tu carpeta de spam</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Haz clic en el enlace de verificación</span>
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Entendido
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
