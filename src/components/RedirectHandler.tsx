import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import NotFound from '@/pages/NotFound';

const RedirectHandler = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectFound, setRedirectFound] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        // Extract alias from pathname (remove leading slash)
        const alias = location.pathname.slice(1);
        
        // Skip if no alias or if it's a known route or contains slashes
        if (!alias || alias.includes('/') || alias.includes('.')) {
          setIsLoading(false);
          return;
        }

        // Check if this specific alias exists
        const response = await fetch(`/api/redirects`);
        if (response.ok) {
          const redirects = await response.json();
          const redirect = redirects.find((r: any) => r.alias === alias && r.isActive);
          
          if (redirect) {
            setRedirectFound(true);
            // Perform the redirect immediately
            window.location.replace(redirect.targetUrl);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking redirect:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRedirect();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-purple mx-auto mb-4" />
          <p className="text-soft-white">Verificando redirecionamento...</p>
        </div>
      </div>
    );
  }

  if (redirectFound) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-purple mx-auto mb-4" />
          <p className="text-soft-white">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // If no redirect found, show 404
  return <NotFound />;
};

export default RedirectHandler;