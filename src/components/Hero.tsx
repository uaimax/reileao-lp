import { useState, useEffect } from 'react';
import { useLandingData } from '@/hooks/use-landing-data';

const Hero = () => {
  const { data: landingData } = useLandingData();
  const [daysCounter, setDaysCounter] = useState('Calculando...');
  const [eventStarted, setEventStarted] = useState(false);

  const eventData = landingData?.event;

  useEffect(() => {
    const updateCountdown = () => {
      // Usar a data do evento ou uma data padrão
      const targetDateString = eventData?.eventCountdownTarget || '2025-12-31T14:59:00';
      const targetDate = new Date(targetDateString);
      const now = new Date();
      const timeDiff = targetDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setEventStarted(true);
        return;
      }

      setEventStarted(false);
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      const daysText = days === 1 ? 'dia' : 'dias';
      const hoursText = hours === 1 ? 'hora' : 'horas';
      const minutesText = minutes === 1 ? 'minuto' : 'minutos';

      setDaysCounter(`Faltam apenas ${days} ${daysText}, ${hours} ${hoursText}, ${minutes} ${minutesText}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [eventData?.eventCountdownTarget]);

  // Definir título da página dinamicamente
  useEffect(() => {
    if (eventData?.eventTitle) {
      document.title = eventData.eventTitle;
    }
  }, [eventData?.eventTitle]);


  return (
    <section className="hero-section">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          <div style={{ color: 'var(--yellow-vibrant)' }}>RÉVEILLON em Uberlândia</div>
          <div>com Luan e Adriana</div>
        </h1>
        <p className="hero-subtitle">
          {eventData?.eventDateDisplay || '31/12/2025 a 04/01/2026'} – {eventData?.eventTagline || 'liberdade, conexão e muita dança.'}
        </p>
        <div className="days-counter">
          {eventStarted ? (
            <div className="days-counter-badge">
              <span>✨</span>
              <span>O evento já começou!</span>
            </div>
          ) : (
            <div className="days-counter-badge">
              <span>⏰</span>
              <span>{daysCounter}</span>
            </div>
          )}
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="scroll-indicator-inner">
          <div className="scroll-indicator-dot"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
