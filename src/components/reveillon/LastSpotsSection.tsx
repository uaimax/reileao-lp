import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const LastSpotsSection = () => {
  const { data: landingData } = useLandingData();
  const { ref, isVisible } = useScrollAnimation();
  const eventData = landingData?.event;
  const participationData = landingData?.participation;

  const progress = 70; // Pode vir do backend no futuro
  const whatsappNumber = eventData?.whatsappNumber || '5513991737852';
  const whatsappMessage = eventData?.whatsappMessage || 'Olá! Gostaria de saber mais sobre o Réveillon.';

  return (
    <section ref={ref} className={`last-spots-section animate-on-scroll ${isVisible ? 'visible' : ''}`}>
      <div className="container" style={{ maxWidth: '56rem', textAlign: 'center' }}>
        <h2 className="section-title">Últimas vagas</h2>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.25rem', color: '#1F2937', marginBottom: '0.5rem', fontWeight: '500' }}>⚠️ Quartos compartilhados limitados.</p>
          <p style={{ fontSize: '1.25rem', color: '#1F2937', marginBottom: '0.5rem', fontWeight: '500' }}>Garanta seu lugar antes que lote!</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p style={{ color: '#4B5563', fontWeight: '500' }}>{progress}% das vagas preenchidas</p>
        </div>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{ fontSize: '1.25rem', padding: '1.5rem 3rem', maxWidth: '28rem', margin: '0 auto' }}
        >
          Converse com a Ju agora no WhatsApp
        </a>
      </div>
    </section>
  );
};

export default LastSpotsSection;

