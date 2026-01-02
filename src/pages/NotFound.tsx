
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-white">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Página no encontrada
        </h1>
        
        <p className="text-slate-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg flex items-center gap-2">
              <Home size={20} />
              Ir al Inicio
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Regresar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
