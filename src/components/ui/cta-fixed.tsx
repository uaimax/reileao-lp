import { useLandingData } from '@/hooks/use-landing-data';

const CtaFixed = () => {
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  const whatsappNumber = eventData?.whatsappNumber || '5513991737852';
  const whatsappMessage = eventData?.whatsappMessage || 'Olá! Gostaria de saber mais sobre o Réveillon.';

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="cta-button fixed"
    >
      Converse com a Ju agora no WhatsApp
    </a>
  );
};

export default CtaFixed;

