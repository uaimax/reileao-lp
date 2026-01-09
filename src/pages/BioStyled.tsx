import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, ExternalLink } from 'lucide-react';
import WhatsAppFloat from '@/components/ui/whatsapp-float';
import { handleLinkClick } from '@/utils/link-handler';
import { SITE_NAME, getSiteNameWithYear, getCopyrightText, getWhatsAppMessage, getRegistrationUrl } from '@/lib/site-config';

interface BioLink {
  id: number;
  title: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  isScheduled: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
}

interface BioConfig {
  id: number;
  eventLogoUrl?: string;
  showEventDate: boolean;
  showTrailerButton: boolean;
  bioTitle?: string;
  bioSubtitle?: string;
}

interface EventData {
  eventTitle?: string;
  eventSubtitle?: string;
  eventDateDisplay?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  whatsappEnabled?: boolean;
}

interface AboutData {
  trailerVideoUrl?: string;
  trailerButtonText?: string;
}

const BioStyled = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [bioLinks, setBioLinks] = useState<BioLink[]>([]);
  const [bioConfig, setBioConfig] = useState<BioConfig | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loadingBio, setLoadingBio] = useState(true);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    console.log('🚀 BioStyled component mounted');

    const fetchBioData = async () => {
      try {
        setLoadingBio(true);
        console.log('🔄 Fetching bio data...');

        const [linksResponse, configResponse] = await Promise.all([
          fetch('/api/bio-links'),
          fetch('/api/bio-config')
        ]);

        if (linksResponse.ok) {
          const links = await linksResponse.json();
          console.log('✅ Bio links loaded:', links.length);
          setBioLinks(links);
        } else {
          console.warn('⚠️ Bio links API failed, using fallback');
          setBioLinks([
            { id: 1, title: `🎫 Inscrições ${eventData?.eventTitle || getSiteNameWithYear('2025')}`, url: getRegistrationUrl(), displayOrder: 1, isActive: true, isScheduled: false },
            { id: 2, title: '📍 Localização', url: 'https://maps.google.com', displayOrder: 2, isActive: true, isScheduled: false }
          ]);
        }

        if (configResponse.ok) {
          const config = await configResponse.json();
          console.log('✅ Bio config loaded:', config);
          setBioConfig(config);
        } else {
          console.warn('⚠️ Bio config API failed, using defaults');
          setBioConfig({ id: 1, showEventDate: true, showTrailerButton: true });
        }
      } catch (error) {
        console.error('❌ Error fetching bio data:', error);
        setBioLinks([
          { id: 1, title: `🎫 Inscrições ${eventData?.eventTitle || getSiteNameWithYear('2025')}`, url: getRegistrationUrl(), displayOrder: 1, isActive: true, isScheduled: false },
          { id: 2, title: '📍 Localização', url: 'https://maps.google.com', displayOrder: 2, isActive: true, isScheduled: false }
        ]);
        setBioConfig({ id: 1, showEventDate: true, showTrailerButton: true });
      } finally {
        setLoadingBio(false);
      }
    };

    const fetchEventData = async () => {
      try {
        setLoadingEvent(true);
        console.log('🔄 Fetching event data...');

        const response = await fetch('/api/landing-data');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Event data loaded');
          setEventData(data.event);
          setAboutData(data.about);
        } else {
          throw new Error('Event API failed');
        }
      } catch (error) {
        console.warn('⚠️ Event data API failed, using defaults:', error);
        setEventData({
          eventTitle: getSiteNameWithYear('2025'),
          eventSubtitle: 'UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO',
          eventDateDisplay: '5–7 SET 2025, Uberlândia–MG',
          whatsappEnabled: true,
          whatsappNumber: '5534999999999',
          whatsappMessage: getWhatsAppMessage()
        });
        setAboutData({
          trailerVideoUrl: 'https://www.youtube.com/embed/5Q7hGUc3fMY?autoplay=1&mute=1',
          trailerButtonText: 'Veja um breve trailer'
        });
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchBioData();
    fetchEventData();
  }, []);

  const handleBioLinkClick = async (link: BioLink) => {
    const trackClick = async () => {
      try {
        console.log('🔗 Tracking click for:', link.title);
        await fetch('/api/bio-analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bioLinkId: link.id,
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }),
        });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    };

    // Usar o utilitário robusto para abrir links
    await handleLinkClick(link.url, link.title, trackClick);
  };

  const isLinkVisible = (link: BioLink) => {
    if (!link.isActive) return false;

    if (link.isScheduled && link.scheduleStart && link.scheduleEnd) {
      const now = new Date();
      const start = new Date(link.scheduleStart);
      const end = new Date(link.scheduleEnd);
      return now >= start && now <= end;
    }

    return true;
  };

  const visibleLinks = bioLinks
    .filter(isLinkVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Removido loading state que estava impedindo a renderização

  const displayTitle = (bioConfig?.bioTitle && bioConfig.bioTitle.trim()) || eventData?.eventTitle || SITE_NAME;
  const displaySubtitle = (bioConfig?.bioSubtitle && bioConfig.bioSubtitle.trim()) || eventData?.eventSubtitle || 'UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO';
  const displayDate = eventData?.eventDateDisplay || '5–7 SET 2025, Uberlândia–MG';

  useEffect(() => {
    document.title = `${displayTitle} - Links`;
  }, [displayTitle]);

  console.log('🎨 Rendering BioStyled with', visibleLinks.length, 'links');

  return (
    <div className="min-h-screen">
      {/* Background with same gradient as landing page */}
      <div className="hero-gradient absolute inset-0 z-0" />

      <div className="relative z-10">
        <div className="section-container py-12">
          <div className="max-w-md mx-auto">

            {/* Event Logo */}
            {bioConfig?.eventLogoUrl && (
              <div className="flex justify-center mb-8 animate-fade-in">
                <div className="w-32 h-32 rounded-full overflow-hidden glass-effect p-1">
                  <img
                    src={bioConfig.eventLogoUrl}
                    alt="Logo do evento"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Event Info */}
            <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-4">
                {displayTitle}
              </h1>
              <p className="text-lg md:text-xl text-text-gray mb-4">
                {displaySubtitle}
              </p>

              {bioConfig?.showEventDate && (
                <p className="text-neon-cyan text-lg font-bold animate-glow-intensify">
                  {displayDate}
                </p>
              )}
            </div>

            {/* Trailer Button */}
            {bioConfig?.showTrailerButton && aboutData?.trailerVideoUrl && (
              <div className="mb-12 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
                  <DialogTrigger asChild>
                    <button className="btn-neon text-white font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 text-lg hover:scale-105 transition-all duration-300">
                      <Play className="w-6 h-6" />
                      {aboutData?.trailerButtonText || "Veja um breve trailer"}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md w-full p-2 bg-black/90 border-neon-magenta/20">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Trailer {SITE_NAME}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-[9/16] w-full">
                      <iframe
                        src={aboutData.trailerVideoUrl}
                        title={`Trailer ${SITE_NAME}`}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Bio Links */}
            <div className="space-y-4">
              {visibleLinks.length === 0 ? (
                <div className="text-center py-12 animate-fade-in">
                  <p className="text-white text-lg mb-4">🔗 Links serão carregados em breve...</p>
                  <div className="space-y-3">
                    <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-auto border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white font-bold py-6 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                      🎫 Inscrições {eventData?.eventTitle || getSiteNameWithYear('2025')}
                    </button>
                    <button className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-auto border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white font-bold py-6 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                      📍 Localização do Evento
                    </button>
                  </div>
                </div>
              ) : (
                visibleLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <button
                      onClick={() => handleBioLinkClick(link)}
                      className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-auto border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white font-bold py-6 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                    >
                      <span className="flex-1 text-center text-lg">{link.title}</span>
                      <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity text-neon-magenta" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <p className="text-text-gray text-sm">{getCopyrightText('2025')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Float */}
      {eventData?.whatsappEnabled && (
        <WhatsAppFloat
          phoneNumber={eventData?.whatsappNumber}
          message={eventData?.whatsappMessage}
          enabled={eventData?.whatsappEnabled}
        />
      )}
    </div>
  );
};

export default BioStyled;