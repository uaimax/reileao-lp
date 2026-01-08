import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Coffee, TreePine, Music, Users } from 'lucide-react';

const BenefitsSection = () => {
  const { data: landingData } = useLandingData();
  const { ref, isVisible } = useScrollAnimation();

  const benefits = [
    {
      icon: Coffee,
      text: 'Café da manhã, almoço, jantar e ceia de Ano-Novo incluídos',
      highlight: 'incluídos'
    },
    {
      icon: TreePine,
      text: '4000 m² de natureza, piscina e quartos suítes coletivos'
    },
    {
      icon: Music,
      text: 'O que toca? De tudo. O predominante são músicas dançantes como Zouk, Forró, Samba, mas espere também Axé, Bolero, MPB e o que vier!',
      highlight: 'De tudo'
    },
    {
      icon: Users,
      text: 'Atividades guiadas por Luan & Adriana + interações espontâneas (violão, jogos, acroyoga…)'
    }
  ];

  return (
    <section ref={ref} className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: '#F9FAFB' }}>
      <div className="container" style={{ maxWidth: '72rem' }}>
        <h2 className="section-title">O que te espera</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  <Icon style={{ width: '24px', height: '24px', color: 'black' }} />
                </div>
                <p className="benefit-text">
                  {benefit.highlight ? (
                    <>
                      {benefit.text.split(benefit.highlight)[0]}
                      <strong>{benefit.highlight}</strong>
                      {benefit.text.split(benefit.highlight)[1]}
                    </>
                  ) : (
                    benefit.text
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

