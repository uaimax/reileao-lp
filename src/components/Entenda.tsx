import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';

const Entenda = () => {
  const { data: landingData, isLoading } = useLandingData();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const aboutData = landingData?.about;
  const eventData = landingData?.event;

  // Calculate event duration in days based on the countdown target
  const eventDuration = useMemo(() => {
    if (!eventData?.eventCountdownTarget) return 3; // Default fallback
    
    try {
      const startDate = new Date(eventData.eventCountdownTarget);
      // Extract the date display to try to parse end date
      const dateDisplay = eventData.eventDateDisplay || ''; // e.g., "5–7 SET 2025, Uberlândia–MG"
      
      // Try to extract end day from date display format like "5–7 SET 2025"
      const dateMatch = dateDisplay.match(/(\d+)[-–](\d+)/);
      if (dateMatch) {
        const startDay = parseInt(dateMatch[1]);
        const endDay = parseInt(dateMatch[2]);
        return endDay - startDay + 1; // +1 to include both start and end days
      }
      
      // Fallback: assume 3 days if we can't parse
      return 3;
    } catch (error) {
      console.warn('Error calculating event duration:', error);
      return 3;
    }
  }, [eventData?.eventCountdownTarget, eventData?.eventDateDisplay]);

  // Helper function to get the plural form for days
  const getDaysText = (days: number) => {
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  return (
    <section id="entenda" className="py-20 relative">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold gradient-text neon-glow mb-12 animate-fade-in">
            {aboutData?.sectionTitle || "Entenda o UAIZOUK"}
          </h2>
          
          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-text-gray">
            <p className="glass-effect rounded-xl p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span dangerouslySetInnerHTML={{ 
                __html: (() => {
                  const daysText = `${getDaysText(eventDuration)} de imersão presencial`;
                  const highlightedDaysText = `<span class="text-neon-magenta font-bold">${daysText}</span>`;
                  
                  if (aboutData?.paragraph1) {
                    // Replace any mention of "X dias de imersão presencial" with dynamic version
                    return aboutData.paragraph1.replace(
                      /\d+\s+dias?\s+de\s+imersão\s+presencial/gi,
                      highlightedDaysText
                    );
                  }
                  
                  return `Serão ${highlightedDaysText} para respirar Zouk do início ao fim, com conteúdo selecionado e diversidade de professores e djs que conduzem toda a programação.`;
                })()
              }} />
            </p>
            
            <p className="glass-effect rounded-xl p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span dangerouslySetInnerHTML={{ 
                __html: aboutData?.paragraph2?.replace('participantes de todos os níveis', '<span class="text-neon-cyan font-bold">participantes de todos os níveis</span>') || 
                'Ao longo de todos esses anos de UAIZOUK nós contamos com <span class="text-neon-cyan font-bold">participantes de todos os níveis</span> das mais diversas cidades do Brasil e do mundo.'
              }} />
            </p>
            
            <p className="glass-effect rounded-xl p-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <span dangerouslySetInnerHTML={{ 
                __html: aboutData?.paragraph3?.replace('junção perfeita entre aprendizado para todos os níveis', '<span class="gradient-text font-bold">junção perfeita entre aprendizado para todos os níveis</span>') || 
                'O Congresso UAIZOUK é a <span class="gradient-text font-bold">junção perfeita entre aprendizado para todos os níveis</span> em um ambiente de socialização completo.'
              }} />
            </p>

            {/* Botão do Trailer */}
            <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
                <DialogTrigger asChild>
                  <button className="btn-neon text-white font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 text-lg hover:scale-105 transition-all duration-300">
                    <Play className="w-6 h-6" />
                    {aboutData?.trailerButtonText || "Veja um breve trailer"}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full p-2 bg-black/90 border-neon-magenta/20">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Trailer UAIZOUK</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-[9/16] w-full">
                    <iframe
                      src={aboutData?.trailerVideoUrl || "https://www.youtube.com/embed/5Q7hGUc3fMY?autoplay=1&mute=1"}
                      title="Trailer UAIZOUK"
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="glass-effect rounded-xl p-8 card-hover animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-2xl font-bold text-neon-magenta mb-4">
                  {aboutData?.beginnerTitle || "Se você é iniciante..."}
                </h3>
                <p>
                  {aboutData?.beginnerText || "prepare-se para aulas que vão desenvolver sua base, mas também a experiência real de uma balada de Zouk com pessoas que praticam em lugares totalmente diferentes."}
                </p>
              </div>
              
              <div className="glass-effect rounded-xl p-8 card-hover animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-2xl font-bold text-neon-purple mb-4">
                  {aboutData?.advancedTitle || "Se você é intermediário ou avançado..."}
                </h3>
                <p>
                  {aboutData?.advancedText || "prepare-se para aprofundar as técnicas e aprender com professores que rodam o mundo levando o Zouk."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Entenda;
