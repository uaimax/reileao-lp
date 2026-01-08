
import Hero from '@/components/Hero';
import Entenda from '@/components/Entenda';
import Contador from '@/components/Contador';
import Artistas from '@/components/Artistas';
import Depoimentos from '@/components/Depoimentos';
import Cidade from '@/components/Cidade';
import FAQ from '@/components/FAQ';
import Participar from '@/components/Participar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/ui/whatsapp-float';
import { useLandingData } from '@/hooks/use-landing-data';
import { usePageTracking, useMetaPixelTracking } from '@/hooks/use-meta-pixel';
import { useEffect } from 'react';

const Index = () => {
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  // Meta Pixel tracking
  usePageTracking('Landing Page');
  const { trackViewContent, trackCustomEvent } = useMetaPixelTracking();

  // Verificar se há redirecionamento temporário configurado
  useEffect(() => {
    if (eventData?.temporaryRedirectUrl) {
      // Redirecionar apenas se estivermos na página principal "/"
      if (window.location.pathname === '/') {
        window.location.href = eventData.temporaryRedirectUrl;
      }
    }
  }, [eventData?.temporaryRedirectUrl]);

  // Track landing page content view
  useEffect(() => {
    if (eventData?.eventTitle) {
      trackViewContent(eventData.eventTitle, ['landing-page']);
      trackCustomEvent('LandingPageView', {
        content_name: eventData.eventTitle,
        content_category: 'event',
        event_name: eventData.eventTitle,
        event_date: eventData.eventDateDisplay
      });
    }
  }, [eventData, trackViewContent, trackCustomEvent]);

  // Se há redirecionamento configurado, não renderizar o conteúdo
  if (eventData?.temporaryRedirectUrl) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple mx-auto mb-4"></div>
          <p className="text-soft-white">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen scroll-smooth">
      <Hero />
      <Entenda />
      <Contador />
      <Artistas />
      <Depoimentos />
      <Cidade />
      <FAQ />
      <Participar />
      <Footer />

      <WhatsAppFloat
        phoneNumber={eventData?.whatsappNumber}
        message={eventData?.whatsappMessage}
        enabled={eventData?.whatsappEnabled}
      />
    </div>
  );
};

export default Index;
