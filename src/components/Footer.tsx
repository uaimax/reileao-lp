
import { useLandingData } from '@/hooks/use-landing-data';

const Footer = () => {
  const { data: landingData } = useLandingData();
  const footerData = landingData?.footer;
  const eventData = landingData?.event;
  return (
    <footer className="py-12 border-t border-neon-purple/20">
      <div className="section-container">
        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold gradient-text neon-glow mb-4">
              {footerData?.eventTitle || "UAIZOUK 2025"}
            </h3>
            <p className="text-text-gray text-lg">
              {footerData?.eventDescription || "Uma imersão completa nas possibilidades do Zouk Brasileiro"}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-neon-cyan font-bold">{eventData?.eventDateDisplay || "05 a 07 de Setembro"}</p>
              <p className="text-text-gray">{footerData?.eventLocation || "Uberlândia, MG"}</p>
            </div>
            
            <div className="w-px h-12 bg-neon-purple/30 hidden md:block"></div>
            
            <div className="text-center">
              <p className="text-neon-magenta font-bold">{footerData?.venueName || "Recanto da Lua"}</p>
              <p className="text-text-gray">{footerData?.venueArea || "Chácaras Panorama"}</p>
            </div>
          </div>
          
          <div className="border-t border-neon-purple/20 pt-8">
            <p className="text-text-gray text-sm">
              {footerData?.copyrightText || "© 2025 UAIZOUK. Todos os direitos reservados."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
