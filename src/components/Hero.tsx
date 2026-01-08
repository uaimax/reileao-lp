import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';
import { useMetaPixelTracking, useButtonTracking } from '@/hooks/use-meta-pixel';

const Hero = () => {
  const { data: landingData, isLoading } = useLandingData();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const eventData = landingData?.event;
  const heroData = landingData?.hero;

  // Meta Pixel tracking
  const { trackLead, trackCustomEvent } = useMetaPixelTracking();
  const { trackButtonClick } = useButtonTracking();

  useEffect(() => {
    // Usar a data do evento ou uma data padrão futura
    const targetDateString = eventData?.eventCountdownTarget || '2025-09-05T17:00:00.000Z';

    let targetDate = new Date(targetDateString);

    // Se a data é inválida, usar a data padrão
    if (isNaN(targetDate.getTime())) {
      console.warn('Invalid countdown target date, using default');
      targetDate = new Date('2025-09-05T17:00:00.000Z');
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventData?.eventCountdownTarget]);

  // Definir título da página dinamicamente
  useEffect(() => {
    if (eventData?.eventTitle) {
      document.title = `${eventData.eventTitle} - Uma imersão nas possibilidades do Zouk Brasileiro`;
    }
  }, [eventData?.eventTitle]);

  const convertToEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;

    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=0`;
    }

    return url;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Optimized Video Background - YOLO Performance */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src={eventData?.heroVideoUrl ? convertToEmbedUrl(eventData.heroVideoUrl) : "https://www.youtube.com/embed/U2QPiVaMAVc?autoplay=1&mute=1&loop=1&playlist=U2QPiVaMAVc&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=0"}
          className="w-full h-full object-cover opacity-20"
          style={{
            minWidth: '100%',
            minHeight: '100%',
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1.5)',
            pointerEvents: 'none'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title="Hero Background Video"
        />
      </div>

      {/* Existing gradient overlay */}
      <div className="hero-gradient absolute inset-0"></div>

      {/* Existing content - keeping everything exactly the same */}
      <div className="section-container relative z-10 text-center animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6 animate-slide-up">
            <Calendar className="w-4 h-4 text-neon-cyan" />
            <p className="text-soft-white text-base font-medium tracking-wide uppercase">
              {eventData?.eventDateDisplay || "5–7 SET 2025, Uberlândia–MG"}
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <span className="gradient-text neon-glow">{eventData?.eventTitle || "UAIZOUK 2025"}</span>
          </h1>

          <div className="space-y-4 mb-8">
            <p className="text-text-gray text-lg font-medium animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {eventData?.eventTagline || "Muita aula. Muita dança. Muito Zouk."}
            </p>
            <p className="text-soft-white text-xl md:text-2xl font-bold animate-slide-up" style={{ animationDelay: '0.6s' }}>
              {eventData?.eventSubtitle || "UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <Button
            onClick={() => {
              trackButtonClick('QUERO SABER MAIS', 'cta');
              trackCustomEvent('HeroCTAClick', {
                content_name: 'QUERO SABER MAIS',
                content_category: 'cta',
                button_text: heroData?.ctaPrimaryText || "QUERO SABER MAIS",
                event_name: eventData?.eventTitle || 'UAIZOUK',
                cta_type: 'primary'
              });
              scrollToSection('entenda');
            }}
            className="btn-neon text-white font-bold py-4 px-8 rounded-full text-lg transform transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Saiba mais sobre o evento"
          >
            {heroData?.ctaPrimaryText || "QUERO SABER MAIS"}
          </Button>
          <Button
            onClick={() => {
              trackButtonClick('ARTISTAS CONFIRMADOS', 'cta');
              trackCustomEvent('HeroCTAClick', {
                content_name: 'ARTISTAS CONFIRMADOS',
                content_category: 'cta',
                button_text: heroData?.ctaSecondaryText || "ARTISTAS CONFIRMADOS",
                event_name: eventData?.eventTitle || 'UAIZOUK',
                cta_type: 'secondary'
              });
              scrollToSection('artistas');
            }}
            variant="outline"
            className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            aria-label="Ver artistas confirmados"
          >
            {heroData?.ctaSecondaryText || "ARTISTAS CONFIRMADOS"}
          </Button>
        </div>

        <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto animate-flip-in" style={{ animationDelay: '1s' }}>
          <p className="text-soft-white text-lg mb-6 font-medium">
            {eventData?.eventCountdownText || "A experiência completa inicia em:"}
          </p>

          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'DIAS', value: timeLeft.days },
              { label: 'HORAS', value: timeLeft.hours },
              { label: 'MIN', value: timeLeft.minutes },
              { label: 'SEG', value: timeLeft.seconds }
            ].map((item, index) => (
              <div key={item.label} className="animate-count-up" style={{ animationDelay: `${1.2 + index * 0.1}s` }}>
                <div className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-2 transition-all duration-300">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-text-gray text-sm font-medium tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Existing scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-neon-magenta rounded-full flex justify-center">
          <div className="w-1 h-3 bg-neon-magenta rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
