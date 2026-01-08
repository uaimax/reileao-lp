import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, MapPin, Phone, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import PrimeirinhoConfirmation from '@/components/PrimeirinhoConfirmation';
import PrimeirinhoConfirmed from '@/components/PrimeirinhoConfirmed';
import { getSiteNameWithYear } from '@/lib/site-config';

interface LeadData {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  estado: string;
  cidade: string;
  status: 'approved' | 'rejected' | 'confirmed';
  createdAt: string;
  updatedAt: string;
  confirmationData?: {
    option: 'passagem' | 'pagamento';
    passagemConfirmada?: boolean;
    naoDesistirConfirmado?: boolean;
    comprovantePassagem?: string;
    pixPago?: boolean;
    dataConfirmacao?: string;
  };
}

const PrimeirinhoStatus = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!uuid) return;

      try {
        const data = await apiClient.getPrimeirinhoLead(uuid);

        // Buscar dados de confirmação do localStorage
        const confirmations = JSON.parse(localStorage.getItem('primeirinho_confirmations') || '{}');
        const confirmationData = confirmations[uuid];

        if (confirmationData) {
          data.confirmationData = confirmationData;
        }

        setLeadData(data);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar dados do lead');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [uuid]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-8 h-8 text-neon-green" />,
          title: 'Aprovado!',
          description: 'Parabéns! Você foi aprovado para o programa PRIMEIRINHO!',
          badge: <Badge className="bg-neon-green text-dark-bg">Aprovado</Badge>
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: 'Confirmado!',
          description: 'Sua vaga está garantida no programa PRIMEIRINHO!',
          badge: <Badge className="bg-green-600 text-white">Confirmado</Badge>
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          title: 'Reprovado',
          description: 'Infelizmente, sua solicitação não foi aprovada desta vez.',
          badge: <Badge className="bg-red-500 text-white">Reprovado</Badge>
        };
      default:
        return {
          icon: <Clock className="w-8 h-8 text-neon-cyan" />,
          title: 'Em Análise',
          description: 'Sua solicitação está sendo analisada pela nossa equipe.',
          badge: <Badge className="bg-neon-cyan text-dark-bg">Pendente</Badge>
        };
    }
  };

  const handleConfirmationSubmit = async (confirmationData: any) => {
    if (!uuid) return;

    try {
      await apiClient.updatePrimeirinhoLeadConfirmation(uuid, confirmationData);

      // Se for pagamento PIX, alterar status para confirmed
      if (confirmationData.option === 'pagamento' && confirmationData.pixPago) {
        await apiClient.updatePrimeirinhoLeadStatus(uuid, 'confirmed');
      }

      // Recarregar dados do lead com confirmação
      const updatedData = await apiClient.getPrimeirinhoLead(uuid);
      const confirmations = JSON.parse(localStorage.getItem('primeirinho_confirmations') || '{}');
      const confirmationDataFromStorage = confirmations[uuid];

      if (confirmationDataFromStorage) {
        updatedData.confirmationData = confirmationDataFromStorage;
      }

      setLeadData(updatedData);

      // Se o status foi alterado para confirmed, a página será automaticamente
      // redirecionada para mostrar PrimeirinhoConfirmed devido ao useEffect
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar confirmação');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-soft-white">Carregando...</div>
      </div>
    );
  }

  if (!leadData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card className="glass-effect border-red-500/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-soft-white mb-2">Lead não encontrado</h2>
            <p className="text-text-gray">O lead solicitado não foi encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o lead está confirmado, mostrar página de confirmação final
  if (leadData.status === 'confirmed') {
    return <PrimeirinhoConfirmed />;
  }

  // Se o lead está aprovado, mostrar formulário de confirmação
  if (leadData.status === 'approved') {
    return (
      <PrimeirinhoConfirmation
        leadUuid={leadData.id}
        onConfirmationSubmit={handleConfirmationSubmit}
      />
    );
  }

  const statusInfo = getStatusInfo(leadData.status);

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="section-container py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border-neon-purple/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {statusInfo.icon}
              </div>
              <CardTitle className="text-3xl font-bold gradient-text neon-glow mb-2">
                {statusInfo.title}
              </CardTitle>
              <div className="flex justify-center mb-4">
                {statusInfo.badge}
              </div>
              <CardDescription className="text-lg text-soft-white">
                {statusInfo.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {leadData.status === 'pending' && (
                <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-neon-cyan mb-4">
                    Está quase lá!
                  </h3>
                  <p className="text-soft-white mb-4">
                    Se não tiver ninguém da sua cidade ainda, você pode ter ganhado um Full Pass do {getSiteNameWithYear('2026')}.
                  </p>
                  <p className="text-soft-white mb-4">
                    O processo de avaliação pode levar até 5 dias úteis e nossa equipe entrará em contato com você, seja para informar que deu certo ou não!
                  </p>
                  <p className="text-text-gray text-sm">
                    Como são muitas inscrições, pedimos que você não entre em contato com nosso time antes do prazo, porque isso pode atrasar o processo.
                  </p>
                </div>
              )}

              <div className="border-t border-neon-purple/20 pt-6">
                <h3 className="text-xl font-bold text-soft-white mb-4">
                  Seus Dados
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-neon-purple" />
                    <span className="text-soft-white">{leadData.nome}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-neon-purple" />
                    <span className="text-soft-white">{leadData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-neon-purple" />
                    <span className="text-soft-white">{leadData.whatsapp}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-neon-purple" />
                    <span className="text-soft-white">{leadData.cidade}, {leadData.estado}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-text-gray text-sm">
                <p>Data de inscrição: {new Date(leadData.createdAt).toLocaleDateString('pt-BR')}</p>
                <p>Última atualização: {new Date(leadData.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrimeirinhoStatus;
