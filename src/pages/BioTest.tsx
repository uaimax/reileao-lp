import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';
import { handleLinkClick } from '@/utils/link-handler';
import { SITE_NAME, getSiteNameWithYear, getCopyrightText, getRegistrationUrl, INSTAGRAM_URL } from '@/lib/site-config';

const BioTest = () => {
  console.log('🚀 BioTest component mounted');
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  const testLinks = [
    { id: 1, title: `🎫 Inscrições ${eventData?.eventTitle || getSiteNameWithYear('2025')}`, url: eventData?.registrationUrl || getRegistrationUrl() },
    { id: 2, title: '📍 Localização do Evento', url: 'https://maps.google.com' },
    { id: 3, title: '🏨 Hospedagem Recomendada', url: 'https://booking.com' },
    ...(INSTAGRAM_URL ? [{ id: 4, title: '📱 Instagram Oficial', url: INSTAGRAM_URL }] : []),
    { id: 5, title: '🎵 Playlist Spotify', url: 'https://spotify.com' }
  ];

  const handleBioLinkClick = (link: any) => {
    console.log('🔗 Link clicked:', link.title);
    handleLinkClick(link.url, link.title);
  };

  return (
    <div className="min-h-screen">
      {/* Background with same gradient as landing page */}
      <div className="hero-gradient absolute inset-0 z-0" />

      <div className="relative z-10">
        <div className="section-container py-12">
          <div className="max-w-md mx-auto">

            {/* Event Info */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-4">
                {eventData?.eventTitle || getSiteNameWithYear('2025')}
              </h1>
              <p className="text-lg md:text-xl text-text-gray mb-4">
                UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO
              </p>
              <p className="text-neon-cyan text-lg font-bold animate-glow-intensify">
                5–7 SET 2025, Uberlândia–MG
              </p>
            </div>

            {/* Test Message */}
            <div className="text-center mb-8 p-4 glass-effect rounded-xl">
              <p className="text-neon-magenta font-bold">🧪 PÁGINA DE TESTE</p>
              <p className="text-soft-white text-sm">Se você está vendo isso, o React está funcionando!</p>
            </div>

            {/* Bio Links */}
            <div className="space-y-4">
              {testLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <button
                    onClick={() => handleBioLinkClick(link)}
                    className="w-full glass-effect text-soft-white font-bold py-6 px-8 rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-between group card-hover neon-glow"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      border: '1px solid rgba(255, 28, 142, 0.3)',
                      boxShadow: '0 0 20px rgba(255, 28, 142, 0.1)'
                    }}
                  >
                    <span className="flex-1 text-center text-lg">{link.title}</span>
                    <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity text-neon-magenta" />
                  </button>
                </div>
              ))}
            </div>

            {/* Status Info */}
            <div className="mt-12 p-4 glass-effect rounded-xl text-center">
              <p className="text-soft-white font-bold mb-2">Status do Teste</p>
              <p className="text-neon-cyan text-sm">✅ Componente carregado</p>
              <p className="text-neon-cyan text-sm">✅ {testLinks.length} links estáticos</p>
              <p className="text-neon-cyan text-sm">✅ Estilos da landing page</p>
              <p className="text-text-gray text-xs mt-2">Porta: {window.location.port}</p>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-text-gray text-sm">{getCopyrightText('2025')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioTest;