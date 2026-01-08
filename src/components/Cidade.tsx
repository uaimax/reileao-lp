
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';

const Cidade = () => {
  const { data: landingData } = useLandingData();
  const locationData = landingData?.location;
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Função para extrair ID do YouTube da URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match ? match[1] : 'sDHDoiNoMjU';
  };

  const videoId = locationData?.venueVideoUrl ? getYouTubeId(locationData.venueVideoUrl) : 'sDHDoiNoMjU';

  return (
    <section id="cidade" className="py-20 relative">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-8 animate-fade-in">
            {locationData?.sectionTitle || "Uberlândia, MG"}
          </h2>
          <p className="text-xl text-text-gray max-w-3xl mx-auto mb-8">
            {locationData?.sectionSubtitle || "O evento oficial acontece sempre em Uberlândia (Minas Gerais)"}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <div className="glass-effect rounded-2xl p-8">
              <p className="text-lg text-text-gray leading-relaxed mb-6">
                {locationData?.descriptionParagraph1 || "Recentemente a cidade foi classificada pela International Congress and Convention Association (ICCA) (a principal entidade do segmento de turismo e eventos internacionais) como uma das cidades brasileiras que mais sedia eventos internacionais, ficando na nona posição."}
              </p>
              
              <p className="text-lg text-text-gray leading-relaxed">
                {locationData?.descriptionParagraph2 || "Entre as doze cidades melhores colocadas, Uberlândia é a única que não é capital."}
              </p>
            </div>
            
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neon-purple mb-4">
                {locationData?.travelInfoTitle || "Como chegar em Uberlândia:"}
              </h3>
              <ul className="space-y-3 text-text-gray">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-neon-magenta rounded-full mr-3"></span>
                  <span>{locationData?.travelInfoSp || "50 minutos de São Paulo (voo) / 8 horas de ônibus"}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-neon-purple rounded-full mr-3"></span>
                  <span>{locationData?.travelInfoBh || "50 minutos de Belo Horizonte (voo) / 10 horas de ônibus"}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-neon-cyan rounded-full mr-3"></span>
                  <span>{locationData?.travelInfoRj || "60 minutos do Rio de Janeiro (voo)"}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-effect rounded-2xl p-8 mb-8">
              <h3 className="text-3xl font-bold gradient-text neon-glow mb-6">
                {locationData?.venueTitle || "O local do UAIZOUK 2025"}
              </h3>
              <p className="text-lg text-text-gray mb-6 leading-relaxed">
                {locationData?.venueDescription || "O UAIZOUK acontece no Recanto da Lua, uma chácara dentro da cidade no bairro Chácaras Panorama."}
              </p>
              
              <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
                <DialogTrigger asChild>
                  <div className="aspect-video bg-dark-bg rounded-xl mb-6 relative cursor-pointer group border border-neon-purple/30 overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Vídeo do local UAIZOUK"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-neon-magenta/20 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-12 h-12 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-2 bg-black/90 border-neon-magenta/20">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Vídeo do local UAIZOUK</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video w-full">
                    <iframe
                      src={locationData?.venueVideoUrl || `https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title="Vídeo do local UAIZOUK"
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={() => window.open(locationData?.hotelBookingUrl || 'https://www.booking.com/searchresults.pt-br.html?ss=Ch%C3%A1cara+Recanto+da+Lua+-+Rua+dos+Ceamitas+-+Panorama%2C+Uberl%C3%A2ndia+-+MG%2C+Brasil', '_blank')}
                variant="outline"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg font-bold py-4 px-8 rounded-full text-lg transition-all duration-300"
              >
                {locationData?.hotelButtonText || "Lista de hotéis"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cidade;
