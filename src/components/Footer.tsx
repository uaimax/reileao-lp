import { useLandingData } from '@/hooks/use-landing-data';

const Footer = () => {
  const { data: landingData } = useLandingData();
  const footerData = landingData?.footer;
  const eventData = landingData?.event;

  // Usa título do evento como fonte principal
  const displayTitle = eventData?.eventTitle || footerData?.eventTitle || 'Réveillon em Uberlândia';
  // Copyright sempre usa o título do evento para consistência
  const displayCopyright = `© 2025 ${displayTitle}. Todos os direitos reservados.`;

  return (
    <footer>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="footer-brand">
            {displayTitle}
          </h3>
        </div>
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">Termos</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
        </div>
        <p className="footer-copyright">
          {displayCopyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
