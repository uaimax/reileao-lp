import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle, Printer, Home, RefreshCw, CreditCard, Clock, XCircle, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { usePageTracking, useMetaPixelTracking } from '@/hooks/use-meta-pixel';

interface RegistrationData {
  id: number;
  cpf: string | null;
  isForeigner: boolean;
  fullName: string;
  email: string;
  whatsapp: string;
  birthDate: string;
  state: string | null;
  city: string | null;
  ticketType: string;
  partnerName: string | null;
  selectedProducts: { [key: string]: string } | null;
  total: number | string;
  termsAccepted: boolean;
  paymentMethod: string;
  installments: number;
  paymentStatus?: string;
  asaasPaymentId?: string;
  updatedAt?: string;
  createdAt: string;
}

interface InstallmentData {
  id: string;
  installmentNumber: number;
  value: number;
  netValue: number;
  dueDate: string;
  status: string;
  billingType: string; // CREDIT_CARD, PIX, BOLETO, etc
  paymentDate?: string | null; // Data de pagamento efetivo (null se ainda não foi pago)
  confirmedDate?: string | null; // Data de confirmação (usado por cartão)
  invoiceUrl: string;
  description: string;
  originalValue?: number;
  interestValue?: number;
}

interface InstallmentsResponse {
  installments: InstallmentData[];
  totalInstallments: number;
  installmentGroup: string;
  message?: string;
}

interface Product {
  name: string;
  price: number;
  options: string[];
  availableUntil?: string;
  description?: string;
}

interface FormConfig {
  foreignerOption: {
    enabled: boolean;
  };
  ticketTypes: Array<{
    name: string;
    price: number;
    requiresPartner: boolean;
    description?: string;
  }>;
  products: Product[];
}

const RegistrationConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Meta Pixel tracking
  usePageTracking('Registration Confirmation');
  const { trackPurchase, trackCustomEvent } = useMetaPixelTracking();

  const [isLoading, setIsLoading] = useState(true);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [cooldownTimer, setCooldownTimer] = useState<number | null>(null);
  const [installments, setInstallments] = useState<InstallmentsResponse | null>(null);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [showAllInstallments, setShowAllInstallments] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    if (id) {
      loadRegistration(id);
    } else {
      setError('ID da inscrição não fornecido');
      setIsLoading(false);
    }
  }, [id]);

  // Track purchase when registration is loaded
  useEffect(() => {
    if (registration && config) {
      const total = typeof registration.total === 'string' ? parseFloat(registration.total) : registration.total;

      // Track purchase event
      trackPurchase(total, 'BRL', [registration.ticketType]);

      // Track custom confirmation event
      trackCustomEvent('RegistrationConfirmationView', {
        content_name: 'Registration Confirmation',
        content_category: 'conversion',
        registration_id: registration.id,
        ticket_type: registration.ticketType,
        payment_method: registration.paymentMethod,
        total_value: total,
        currency: 'BRL',
        is_foreigner: registration.isForeigner,
        has_partner: !!registration.partnerName,
        installments: registration.installments,
        payment_status: registration.paymentStatus || 'pending'
      });
    }
  }, [registration, config, trackPurchase, trackCustomEvent]);

  // Timer para atualizar o cooldown em tempo real
  useEffect(() => {
    if (lastRefreshTime) {
      const interval = setInterval(() => {
        setCooldownTimer(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastRefreshTime]);

  const loadRegistration = async (registrationId: string) => {
    try {
      setIsLoading(true);

      // Carregar dados da inscrição e configuração do formulário em paralelo
      const [registrationResponse, configResponse] = await Promise.all([
        apiClient.getRegistration(parseInt(registrationId)) as any,
        apiClient.getFormConfig() as any
      ]);

      setRegistration(registrationResponse);
      setConfig(configResponse);

      // Load installments if registration has installments
      if (registrationResponse.installments > 1 && registrationResponse.asaasPaymentId) {
        await loadInstallments(registrationId);
      }
    } catch (error: any) {
      console.error('Error loading registration:', error);
      setError(error.response?.data?.error || 'Erro ao carregar inscrição');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstallments = async (registrationId: string, simulateAllPaid = false) => {
    try {
      setIsLoadingInstallments(true);
      const response = await apiClient.getRegistrationInstallments(parseInt(registrationId), simulateAllPaid) as InstallmentsResponse;
      setInstallments(response);
    } catch (error: any) {
      console.error('Error loading installments:', error);
      // Don't show error for installments, just log it
    } finally {
      setIsLoadingInstallments(false);
    }
  };

  const generateProtocol = (id: number) => {
    // Gerar protocolo único baseado no ID
    const timestamp = new Date().getTime().toString(36);
    const idStr = id.toString().padStart(4, '0');
    return `UAIZOUK-${idStr}-${timestamp.toUpperCase()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRefreshStatus = async () => {
    if (!id) return;

    const now = Date.now();
    const cooldownTime = 2 * 60 * 1000; // 2 minutos em millisegundos

    // Verificar se ainda está no período de cooldown
    if (lastRefreshTime && (now - lastRefreshTime) < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (now - lastRefreshTime)) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

      toast({
        title: 'Aguarde',
        description: `Você pode atualizar novamente em ${minutes}:${seconds.toString().padStart(2, '0')}`,
        variant: 'default'
      });
      return;
    }

    try {
      setIsRefreshing(true);
      await loadRegistration(id);
      setLastRefreshTime(now);
      toast({
        title: 'Status atualizado',
        description: 'O status do pagamento foi atualizado com sucesso.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do pagamento.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRefreshButtonState = () => {
    if (!lastRefreshTime) {
      return {
        disabled: false,
        text: 'Atualizar Status',
        description: 'Clique para verificar o status do pagamento'
      };
    }

    const now = cooldownTimer || Date.now();
    const cooldownTime = 2 * 60 * 1000; // 2 minutos
    const timeSinceLastRefresh = now - lastRefreshTime;
    const remainingTime = cooldownTime - timeSinceLastRefresh;

    if (remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);

      return {
        disabled: true,
        text: `Aguarde ${minutes}:${seconds.toString().padStart(2, '0')}`,
        description: 'Você pode atualizar novamente em breve'
      };
    }

    return {
      disabled: false,
      text: 'Atualizar Status',
      description: 'Clique para verificar o status do pagamento'
    };
  };

  const getPaymentStatusInfo = (status?: string) => {
    const currentStatus = status || 'pending';

    switch (currentStatus) {
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          label: 'Pago',
          description: 'Pagamento confirmado com sucesso!'
        };
      case 'refunded':
        return {
          icon: XCircle,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          label: 'Reembolsado',
          description: 'Pagamento foi reembolsado.'
        };
      case 'overdue':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          label: 'Vencido',
          description: 'Pagamento vencido. Entre em contato conosco.'
        };
      case 'chargeback':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          label: 'Chargeback',
          description: 'Pagamento contestado. Entre em contato conosco.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          label: 'Pendente',
          description: 'Aguardando confirmação do pagamento.'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-soft-white">Carregando confirmação...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-soft-white mb-4">{error || 'Inscrição não encontrada'}</p>
          <Button onClick={handleBackToHome}>
            <Home className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header for Installment Registrations */}
        {(registration.installments > 1 && registration.asaasPaymentId) ? (
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold gradient-text mb-2">
              ✅ Pré-inscrição realizada!
            </h1>
            <p className="text-lg text-text-gray">
              Agora é só manter suas parcelas em dia.
            </p>
          </div>
        ) : (
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold gradient-text mb-2">
            ✅ INSCRIÇÃO REALIZADA COM SUCESSO!
          </h1>
          <p className="text-text-gray">
            Você receberá um email com as instruções de pagamento
          </p>
        </div>
        )}

        {/* Hero Payment Section - Only for Installments */}
        {(registration.installments > 1 && registration.asaasPaymentId) && (
          <div className="mb-8">
            {isLoadingInstallments ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-text-gray">Carregando parcelas...</p>
              </div>
            ) : installments && installments.installments.length > 0 ? (
              (() => {
                // Lógica de pagamento diferenciada por tipo:
                //
                // CARTÃO DE CRÉDITO:
                // - Status CONFIRMED = Autorização aprovada, inscrição garantida
                // - Asaas debita automaticamente nas datas de vencimento
                // - Considerar como "pago/garantido"
                //
                // PIX/BOLETO:
                // - Status PENDING = Aguardando pagamento manual
                // - Status RECEIVED/PAID = Efetivamente pago
                // - Cada parcela precisa ser paga separadamente

                const isCreditCard = installments.installments[0]?.billingType === 'CREDIT_CARD';

                let allPaid = false;
                let nextInstallment = null;

                if (isCreditCard) {
                  // CARTÃO: Se todas estão CONFIRMED, considerar como garantido
                  allPaid = installments.installments.every(i => i.status === 'CONFIRMED');
                  // Para cartão, não há "próxima parcela" pois é automático
                  nextInstallment = null;
                } else {
                  // PIX/BOLETO: Verificar se foram efetivamente pagos
                  allPaid = installments.installments.every(i =>
                    i.status === 'PAID' || i.status === 'RECEIVED'
                  );
                  // Encontrar próxima parcela pendente
                  nextInstallment = installments.installments.find(i => i.status === 'PENDING');
                }

                // Show success message when all installments are paid/confirmed
                if (allPaid) {
                  return (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-8 text-center text-white shadow-2xl">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                      }}></div>

                      <div className="relative z-10">
                        {/* Success Icon */}
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-200" />

                        {/* Main Message */}
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                          🎉 INSCRIÇÃO CONFIRMADA!
                        </h2>

                        {/* Subtitle */}
                        <div className="text-xl text-green-100 mb-6">
                          {isCreditCard
                            ? 'Pagamento autorizado! As parcelas serão debitadas automaticamente do seu cartão nas datas de vencimento'
                            : 'Todas as parcelas foram pagas com sucesso'
                          }
                        </div>

                        {/* Celebration Message */}
                        <div className="text-lg text-green-100">
                          Você está oficialmente inscrito no UAIZOUK! 🚀
                        </div>
                      </div>
                    </div>
                  );
                }

                if (!nextInstallment) return null;

                return (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-8 text-center text-white shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>

                    <div className="relative z-10">
                      {/* Main Message */}
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        Pague agora para confirmar sua vaga!
                      </h2>

                      {/* Value Highlight */}
                      <div className="text-5xl md:text-6xl font-black mb-4 text-yellow-200 drop-shadow-lg">
                        R$ {nextInstallment.value.toFixed(2)}
                      </div>

                      {/* Deadline with Urgency */}
                      <div className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                        <Clock className="w-4 h-4 mr-2" />
                        Vence em {new Date(nextInstallment.dueDate).toLocaleDateString('pt-BR')}
                      </div>

                      {/* Installment Info */}
                      <div className="text-lg text-orange-100 mb-8">
                        Parcela {nextInstallment.installmentNumber} de {installments.totalInstallments} • Pendente
                      </div>

                      {/* Main CTA Button */}
                      {nextInstallment.invoiceUrl && (
                        <div className="space-y-4">
                          <Button
                            size="lg"
                            className="w-full md:w-auto bg-white text-orange-600 hover:bg-gray-100 font-black text-xl px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
                            onClick={() => window.open(nextInstallment.invoiceUrl, '_blank')}
                          >
                            <CheckCircle className="w-6 h-6 mr-3" />
                            PAGAR AGORA E CONFIRMAR INSCRIÇÃO
                          </Button>

                          {/* Microcopy */}
                          <div className="text-orange-100 text-sm">
                            ⚡ Pague agora e garanta o lote atual
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-text-gray">Não foi possível carregar as parcelas</p>
              </div>
            )}
          </div>
        )}


        {/* WhatsApp Group Button - Only for Installments */}
        {(registration.installments > 1 && registration.asaasPaymentId) && (
          <Card className="mb-6">
            <CardContent className="text-center py-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Entre para o grupo de participantes!
                </h3>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3"
                  onClick={() => window.open('https://uaizouk.com.br/grupo', '_blank')}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Entrar no WhatsApp
                </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Visual Status - Only for Installments */}
        {(registration.installments > 1 && registration.asaasPaymentId) && (
          <Card className="mb-6">
          <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>
                  📊 Status Rápido
              </span>
              {(() => {
                const buttonState = getRefreshButtonState();
                return (
                  <Button
                    onClick={handleRefreshStatus}
                    disabled={isRefreshing || buttonState.disabled}
                    variant="outline"
                    size="sm"
                    title={buttonState.description}
                  >
                    {isRefreshing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
              {installments ? (
                <div>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progresso das parcelas</span>
                      <span className="text-sm font-bold text-white">
                        {(() => {
                          // Contar parcelas pagas/confirmadas
                          const isCreditCard = installments.installments[0]?.billingType === 'CREDIT_CARD';
                          const paidCount = installments.installments.filter(i => {
                            if (isCreditCard) {
                              return i.status === 'CONFIRMED';
                            }
                            return i.status === 'PAID' || i.status === 'RECEIVED';
                          }).length;
                          return `${paidCount}/${installments.totalInstallments} ${isCreditCard ? 'confirmadas' : 'pagas'}`;
                        })()}
                      </span>
                    </div>

                    {/* Visual Progress Steps */}
                    <div className="flex space-x-1 mb-4">
                      {Array.from({ length: installments.totalInstallments }, (_, index) => {
                        const installment = installments.installments.find(i => i.installmentNumber === index + 1);
                        const isCreditCard = installment?.billingType === 'CREDIT_CARD';
                        const isPaid = isCreditCard 
                          ? installment?.status === 'CONFIRMED'
                          : installment?.status === 'PAID' || installment?.status === 'RECEIVED';
                        const isPending = installment?.status === 'PENDING';

              return (
                          <div
                            key={index}
                            className={`h-3 flex-1 rounded-full ${
                              isPaid
                                ? 'bg-green-500'
                                : isPending
                                ? 'bg-yellow-500'
                                : 'bg-gray-600'
                            }`}
                            title={`Parcela ${index + 1}: ${isPaid ? 'Paga' : isPending ? 'Pendente' : 'Futura'}`}
                          />
                        );
                      })}
                    </div>

                    {/* Total Value (Secondary) */}
                    <div className="text-center text-sm text-gray-400">
                      Total: R$ {Number(registration.total).toFixed(2)}
                    </div>
                  </div>

                  {/* Installments List with Actions */}
                  <div className="text-center mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-400 text-sm"
                      onClick={() => setShowAllInstallments(!showAllInstallments)}
                    >
                      {showAllInstallments ? 'Ocultar parcelas ▲' : 'Ver todas as parcelas ▼'}
                    </Button>
                  </div>

                  {showAllInstallments && (
                    <div className="space-y-3">
                      {installments.installments.map((installment) => {
                        const isCreditCard = installment.billingType === 'CREDIT_CARD';
                        const isPaid = isCreditCard 
                          ? installment.status === 'CONFIRMED'
                          : installment.status === 'PAID' || installment.status === 'RECEIVED';
                        
                        return (
                        <div
                          key={installment.id}
                          className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              installment.status === 'PENDING'
                                ? 'bg-yellow-500'
                                : isPaid
                                ? 'bg-green-500'
                                : 'bg-gray-500'
                            }`} />
                            <div>
                              <div className="text-sm font-medium text-white">
                                Parcela {installment.installmentNumber}
                              </div>
                              <div className="text-xs text-gray-400">
                                Vence em {new Date(installment.dueDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm font-bold text-white">
                                R$ {installment.value.toFixed(2)}
                              </div>
                              <div className={`text-xs ${
                                installment.status === 'PENDING'
                                  ? 'text-yellow-400'
                                  : isPaid
                                  ? 'text-green-400'
                                  : 'text-gray-400'
                              }`}>
                                {installment.status === 'PENDING' ? 'Pendente' :
                                 isPaid ? (isCreditCard ? 'Confirmado' : 'Pago') :
                                 installment.status}
                              </div>
                            </div>

                            {/* Action Button */}
                            {installment.status === 'PENDING' ? (
                              <Button
                                size="sm"
                                className={(() => {
                                  // Find the first pending installment to determine which one should show "Pagar agora"
                                  const firstPending = installments.installments.find(i => i.status === 'PENDING');
                                  const isNextPending = firstPending && installment.installmentNumber === firstPending.installmentNumber;

                                  return isNextPending
                                    ? "bg-orange-500 hover:bg-orange-600 text-white font-bold"
                                    : "text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-white";
                                })()}
                                variant={(() => {
                                  const firstPending = installments.installments.find(i => i.status === 'PENDING');
                                  const isNextPending = firstPending && installment.installmentNumber === firstPending.installmentNumber;
                                  return isNextPending ? "default" : "outline";
                                })()}
                                onClick={() => window.open(installment.invoiceUrl, '_blank')}
                              >
                                {(() => {
                                  const firstPending = installments.installments.find(i => i.status === 'PENDING');
                                  const isNextPending = firstPending && installment.installmentNumber === firstPending.installmentNumber;
                                  return isNextPending ? 'Pagar agora' : 'Pagar adiantado';
                                })()}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-text-gray">Carregando status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Registration Summary - Only for Installments */}
        {(registration.installments > 1 && registration.asaasPaymentId) ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                📝 Resumo da Inscrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Essential Info Only */}
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-300">Ingresso:</span>
                  <span className="ml-2 text-white">
                    {registration.ticketType}
                    {registration.partnerName && ` (Dupla: ${registration.partnerName})`}
                  </span>
                </div>
                {registration.selectedProducts && Object.keys(registration.selectedProducts).length > 0 && (
                  <div>
                    <span className="font-medium text-gray-300">Produtos:</span>
                    <span className="ml-2 text-white">
                      {Object.entries(registration.selectedProducts)
                        .filter(([_, option]) => option !== 'Não')
                        .map(([productName, selectedOption]) =>
                          selectedOption === 'Sim' ? productName : `${productName} ${selectedOption}`
                        )
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Collapsed Details */}
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-400 text-sm"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                >
                  {showFullDetails ? 'Ocultar detalhes ▲' : 'Ver detalhes completos ▼'}
                </Button>
              </div>

              {showFullDetails && (
                <div className="mt-4 pt-4 border-t border-gray-600/30 space-y-2">
                  <div>
                    <span className="font-medium text-gray-300">Nome:</span>
                    <span className="ml-2 text-white">{registration.fullName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Email:</span>
                    <span className="ml-2 text-white">{registration.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">WhatsApp:</span>
                    <span className="ml-2 text-white">{registration.whatsapp}</span>
                  </div>
                  {!registration.isForeigner && registration.cpf && (
                    <div>
                      <span className="font-medium text-gray-300">CPF:</span>
                      <span className="ml-2 text-white">{registration.cpf}</span>
                    </div>
                  )}
                  {registration.isForeigner && (
                    <div>
                      <span className="font-medium text-gray-300">Status:</span>
                      <span className="ml-2 text-white">Estrangeiro</span>
                    </div>
                  )}
                  {!registration.isForeigner && registration.state && (
                    <div>
                      <span className="font-medium text-gray-300">Localização:</span>
                      <span className="ml-2 text-white">{registration.city}, {registration.state}</span>
                    </div>
                  )}
                </div>
                )}
          </CardContent>
        </Card>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Data */}
          <Card>
            <CardHeader>
              <CardTitle>📋 DADOS DA INSCRIÇÃO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Nome:</span>
                <span className="ml-2">{registration.fullName}</span>
              </div>

              <div>
                <span className="font-medium">CPF/Estrangeiro:</span>
                <span className="ml-2">
                  {registration.isForeigner ? 'Estrangeiro' : registration.cpf}
                </span>
              </div>

              <div>
                <span className="font-medium">Email:</span>
                <span className="ml-2">{registration.email}</span>
              </div>

              <div>
                <span className="font-medium">WhatsApp:</span>
                <span className="ml-2">{registration.whatsapp}</span>
              </div>

              {!registration.isForeigner && (
                <>
                  <div>
                    <span className="font-medium">Estado:</span>
                    <span className="ml-2">{registration.state}</span>
                  </div>

                  <div>
                    <span className="font-medium">Cidade:</span>
                    <span className="ml-2">{registration.city}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ticket & Products */}
          <Card>
            <CardHeader>
              <CardTitle>🎟️ INGRESSO E PRODUTOS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Tipo:</span>
                <span className="ml-2">{registration.ticketType}</span>
              </div>

              {registration.partnerName && (
                <div>
                  <span className="font-medium">Nome da Dupla:</span>
                  <span className="ml-2">{registration.partnerName}</span>
                </div>
              )}

              {registration.selectedProducts && Object.keys(registration.selectedProducts).length > 0 && (
                <div>
                  <span className="font-medium">Produtos Adicionais:</span>
                  <div className="mt-2 space-y-2">
                    {Object.entries(registration.selectedProducts).map(([productName, selectedOption]) => {
                      const product = config?.products?.find(p => p.name === productName);
                      return (
                        <div key={productName} className="text-sm">
                          <div className="text-text-gray">
                            • {productName}: {selectedOption}
                          </div>
                          {product?.description && (
                            <div className="text-gray-500 text-xs mt-1 ml-4">
                              {product.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Financial Summary - Only for non-installment registrations */}
        {!(registration.installments > 1 && registration.asaasPaymentId) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💰 RESUMO FINANCEIRO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-purple mb-2">
                R$ {Number(registration.total).toFixed(2)}
              </div>
              <div className="space-y-2">
                <p className="text-text-gray">
                  Método de pagamento: {
                    registration.paymentMethod === 'pix' ? 'PIX' :
                      registration.paymentMethod === 'pix_installment' ? 'PIX Parcelado' :
                    registration.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                    registration.paymentMethod === 'asaas' ? 'ASAAS' :
                    registration.paymentMethod === 'paypal' ? 'PayPal' :
                    registration.paymentMethod
                  }
                </p>
                  {(registration.paymentMethod === 'credit_card' || registration.paymentMethod === 'pix_installment') && registration.installments > 1 && (
                  <p className="text-text-gray">
                    Parcelado em {registration.installments}x de R$ {(Number(registration.total) / registration.installments).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        )}


        {/* Next Steps - Only for non-installment registrations */}
        {!(registration.installments > 1 && registration.asaasPaymentId) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>⚠️ PRÓXIMOS PASSOS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registration.paymentStatus === 'paid' ? (
                <>
                  <p className="text-green-400 font-medium">
                    ✅ Pagamento confirmado! Sua inscrição está ativa.
                  </p>
                  <p>
                    Você receberá um email em <strong>{registration.email}</strong> com os detalhes do evento.
                  </p>
                  <p>
                    Guarde este protocolo <strong>#{generateProtocol(registration.id)}</strong> para futuras consultas.
                  </p>
                </>
              ) : registration.paymentStatus === 'refunded' ? (
                <>
                  <p className="text-orange-400 font-medium">
                    ⚠️ Pagamento reembolsado. Entre em contato conosco para mais informações.
                  </p>
                  <p>
                    Em caso de dúvidas, entre em contato conosco através do WhatsApp.
                  </p>
                </>
              ) : registration.paymentStatus === 'overdue' ? (
                <>
                  <p className="text-red-400 font-medium">
                    ❌ Pagamento vencido. Entre em contato conosco para regularizar.
                  </p>
                  <p>
                    O pagamento deve ser realizado para garantir sua vaga no evento.
                  </p>
                  <p>
                    Em caso de dúvidas, entre em contato conosco através do WhatsApp.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Você receberá um email em <strong>{registration.email}</strong> com as instruções de pagamento.
                  </p>
                  <p>
                    O pagamento deve ser realizado em até 48 horas para garantir sua vaga no evento.
                  </p>
                  <p>
                    <strong>Esta página será atualizada automaticamente</strong> quando o pagamento for confirmado.
                  </p>
                  <p>
                    Em caso de dúvidas, entre em contato conosco através do WhatsApp.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Actions - Only for non-installment registrations */}
        {!(registration.installments > 1 && registration.asaasPaymentId) && (
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button onClick={handleBackToHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>

          {(() => {
            const buttonState = getRefreshButtonState();
            return (
              <Button
                onClick={handleRefreshStatus}
                disabled={isRefreshing || buttonState.disabled}
                title={buttonState.description}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {buttonState.text}
              </Button>
            );
          })()}

          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Comprovante
          </Button>
        </div>
        )}

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              .bg-dark-bg {
                background: white !important;
              }
              .text-soft-white, .text-text-gray {
                color: black !important;
              }
              .gradient-text {
                color: black !important;
              }
              .border-neon-purple {
                border-color: black !important;
              }
              .text-neon-purple {
                color: black !important;
              }
              button {
                display: none !important;
              }
            }
          `
        }} />

        {/* Redundant Payment Button for Mobile - Only for Installments */}
        {(registration.installments > 1 && registration.asaasPaymentId) && installments && installments.installments.length > 0 && (
          <div className="mt-8 md:hidden">
            {(() => {
              const nextInstallment = installments.installments.find(i => i.status === 'PENDING');
              if (!nextInstallment || !nextInstallment.invoiceUrl) return null;

              return (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-50">
                  <Button
                    size="lg"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg py-4 rounded-xl shadow-2xl"
                    onClick={() => window.open(nextInstallment.invoiceUrl, '_blank')}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    PAGAR AGORA - R$ {nextInstallment.value.toFixed(2)}
                  </Button>
                  <div className="text-center text-xs text-gray-400 mt-2">
                    ⚡ Garanta sua vaga hoje
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
