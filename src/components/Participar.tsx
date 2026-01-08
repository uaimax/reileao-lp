import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLandingData } from '@/hooks/use-landing-data';
import { useMetaPixelTracking, useButtonTracking } from '@/hooks/use-meta-pixel';
import { SITE_NAME } from '@/lib/site-config';

const Participar = () => {
  const { data: landingData } = useLandingData();
  const participationData = landingData?.participation;
  const eventData = landingData?.event;
  const [showModal, setShowModal] = useState(false);

  // Meta Pixel tracking
  const { trackLead, trackCustomEvent } = useMetaPixelTracking();
  const { trackButtonClick } = useButtonTracking();
  return (
    <section id="participar" className="py-20 relative">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-8 animate-fade-in">
            {participationData?.sectionTitle || "Como Participar"}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 md:p-12 text-center animate-slide-up">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-neon-magenta neon-glow mb-6">
                {participationData?.mainTitle || `Você NÃO PRECISA de um par para se inscrever no ${SITE_NAME}`}
              </h3>

              <div className="space-y-6 text-lg text-text-gray leading-relaxed">
                <p>
                  {participationData?.paragraph1 || (
                    <>
                      Você pode se inscrever individualmente, e acredite, você será muito bem recebido(a) por todos os participantes, acolhido(a) como o Luís foi (
                      <button
                        type="button"
                        className="underline text-neon-magenta hover:text-neon-pink transition focus:outline-none"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        onClick={() => setShowModal(true)}
                      >
                        entenda aqui
                      </button>
                      ).
                    </>
                  )}
                </p>

                <p>
                  {participationData?.paragraph2 || "Agora, se você formar um par, com amigo(a), aí você terá um desconto."}
                </p>

                <p>
                  {participationData?.paragraph3 || "Ambos precisarão se inscrever normalmente, mas ambos terão desconto."}
                </p>

                <p className="text-soft-white font-medium">
                  {participationData?.paragraph4 || "Os valores atualizados ficam na página de inscrição, confira abaixo"}
                </p>
              </div>
            </div>

            <div>
              <Button
                onClick={() => {
                  // Track Meta Pixel events
                  trackButtonClick('QUERO PARTICIPAR', 'cta');
                  trackLead();
                  trackCustomEvent('CTAClick', {
                    content_name: 'QUERO PARTICIPAR',
                    content_category: 'cta',
                    button_text: participationData?.ctaButtonText || "QUERO PARTICIPAR",
                    event_name: eventData?.eventTitle || SITE_NAME
                  });

                  // Open registration page
                  window.open(eventData?.registrationUrl || 'https://uaizouk.com.br/inscricoes', '_blank');
                }}
                className="btn-neon text-white font-bold py-6 px-16 rounded-full text-2xl"
              >
                {participationData?.ctaButtonText || "QUERO PARTICIPAR"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal vertical estilo reels */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[90vw] max-w-[400px] aspect-[9/16] p-0 bg-black flex items-center justify-center">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/yBZCPsG35I4"
            title="Vídeo do YouTube - Entenda aqui"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full rounded-xl"
          ></iframe>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Participar;
