import { useEffect, useState } from 'react';
import { useLandingData } from '@/hooks/use-landing-data';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappNumber = eventData?.whatsappNumber || '5513991737852';
  const whatsappMessage = eventData?.whatsappMessage || 'Olá! Gostaria de saber mais sobre o Réveillon em Uberlândia.';

  return (
    <header
      id="header"
      className={scrolled ? 'scrolled' : ''}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transition: 'all 0.3s'
      }}
    >
      <div className="container" style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ display: 'none' }}>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button"
            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
          >
            Converse com a Ju agora no WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;

