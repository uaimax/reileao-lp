import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const HowToGetSection = () => {
  const { data: landingData } = useLandingData();
  const locationData = landingData?.location;
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: 'white' }}>
      <div className="container" style={{ maxWidth: '56rem' }}>
        <h2 className="section-title">Como chegar</h2>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '0.5rem' }}>Uberlândia possui aeroporto próprio (50 min de São Paulo).</p>
          <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '0.5rem' }}>✔️ Carro (BR-050) – trajeto tranquilo</p>
          <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '0.5rem' }}>✔️ Ônibus (Buser, Levare etc.)</p>
          <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '0.5rem' }}>✔️ Uber/taxi até a chácara (~30 min do centro)</p>
        </div>
        <div className="map-container">
          <a href="https://maps.app.goo.gl/vTbzGSgfHNEGAG3c7" target="_blank" rel="noopener noreferrer">
            <img
              src="/assets/reveillon/map.png"
              alt="Mapa do Espaço Atrium Eventos"
              className="map-image"
            />
          </a>
          <p style={{ fontSize: '1.125rem', color: '#374151', fontWeight: '500', marginTop: '1rem' }}>Espaço Atrium Eventos - Uberlândia, MG</p>
        </div>
      </div>
    </section>
  );
};

export default HowToGetSection;

