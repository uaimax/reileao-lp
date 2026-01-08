import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      {/* Background gradient similar to homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-purple-900/20 to-dark-bg"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-neon"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-magenta/10 rounded-full blur-3xl animate-pulse-neon" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse-neon" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* 404 Number with neon glow */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold gradient-text neon-glow animate-fade-in">
            404
          </h1>
        </div>

        {/* Error message */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-soft-white mb-4">
            Página não encontrada
          </h2>
          <p className="text-lg text-text-gray mb-2">
            Oops! A página que você está procurando não existe.
          </p>
          <p className="text-sm text-text-gray/70">
            Tentando acessar: <span className="text-neon-cyan font-mono">{location.pathname}</span>
          </p>
        </div>

        {/* Countdown section */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="glass-effect rounded-2xl p-6 mb-6 border border-white/10">
            <p className="text-text-gray mb-2">
              Redirecionando automaticamente para a página inicial em:
            </p>
            <div className="text-4xl font-bold gradient-text neon-glow animate-count-up">
              {countdown}
            </div>
            <p className="text-sm text-text-gray/70 mt-2">
              segundos
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            onClick={handleGoHome}
            className="btn-neon text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center gap-3 hover:scale-105 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Ir para página inicial agora
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-purple rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-neon-cyan rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-20 w-1 h-1 bg-neon-magenta rounded-full animate-pulse opacity-80" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default NotFound;
