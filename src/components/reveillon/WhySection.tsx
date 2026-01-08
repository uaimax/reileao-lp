import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const WhySection = () => {
  const { data: landingData } = useLandingData();
  const aboutData = landingData?.about;
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: 'white' }}>
      <div className="container" style={{ maxWidth: '56rem' }}>
        <h2 className="section-title">Por que esse Réveillon</h2>
        <div className="text-section">
          <p>{aboutData?.paragraph1 || 'O Reveillon em Uberlândia não é um congresso ou festival.'}</p>
          <p>{aboutData?.paragraph2 || 'As atividades propostas são pensadas no intuito de criar um espaço seguro para todos poderem "ser" em indivíduo e comunidade durante esses dias.'}</p>
          <p>{aboutData?.paragraph3 || 'Uma das intenções é fechar o ciclo do ano que está se encerrando e iniciar o próximo com boas energias.'}</p>
          <p>Celebrar a vida através da simplicidade e conexão consigo e com o todo.</p>
        </div>
      </div>
    </section>
  );
};

export default WhySection;

