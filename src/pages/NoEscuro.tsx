import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Calendar, MapPin, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useLandingData } from '@/hooks/use-landing-data';
import { usePageTracking, useMetaPixelTracking, useButtonTracking } from '@/hooks/use-meta-pixel';
import { SITE_NAME, getSiteNameWithYear } from '@/lib/site-config';

const NoEscuro = () => {
  const navigate = useNavigate();
  const { data: landingData } = useLandingData();
  const eventData = (landingData as any)?.event;
  const [isVisible, setIsVisible] = useState(false);

  // Meta Pixel tracking
  usePageTracking('Pacote no Escuro');
  const { trackViewContent, trackCustomEvent, trackLead } = useMetaPixelTracking();
  const { trackButtonClick } = useButtonTracking();

  useEffect(() => {
    setIsVisible(true);

    // Track page view and content
    trackViewContent('O Pacote no Escuro', ['no-escuro-page']);
    trackCustomEvent('NoEscuroPageView', {
      content_name: 'O Pacote no Escuro',
      content_category: 'special-offer',
      event_name: eventData?.eventTitle || getSiteNameWithYear('2026'),
      offer_type: 'early-bird',
      price: 449,
      currency: 'BRL'
    });
  }, [trackViewContent, trackCustomEvent, eventData]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(147,51,234,0.1)_0%,_transparent_50%)]"></div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-purple-400 text-sm font-medium tracking-wider uppercase">
              {eventData?.eventTitle || getSiteNameWithYear('2026')}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              O Pacote no Escuro
            </span>
          </h1>
        </div>

        {/* Main Story */}
        <div className="space-y-12 text-lg leading-relaxed">

          {/* Opening */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-2xl md:text-3xl font-light text-gray-300 mb-8">
              Você chegou até aqui porque sabe que<br />
              <span className="text-white font-medium">as melhores experiências não cabem em cronogramas.</span>
            </p>
          </div>

          {/* This year is different */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-3xl md:text-4xl font-bold text-white mb-6">
              Este ano é diferente.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              Reunimos nosso time não para fazer "mais um evento",<br />
              mas para criar algo que ainda não tem nome.
            </p>
          </div>

          {/* Event Summary */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* O QUE */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 h-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{eventData?.eventTitle || getSiteNameWithYear('2026')}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Construindo juntos uma comunidade que abraça<br />
                    <span className="text-purple-400">(através do Zouk e além dele)</span>
                  </p>
                </div>
              </div>

              {/* QUANDO */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 h-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">QUANDO</h3>
                  <p className="text-gray-300 leading-relaxed">
                    4 a 7 de setembro de 2026<br />
                    <span className="text-purple-400">(4 dias de evento)</span>
                  </p>
                </div>
              </div>

              {/* ONDE */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 h-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">ONDE</h3>
                  <p className="text-gray-300 leading-relaxed">
                    4.000m² de natureza<br />
                    Uberlândia/MG<br />
                    <span className="text-purple-400">(Local exato revelado aos inscritos)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="space-y-6">
              <p className="text-2xl font-bold text-white">
                Sem grade engessada.<br />
                Sem fórmulas prontas.<br />
                Sem ambiente competitivo.<br />
                <span className="text-purple-400">Com propósito.</span>
              </p>
            </div>
          </div>

          {/* What we're creating */}
          <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-white mb-6">
              O que estamos criando:
            </h2>
            <div className="space-y-4 text-lg text-gray-300">
              <p>Um espaço onde movimento encontra propósito.</p>
              <p>Onde cada pessoa constrói junto e traz sua personalidade.</p>
              <p>Onde dançar é consequência, não o único objetivo.</p>
              <p>Não é sobre competir, mas sobre se conectar.</p>
            </div>
          </div>

          {/* Price */}
          <div className={`transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 text-center">
              <p className="text-sm font-normal text-gray-300 mb-2">
                a partir de
              </p>
              <p className="text-4xl md:text-5xl font-black text-white mb-4">
                R$ 449
              </p>
              <p className="text-lg text-gray-300 mb-6">
                com camiseta inclusa, para quem confia no processo
              </p>
              <p className="text-sm text-gray-400">
                Até quando? Pode encerrar a qualquer momento conforme confirmarmos mais detalhes.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className={`transition-all duration-1000 delay-1400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-6 px-12 rounded-full text-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 active:scale-95"
                onClick={() => {
                  // Track Meta Pixel events
                  trackButtonClick('GARANTIR MINHA VAGA', 'cta');
                  trackLead(449, 'BRL');
                  trackCustomEvent('NoEscuroCTAClick', {
                    content_name: 'GARANTIR MINHA VAGA',
                    content_category: 'cta',
                    button_text: 'GARANTIR MINHA VAGA',
                    event_name: eventData?.eventTitle || getSiteNameWithYear('2026'),
                    offer_type: 'early-bird',
                    price: 449,
                    currency: 'BRL',
                    page_source: 'no-escuro'
                  });

                  // Navigate to registration
                  navigate('/inscricao');
                }}
              >
                GARANTIR MINHA VAGA
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className={`transition-all duration-1000 delay-1600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              PERGUNTAS FREQUENTES:
            </h2>

            <div className="space-y-8">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Por que vocês não revelam os artistas desde o começo como os outros eventos?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  R: Porque fazemos questão de deixar um período especial para trazer pessoas que vêm pela jornada, não pelo destino. Se você precisa saber cada detalhe antes de viver, talvez prefira aguardar o próximo lote.
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Teremos algum campeonato ou competição oficial?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Olha, nós AMAMOS a energia de uma boa competição! Mas percebemos que o {eventData?.eventTitle || SITE_NAME} brilha mais quando cada pessoa se sente livre para ser ela mesma, sem pressão sobre performance.<br /><br />
                  Este ano focaremos em:<br /><br />
                  • Brincadeiras e dinâmicas (não competições com pontuação)<br />
                  • Momentos de troca e vulnerabilidade<br />
                  • Espaços para cada um contribuir com sua essência<br />
                  • Festas onde todo mundo dança com todo mundo<br /><br />
                  Ainda teremos desafios divertidos? Sim!<br />
                  Mas o troféu maior é sair com 50 novos amigos, não com uma medalha.
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Quando encerra esse lote no escuro?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  R: O lote encerra por número de vagas ou por confirmação de novos detalhes, sendo assim, nem mesmo nós sabemos ao certo, pode ser amanhã mesmo a depender das inscrições que acontecem direto por aqui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
    </div>
  );
};

export default NoEscuro;
