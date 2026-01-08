import Hero from '@/components/Hero';
import Header from '@/components/reveillon/Header';
import WhySection from '@/components/reveillon/WhySection';
import BenefitsSection from '@/components/reveillon/BenefitsSection';
import ForWhoSection from '@/components/reveillon/ForWhoSection';
import ScheduleSection from '@/components/reveillon/ScheduleSection';
import HowToGetSection from '@/components/reveillon/HowToGetSection';
import VideoTestimonials from '@/components/reveillon/VideoTestimonials';
import FAQ from '@/components/FAQ';
import LastSpotsSection from '@/components/reveillon/LastSpotsSection';
import Footer from '@/components/Footer';
import CtaFixed from '@/components/ui/cta-fixed';
import BirdAnimation from '@/components/BirdAnimation';
import { useLandingData } from '@/hooks/use-landing-data';
import { usePageTracking, useMetaPixelTracking } from '@/hooks/use-meta-pixel';
import { useEffect } from 'react';
import '@/styles/landing-page.css';

// #region agent log
fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Index.tsx:16',message:'Index module loaded - all imports OK',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
// #endregion

const Index = () => {
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Index.tsx:24',message:'Index component rendering',data:{hasLandingData:!!landingData,hasEventData:!!eventData,temporaryRedirectUrl:eventData?.temporaryRedirectUrl||'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
  // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/fbe0bbdb-9d7a-4e37-88aa-b587899c232f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Index.tsx:52',message:'REDIRECT ACTIVE - showing loading',data:{redirectUrl:eventData.temporaryRedirectUrl},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-vibrant mx-auto mb-4"></div>
          <p className="text-black">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen scroll-smooth bg-white" style={{ backgroundColor: 'rgb(253, 253, 253)' }}>
      <Header />
      <BirdAnimation />
      <Hero />
      <WhySection />
      <BenefitsSection />
      <ForWhoSection />
      <ScheduleSection />
      <HowToGetSection />
      <VideoTestimonials />
      <FAQ />
      <LastSpotsSection />
      <Footer />
      <CtaFixed />
    </div>
  );
};

export default Index;
