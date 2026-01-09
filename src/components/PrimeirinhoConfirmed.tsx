import { CheckCircle, Calendar, MapPin, Users, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLandingData } from '@/hooks/use-landing-data';
import { getSiteNameWithYear, CONTACT_EMAIL } from '@/lib/site-config';

const PrimeirinhoConfirmed = () => {
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          {/* GIF de Celebração */}
          <div className="mb-6">
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWk4NjBxa2Z4Z205Z2J2ZzU2bjl5dWUwdDIzamVvNmx5ZGkzM255OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yoJC2GnSClbPOkV0eA/giphy.gif"
              alt="Celebração"
              className="mx-auto rounded-2xl shadow-2xl"
              style={{ maxWidth: '300px', height: 'auto' }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎉 PAGAMENTO CONFIRMADO! 🎉
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Sua vaga no programa PRIMEIRINHO está garantida!
          </p>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-lg text-green-400 font-semibold">
              ✅ Inscrição Confirmada! Agora é só deixar com nossa equipe!
            </p>
          </div>
        </div>
        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Data do Evento</h3>
            <p className="text-2xl font-bold text-purple-400">5–7 SET 2025</p>
            <p className="text-gray-400 text-sm mt-1">3 dias de pura diversão!</p>
          </div>

          <div className="text-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Local</h3>
            <p className="text-2xl font-bold text-cyan-400">Uberlândia–MG</p>
            <p className="text-gray-400 text-sm mt-1">Coração de Minas Gerais</p>
          </div>

          <div className="text-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Programa</h3>
            <p className="text-2xl font-bold text-green-400">PRIMEIRINHO</p>
            <p className="text-gray-400 text-sm mt-1">Sua vaga está garantida!</p>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <Gift className="w-5 h-5 text-white" />
            </div>
            O que está incluído no seu pacote:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center bg-gray-700/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-white">Acesso completo ao evento {eventData?.eventTitle || getSiteNameWithYear('2025')}</span>
              </div>
              <div className="flex items-center bg-gray-700/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-white">Todas as aulas e workshops</span>
              </div>
              <div className="flex items-center bg-gray-700/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-white">Sessões de dança e prática</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center bg-gray-700/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-white">Material didático exclusivo</span>
              </div>
              <div className="flex items-center bg-gray-700/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-white">Certificado de participação</span>
              </div>
              <div className="flex items-center bg-gray-700/30 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-white">E muito mais surpresas! 🎁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-12">
          <div className="text-center space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                💳 Pagamento PIX Confirmado!
              </h3>
              <p className="text-lg text-white leading-relaxed">
                Seu pagamento de <span className="font-bold text-green-400">R$ 90,00</span> foi confirmado
                e sua vaga está 100% garantida no programa PRIMEIRINHO!
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">
                ⚠️ Única Ressalva
              </h3>
              <p className="text-white leading-relaxed">
                A única situação que poderia cancelar sua inscrição seria um
                <span className="font-semibold text-yellow-300"> estorno do PIX</span>.
                Caso contrário, sua vaga está 100% garantida!
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-3">
                📧 Próximos Passos
              </h3>
              <p className="text-white leading-relaxed">
                Fique atento ao seu email! Nossa equipe entrará em contato
                com todos os detalhes do evento e próximas instruções.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            📋 Próximos passos:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-700/30 rounded-xl">
              <div className="bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <p className="text-white text-lg font-medium">Email de confirmação</p>
              <p className="text-gray-400 text-sm mt-2">Você receberá todos os detalhes</p>
            </div>
            <div className="text-center p-6 bg-gray-700/30 rounded-xl">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <p className="text-white text-lg font-medium">Fique atento</p>
              <p className="text-gray-400 text-sm mt-2">Às atualizações sobre o evento</p>
            </div>
            <div className="text-center p-6 bg-gray-700/30 rounded-xl">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <p className="text-white text-lg font-medium">Prepare-se!</p>
              <p className="text-gray-400 text-sm mt-2">Para uma experiência incrível!</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            💬 Dúvidas? Estamos aqui para ajudar!
          </h3>
          <p className="text-lg text-gray-300 mb-4">
            Entre em contato conosco:
          </p>
          <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-2xl font-bold text-cyan-400">
              {CONTACT_EMAIL}
            </p>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Responderemos em até 24 horas! ⚡
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrimeirinhoConfirmed;
