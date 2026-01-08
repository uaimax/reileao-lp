import { useLandingData } from '@/hooks/use-landing-data';
import { getSiteNameWithYear, getCopyrightText } from '@/lib/site-config';

const Footer = () => {
  const { data: landingData } = useLandingData();
  const footerData = landingData?.footer;
  const eventData = landingData?.event;

  return (
    <footer>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="footer-brand">
            {footerData?.eventTitle || getSiteNameWithYear('2025')}
          </h3>
        </div>
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">Termos</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
        </div>
        <p className="footer-copyright">
          {footerData?.copyrightText || getCopyrightText('2025')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
