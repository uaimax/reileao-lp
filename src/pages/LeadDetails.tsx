import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  User,
  ArrowLeft,
  Copy,
  Link,
  Plane,
  CreditCard,
  Upload,
  MessageCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { SITE_NAME } from '@/lib/site-config';

interface Lead {
  id: string;
  uuid: string;
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

const LeadDetails = () => {
  const { leadUuid } = useParams<{ leadUuid: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('LeadDetails renderizado com leadUuid:', leadUuid);

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadUuid) return;

      try {
        console.log('Buscando lead com UUID:', leadUuid);
        const data = await apiClient.getPrimeirinhoLead(leadUuid);
        console.log('Dados do lead recebidos:', data);

        // Buscar dados de confirmação do localStorage
        const confirmations = JSON.parse(localStorage.getItem('primeirinho_confirmations') || '{}');
        const confirmationData = confirmations[leadUuid];

        if (confirmationData) {
          data.confirmationData = confirmationData;
        }

        setLead(data);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar dados do lead');
        navigate('/painel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [leadUuid, navigate]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Aprovado',
          className: 'bg-green-600 text-white'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: 'Rejeitado',
          className: 'bg-red-600 text-white'
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Confirmado',
          className: 'bg-green-600 text-white'
        };
      default:
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Aprovado',
          className: 'bg-green-600 text-white'
        };
    }
  };

  const handleStatusChange = async (newStatus: 'rejected' | 'confirmed') => {
    if (!lead) return;

    try {
      console.log('Atualizando status do lead:', lead.uuid, 'para:', newStatus);
      await apiClient.updatePrimeirinhoLeadStatus(lead.uuid, newStatus);
      const statusMessages = {
        'rejected': 'reprovado',
        'confirmed': 'confirmado'
      };
      toast.success(`Lead ${statusMessages[newStatus]} com sucesso`);

      // Atualizar status local
      setLead(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status do lead');
    }
  };

  const copyLeadLink = async () => {
    if (!lead) return;

    const leadUrl = `${window.location.origin}/primeirinho/2026/${lead.uuid}`;
    try {
      await navigator.clipboard.writeText(leadUrl);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = leadUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const openWhatsApp = () => {
    if (!lead) return;

    const cleanNumber = lead.whatsapp.replace(/\D/g, '');
    const message = `Olá ${lead.nome}! Vi que você se inscreveu no programa PRIMEIRINHO do ${SITE_NAME}. Como posso ajudá-lo?`;
    const url = `https://api.whatsapp.com/send?phone=55${cleanNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">
          <div>Carregando lead: {leadUuid}</div>
          <div className="text-sm text-gray-400 mt-2">Verifique o console para logs de debug</div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-red-500/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Lead não encontrado</h2>
            <p className="text-gray-400">O lead solicitado não foi encontrado.</p>
            <Button
              onClick={() => navigate('/painel')}
              className="mt-4"
              variant="outline"
            >
              Voltar ao Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(lead.status);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/painel')}
                variant="outline"
                size="sm"
                className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Detalhes do Lead</h1>
                <p className="text-sm text-gray-400">Informações completas e confirmações</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={statusInfo.className}>
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.label}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Básicas */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-neon-purple/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-neon-purple" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neon-purple block mb-1">Nome</label>
                  <p className="text-soft-white text-lg font-medium">{lead.nome}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neon-purple block mb-1">Email</label>
                  <p className="text-soft-white break-all">{lead.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neon-purple block mb-1">WhatsApp</label>
                  <p className="text-soft-white">{lead.whatsapp}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neon-purple block mb-1">Localização</label>
                  <p className="text-soft-white flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {lead.cidade}, {lead.estado}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neon-purple block mb-1">Data e Horário de Entrada</label>
                  <div className="space-y-1">
                    <p className="text-soft-white font-medium">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(lead.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="glass-effect border-neon-purple/30 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={copyLeadLink}
                  variant="outline"
                  className="w-full border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link da Página
                </Button>

                <Button
                  onClick={openWhatsApp}
                  variant="outline"
                  className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </Button>

                {lead.status === 'approved' && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleStatusChange('rejected')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reprovar Lead
                    </Button>
                  </div>
                )}

                {lead.status === 'approved' && lead.confirmationData && (
                  <Button
                    onClick={() => handleStatusChange('confirmed')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Confirmado
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dados de Confirmação */}
          <div className="lg:col-span-2">
            {lead.confirmationData ? (
              <div className="space-y-6">
                {/* Resumo da Confirmação */}
                <Card className="glass-effect border-neon-purple/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-neon-purple" />
                      Resumo da Confirmação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Opção Escolhida</div>
                        <div className="flex items-center gap-2">
                          {lead.confirmationData.option === 'passagem' ? (
                            <>
                              <Plane className="w-5 h-5 text-cyan-400" />
                              <span className="text-cyan-400 font-semibold">Comprovante de Passagem</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 text-green-400" />
                              <span className="text-green-400 font-semibold">Pagamento PIX</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Status</div>
                        <div className="flex items-center gap-2">
                          {lead.confirmationData.option === 'passagem' ? (
                            lead.confirmationData.passagemConfirmada &&
                            lead.confirmationData.naoDesistirConfirmado &&
                            lead.confirmationData.comprovantePassagem ? (
                              <span className="text-green-400 font-semibold">✅ Completa</span>
                            ) : (
                              <span className="text-yellow-400 font-semibold">⚠️ Incompleta</span>
                            )
                          ) : (
                            lead.confirmationData.pixPago ? (
                              <span className="text-green-400 font-semibold">✅ Pago</span>
                            ) : (
                              <span className="text-red-400 font-semibold">❌ Pendente</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalhes da Opção Escolhida */}
                <Card className="glass-effect border-neon-purple/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      {lead.confirmationData.option === 'passagem' ? (
                        <>
                          <Plane className="w-5 h-5 text-cyan-400" />
                          Detalhes da Passagem
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 text-green-400" />
                          Detalhes do Pagamento
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lead.confirmationData.option === 'passagem' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                            <CheckCircle className={`w-5 h-5 ${lead.confirmationData.passagemConfirmada ? 'text-green-500' : 'text-red-500'}`} />
                            <div>
                              <div className="text-sm text-gray-400">Passagem Confirmada</div>
                              <div className={`font-semibold ${lead.confirmationData.passagemConfirmada ? 'text-green-400' : 'text-red-400'}`}>
                                {lead.confirmationData.passagemConfirmada ? 'Sim' : 'Não'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                            <CheckCircle className={`w-5 h-5 ${lead.confirmationData.naoDesistirConfirmado ? 'text-green-500' : 'text-red-500'}`} />
                            <div>
                              <div className="text-sm text-gray-400">Não Desistir Confirmado</div>
                              <div className={`font-semibold ${lead.confirmationData.naoDesistirConfirmado ? 'text-green-400' : 'text-red-400'}`}>
                                {lead.confirmationData.naoDesistirConfirmado ? 'Sim' : 'Não'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comprovante de Passagem */}
                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                          <h6 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Arquivo Enviado pelo Lead
                          </h6>

                          {lead.confirmationData.comprovantePassagem ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                  <Upload className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-white font-medium">Comprovante de Passagem</div>
                                  <div className="text-sm text-gray-400">Arquivo anexado pelo lead</div>
                                </div>
                                <a
                                  href={lead.confirmationData.comprovantePassagem}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  📎 Visualizar
                                </a>
                              </div>

                              <div className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded">
                                💡 <strong>Dica:</strong> Clique em "Visualizar" para abrir o arquivo em nova aba
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="text-gray-500 text-sm">
                                ❌ Nenhum arquivo foi enviado pelo lead
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            <CheckCircle className={`w-5 h-5 ${lead.confirmationData.pixPago ? 'text-green-500' : 'text-red-500'}`} />
                            <div>
                              <div className="text-sm text-gray-400">Status do PIX</div>
                              <div className={`font-semibold ${lead.confirmationData.pixPago ? 'text-green-400' : 'text-red-400'}`}>
                                {lead.confirmationData.pixPago ? '✅ Confirmado pelo Lead' : '❌ Não Confirmado'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">R$</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Valor Solicitado</div>
                              <div className="font-semibold text-green-400">R$ 90,00</div>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes do Pagamento */}
                        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                          <h6 className="text-sm font-semibold text-white mb-3">Detalhes do Pagamento</h6>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-gray-400">Chave PIX:</span>
                              <span className="text-white font-mono text-sm">pix@uaizouk.com.br</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-gray-400">Valor:</span>
                              <span className="text-green-400 font-bold">R$ 90,00</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-400">Lead confirmou pagamento:</span>
                              <span className={`font-semibold ${lead.confirmationData.pixPago ? 'text-green-400' : 'text-red-400'}`}>
                                {lead.confirmationData.pixPago ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Aviso sobre Estorno */}
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <h6 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                            ⚠️ Importante
                          </h6>
                          <p className="text-sm text-white">
                            A única situação que poderia cancelar a inscrição seria um
                            <span className="font-semibold text-yellow-300"> estorno do PIX</span>.
                            Caso contrário, a vaga está 100% garantida!
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Data de Confirmação */}
                {lead.confirmationData.dataConfirmacao && (
                  <Card className="glass-effect border-neon-purple/30">
                    <CardHeader>
                      <CardTitle className="text-white">Data da Confirmação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-white font-medium">
                        {new Date(lead.confirmationData.dataConfirmacao).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="glass-effect border-gray-700">
                <CardContent className="pt-6 text-center">
                  <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Sem Dados de Confirmação</h3>
                  <p className="text-gray-400">
                    Este lead ainda não preencheu os dados de confirmação.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
