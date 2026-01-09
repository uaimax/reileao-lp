import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, ExternalLink } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';
import WhatsAppFloat from '@/components/ui/whatsapp-float';
import { handleLinkClick } from '@/utils/link-handler';
import { SITE_NAME, getSiteNameWithYear, getCopyrightText, getRegistrationUrl, INSTAGRAM_URL } from '@/lib/site-config';

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

const Bio = () => {
  const { data: landingData, isLoading } = useLandingData();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [bioLinks, setBioLinks] = useState<BioLink[]>([]);
  const [bioConfig, setBioConfig] = useState<BioConfig | null>(null);
  const [loadingBio, setLoadingBio] = useState(true);

  const eventData = landingData?.event;
  const aboutData = landingData?.about;

  useEffect(() => {
    const fetchBioData = async () => {
      try {
        setLoadingBio(true);
        const [linksResponse, configResponse] = await Promise.all([
          fetch('/api/bio-links'),
          fetch('/api/bio-config')
        ]);

        if (linksResponse.ok) {
          const links = await linksResponse.json();
          setBioLinks(links);
        }

        if (configResponse.ok) {
          const config = await configResponse.json();
          setBioConfig(config);
        }
      } catch (error) {
        console.error('Error fetching bio data:', error);
        // Fallback data - use valores dinâmicos do site-config
        setBioLinks([
          { id: 1, title: `🎫 Inscrições ${eventData?.eventTitle || getSiteNameWithYear('2025')}`, url: eventData?.registrationUrl || getRegistrationUrl(), displayOrder: 1, isActive: true, isScheduled: false },
          { id: 2, title: '📍 Localização do Evento', url: '#localizacao', displayOrder: 2, isActive: true, isScheduled: false },
          { id: 3, title: '🏨 Hospedagem Recomendada', url: '#hospedagem', displayOrder: 3, isActive: true, isScheduled: false },
          ...(INSTAGRAM_URL ? [{ id: 4, title: '📱 Instagram Oficial', url: INSTAGRAM_URL, displayOrder: 4, isActive: true, isScheduled: false }] : [])
        ]);
        setBioConfig({ id: 1, showEventDate: true, showTrailerButton: true });
      } finally {
        setLoadingBio(false);
      }
    };

    fetchBioData();
  }, []);

  const handleBioLinkClick = async (link: BioLink) => {
    const trackClick = async () => {
      try {
        // Track the click
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

  if (isLoading || loadingBio) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-soft-white text-lg">Carregando...</div>
      </div>
    );
  }

  const displayTitle = (bioConfig?.bioTitle && bioConfig.bioTitle.trim()) || eventData?.eventTitle || SITE_NAME;
  const displaySubtitle = (bioConfig?.bioSubtitle && bioConfig.bioSubtitle.trim()) || eventData?.eventSubtitle || 'UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO';
  const displayDate = eventData?.eventDateDisplay || '5–7 SET 2025, Uberlândia–MG';

  // Set document title for SEO
  useEffect(() => {
    document.title = `${displayTitle} - Links`;
  }, [displayTitle]);

  return (
    <div className="min-h-screen bg-dark-bg">

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Event Logo */}
        {bioConfig?.eventLogoUrl && (
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon-purple/30 shadow-lg">
              <img
                src={bioConfig.eventLogoUrl}
                alt="Logo do evento"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Event Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text neon-glow mb-2">
            {displayTitle}
          </h1>
          <p className="text-text-gray text-sm mb-3">
            {displaySubtitle}
          </p>

          {bioConfig?.showEventDate && (
            <p className="text-neon-cyan text-sm font-medium">
              {displayDate}
            </p>
          )}
        </div>

        {/* Trailer Button */}
        {bioConfig?.showTrailerButton && aboutData?.trailerVideoUrl && (
          <div className="mb-8">
            <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
              <DialogTrigger asChild>
                <button className="w-full bg-gradient-to-r from-neon-magenta to-neon-purple text-white font-bold py-4 px-6 rounded-full inline-flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300 shadow-lg">
                  <Play className="w-5 h-5" />
                  {aboutData?.trailerButtonText || "Veja um breve trailer"}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full p-2 bg-black/90 border-neon-magenta/20">
                <DialogHeader className="sr-only">
                  <DialogTitle>Trailer {eventData?.eventTitle || SITE_NAME}</DialogTitle>
                </DialogHeader>
                <div className="aspect-[9/16] w-full">
                  <iframe
                    src={aboutData.trailerVideoUrl}
                    title={`Trailer ${eventData?.eventTitle || SITE_NAME}`}
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
          {visibleLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleBioLinkClick(link)}
              className="w-full bg-dark-bg/80 backdrop-blur-sm border border-neon-purple/30 text-soft-white font-medium py-4 px-6 rounded-xl hover:border-neon-purple hover:bg-neon-purple/10 transition-all duration-300 flex items-center justify-between group"
            >
              <span className="flex-1 text-center">{link.title}</span>
              <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-text-gray text-xs">
          <p>{getCopyrightText('2025')}</p>
        </div>
      </div>

      {/* WhatsApp Float */}
      <WhatsAppFloat
        phoneNumber={eventData?.whatsappNumber}
        message={eventData?.whatsappMessage}
        enabled={eventData?.whatsappEnabled}
      />
    </div>
  );
};

export default Bio;