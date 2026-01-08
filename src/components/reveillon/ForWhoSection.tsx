import { useLandingData } from '@/hooks/use-landing-data';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const ForWhoSection = () => {
  const { data: landingData } = useLandingData();
  const aboutData = landingData?.about;
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className={`section-padding animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: 'white' }}>
      <div className="container" style={{ maxWidth: '56rem' }}>
        <h2 className="section-title">Para quem é?</h2>
        <div className="text-section" style={{ textAlign: 'center' }}>
          <p>
            Gosta de ler, relaxar, descansar a cabeça, dançar sozinho ou a dois, brincar, piscina, jogos de tabuleiro, sinuca, totó, rodinhas de violão – e, acima de tudo, ter liberdade para fazer qualquer coisa no seu tempo? Então esse lugar é seu.
          </p>
          <p>
            Pra nós o Reveillon é bem mais do que sentar no sofá e assistir as pessoas passando a virada em algum lugar. Pra nós, é mais do que uma festa de uma noite só ou um cronograma agitado. Pra nós, é uma proposta de ressignificação...
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForWhoSection;

