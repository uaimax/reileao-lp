import { MessageCircle } from 'lucide-react';
import { getWhatsAppMessage } from '@/lib/site-config';

interface WhatsAppFloatProps {
  phoneNumber?: string;
  message?: string;
  enabled?: boolean;
}

const WhatsAppFloat = ({ phoneNumber, message, enabled = true }: WhatsAppFloatProps) => {
  if (!enabled || !phoneNumber) return null;

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message || getWhatsAppMessage());
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhoneNumber}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-neon-green hover:bg-green-600 text-white rounded-full p-3 md:p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-50 animate-bounce yolo-optimize"
      aria-label="Falar no WhatsApp"
      title="Falar no WhatsApp"
      style={{
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        boxShadow: '0 0 20px rgba(37, 211, 102, 0.4)'
      }}
    >
      <MessageCircle size={24} className="md:w-7 md:h-7" />
    </button>
  );
};

export default WhatsAppFloat;