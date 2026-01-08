import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Plus, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSiteNameWithYear } from '@/lib/site-config';
import { apiClient } from '@/lib/api-client';
import { useLandingData } from '@/hooks/use-landing-data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TicketType {
  name: string;
  price: number;
  requiresPartner: boolean;
  description?: string;
  isActive?: boolean; // Novo campo para controlar ativação/desativação
}

interface Product {
  name: string;
  price: number;
  options: string[];
  availableUntil?: string; // ISO date string
  description?: string; // Breve descrição do produto
}

interface FormConfig {
  foreignerOption: {
    enabled: boolean;
  };
  ticketTypes: TicketType[];
  products: Product[];
  termsAndConditions: string;
  paymentSettings: {
    dueDateLimit: string;
    allowPix: boolean;
    allowCreditCard: boolean;
    pixDiscountPercentage: number;
    creditCardFeePercentage: number;
  };
}

const FormConfigManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInactiveTickets, setShowInactiveTickets] = useState(false);
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  // Função para gerar termos e condições dinamicamente
  const generateTermsAndConditions = (eventTitle: string) => `TERMOS E CONDIÇÕES DE INSCRIÇÃO

1. ACEITAÇÃO DOS TERMOS
Ao realizar sua inscrição no evento ${eventTitle}, você concorda com todos os termos e condições aqui estabelecidos.

2. VALORES E PAGAMENTO
- Os valores das inscrições são não reembolsáveis após o pagamento.
- O pagamento deve ser realizado conforme as instruções enviadas por email.
- Em caso de não pagamento no prazo estabelecido, a inscrição será cancelada automaticamente.

3. PARTICIPAÇÃO NO EVENTO
- É obrigatória a apresentação de documento de identidade no credenciamento.
- Menores de 18 anos devem estar acompanhados por responsável legal.
- O evento se reserva o direito de recusar a entrada de participantes que não cumpram as regras estabelecidas.

4. CANCELAMENTO E REEMBOLSO
- Não há reembolso em caso de desistência do participante.
- Em caso de cancelamento do evento por motivos de força maior, será oferecido reembolso proporcional.

5. RESPONSABILIDADES
- O participante é responsável por sua segurança e integridade física durante o evento.
- O evento não se responsabiliza por objetos pessoais perdidos ou furtados.

6. ALTERAÇÕES
Estes termos podem ser alterados a qualquer momento, sendo as alterações comunicadas através do site oficial do evento.

Ao prosseguir com a inscrição, você declara ter lido, compreendido e aceito todos os termos e condições acima.`;

  // Atualizar termos quando eventData mudar
  useEffect(() => {
    if (eventData?.eventTitle) {
      setConfig(prev => ({
        ...prev,
        termsAndConditions: generateTermsAndConditions(eventData.eventTitle)
      }));
    }
  }, [eventData?.eventTitle]);

  // Função para calcular o número máximo de parcelas baseado na data limite
  const calculateMaxInstallments = (dueDateLimit: string): number => {
    if (!dueDateLimit) return 1;

    const today = new Date();
    const limitDate = new Date(dueDateLimit);

    // Calcula a diferença em meses entre hoje e a data limite
    const monthsDiff = (limitDate.getFullYear() - today.getFullYear()) * 12 +
                      (limitDate.getMonth() - today.getMonth());

    // Adiciona uma margem de segurança de 1 mês para garantir que não passe da data limite
    const maxInstallments = Math.max(1, monthsDiff - 1);

    // Limita a um máximo de 12 parcelas (padrão do mercado)
    return Math.min(maxInstallments, 12);
  };
  const [config, setConfig] = useState<FormConfig>({
    foreignerOption: { enabled: true },
    ticketTypes: [
      { name: 'Individual', price: 350.00, requiresPartner: false, description: 'Ingresso individual para o evento', isActive: true },
      { name: 'Dupla', price: 600.00, requiresPartner: true, description: 'Ingresso para casal com desconto especial', isActive: true }
    ],
    products: [
      { name: 'Camiseta', price: 85.00, options: ['P', 'M', 'G', 'GG'], availableUntil: '2025-12-31T23:59:59Z' },
      { name: 'Combo Alimentação', price: 145.00, options: ['Sim'], availableUntil: '2025-11-30T23:59:59Z' }
    ],
    termsAndConditions: generateTermsAndConditions(eventData?.eventTitle || getSiteNameWithYear('2025')),
        paymentSettings: {
          dueDateLimit: '2025-12-31',
          allowPix: true,
          allowCreditCard: true,
          pixDiscountPercentage: 5,
          creditCardFeePercentage: 5
        }
  });

  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getFormConfig() as any;

      if (response && response.configData) {
        // Garantir que todos os tipos de ingresso tenham isActive (default: true para compatibilidade)
        const configData = {
          ...response.configData,
          ticketTypes: (response.configData.ticketTypes || []).map((ticket: TicketType) => ({
            ...ticket,
            isActive: ticket.isActive !== undefined ? ticket.isActive : true
          }))
        };
        setConfig(configData);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);

      const response = await apiClient.createFormConfig({
        eventId: 1, // Assumindo evento ID 1
        configData: config
      });

      toast({
        title: 'Sucesso',
        description: 'Configuração salva com sucesso!',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTicketType = () => {
    setConfig(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: '', price: 0, requiresPartner: false, isActive: true }]
    }));
  };

  const removeTicketType = (index: number) => {
    setConfig(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    setConfig(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const addProduct = () => {
    setConfig(prev => ({
      ...prev,
      products: [...prev.products, { name: '', price: 0, options: [''] }]
    }));
  };

  const removeProduct = (index: number) => {
    setConfig(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setConfig(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const addProductOption = (productIndex: number) => {
    setConfig(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === productIndex
          ? { ...product, options: [...product.options, ''] }
          : product
      )
    }));
  };

  const removeProductOption = (productIndex: number, optionIndex: number) => {
    setConfig(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === productIndex
          ? { ...product, options: product.options.filter((_, j) => j !== optionIndex) }
          : product
      )
    }));
  };

  const updateProductOption = (productIndex: number, optionIndex: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === productIndex
          ? {
              ...product,
              options: product.options.map((option, j) =>
                j === optionIndex ? value : option
              )
            }
          : product
      )
    }));
  };

  const previewForm = () => {
    window.open('/inscricao', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Configuração do Formulário</h1>
          <p className="text-slate-400 mt-1">Configure os campos e produtos do formulário de inscrição</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={previewForm}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Pré-visualizar
          </Button>
          <Button
            onClick={saveConfig}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Configuração
          </Button>
        </div>
      </div>

      {/* Opções Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Opções Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="foreigner-option"
              checked={config.foreignerOption.enabled}
              onCheckedChange={(checked) =>
                setConfig(prev => ({
                  ...prev,
                  foreignerOption: { enabled: checked }
                }))
              }
            />
            <Label htmlFor="foreigner-option">Permitir inscrição de estrangeiros</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Ingresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipos de Ingresso</CardTitle>
            <Button variant="outline" size="sm" onClick={addTicketType}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Tipo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipos Ativos */}
          <div className="space-y-4">
            {config.ticketTypes.filter(t => t.isActive !== false).map((ticket, index) => {
              const actualIndex = config.ticketTypes.indexOf(ticket);
              return (
                <div key={actualIndex} className="border border-slate-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">Ingresso #{actualIndex + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`ticket-active-${actualIndex}`}
                          checked={ticket.isActive !== false}
                          onCheckedChange={(checked) => updateTicketType(actualIndex, 'isActive', checked)}
                        />
                        <Label htmlFor={`ticket-active-${actualIndex}`} className="text-sm text-green-400">
                          Ativo
                        </Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTicketType(actualIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`ticket-name-${actualIndex}`}>Nome</Label>
                      <Input
                        id={`ticket-name-${actualIndex}`}
                        value={ticket.name}
                        onChange={(e) => updateTicketType(actualIndex, 'name', e.target.value)}
                        placeholder="Ex: Individual, Dupla"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`ticket-price-${actualIndex}`}>Preço (R$)</Label>
                      <Input
                        id={`ticket-price-${actualIndex}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(actualIndex, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="350.00"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`ticket-partner-${actualIndex}`}
                        checked={ticket.requiresPartner}
                        onCheckedChange={(checked) => updateTicketType(actualIndex, 'requiresPartner', checked)}
                      />
                      <Label htmlFor={`ticket-partner-${actualIndex}`}>Requer nome da dupla</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`ticket-description-${actualIndex}`}>Descrição</Label>
                    <Textarea
                      id={`ticket-description-${actualIndex}`}
                      value={ticket.description || ''}
                      onChange={(e) => updateTicketType(actualIndex, 'description', e.target.value)}
                      placeholder="Breve descrição do tipo de ingresso..."
                      rows={2}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tipos Inativos (Colapsável) */}
          {config.ticketTypes.filter(t => t.isActive === false).length > 0 && (
            <Collapsible open={showInactiveTickets} onOpenChange={setShowInactiveTickets}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm font-medium">
                      Tipos Inativos ({config.ticketTypes.filter(t => t.isActive === false).length})
                    </span>
                  </div>
                  {showInactiveTickets ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-4">
                {config.ticketTypes.filter(t => t.isActive === false).map((ticket, index) => {
                  const actualIndex = config.ticketTypes.indexOf(ticket);
                  return (
                    <div key={actualIndex} className="border border-slate-700/50 rounded-lg p-4 space-y-4 opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-slate-400">Ingresso #{actualIndex + 1}</h4>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`ticket-active-inactive-${actualIndex}`}
                              checked={false}
                              onCheckedChange={(checked) => updateTicketType(actualIndex, 'isActive', checked)}
                            />
                            <Label htmlFor={`ticket-active-inactive-${actualIndex}`} className="text-sm text-slate-500">
                              Inativo
                            </Label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketType(actualIndex, 'isActive', true)}
                            className="text-green-400 hover:text-green-300 border-green-500/30"
                          >
                            Reativar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTicketType(actualIndex)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`ticket-name-inactive-${actualIndex}`} className="text-slate-500">Nome</Label>
                          <Input
                            id={`ticket-name-inactive-${actualIndex}`}
                            value={ticket.name}
                            onChange={(e) => updateTicketType(actualIndex, 'name', e.target.value)}
                            placeholder="Ex: Individual, Dupla"
                            className="bg-slate-800/50 text-slate-400"
                            disabled
                          />
                        </div>

                        <div>
                          <Label htmlFor={`ticket-price-inactive-${actualIndex}`} className="text-slate-500">Preço (R$)</Label>
                          <Input
                            id={`ticket-price-inactive-${actualIndex}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(actualIndex, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="350.00"
                            className="bg-slate-800/50 text-slate-400"
                            disabled
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`ticket-partner-inactive-${actualIndex}`}
                            checked={ticket.requiresPartner}
                            onCheckedChange={(checked) => updateTicketType(actualIndex, 'requiresPartner', checked)}
                            disabled
                          />
                          <Label htmlFor={`ticket-partner-inactive-${actualIndex}`} className="text-slate-500">Requer nome da dupla</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`ticket-description-inactive-${actualIndex}`} className="text-slate-500">Descrição</Label>
                        <Textarea
                          id={`ticket-description-inactive-${actualIndex}`}
                          value={ticket.description || ''}
                          onChange={(e) => updateTicketType(actualIndex, 'description', e.target.value)}
                          placeholder="Breve descrição do tipo de ingresso..."
                          rows={2}
                          className="bg-slate-800/50 text-slate-400"
                          disabled
                        />
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Produtos Adicionais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos Adicionais</CardTitle>
            <Button variant="outline" size="sm" onClick={addProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.products.map((product, index) => (
            <div key={index} className="border border-slate-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Produto #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`product-name-${index}`}>Nome</Label>
                  <Input
                    id={`product-name-${index}`}
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    placeholder="Ex: Camiseta, Combo Alimentação"
                  />
                </div>

                <div>
                  <Label htmlFor={`product-price-${index}`}>Preço (R$)</Label>
                  <Input
                    id={`product-price-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.price}
                    onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="85.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`product-description-${index}`}>Descrição (opcional)</Label>
                <Textarea
                  id={`product-description-${index}`}
                  value={product.description || ''}
                  onChange={(e) => updateProduct(index, 'description', e.target.value)}
                  placeholder="Ex: Camiseta oficial do evento com design exclusivo"
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor={`product-available-until-${index}`}>Disponível até (opcional)</Label>
                <Input
                  id={`product-available-until-${index}`}
                  type="datetime-local"
                  value={product.availableUntil ? new Date(product.availableUntil).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateProduct(index, 'availableUntil', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
                <p className="text-sm text-slate-400 mt-1">
                  Se preenchido, o produto só estará disponível até esta data
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Opções/Tamanhos</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addProductOption(index)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Opção
                  </Button>
                </div>

                <div className="space-y-2">
                  {product.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateProductOption(index, optionIndex, e.target.value)}
                        placeholder="Ex: P, M, G, GG"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductOption(index, optionIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Termos e Condições */}
      <Card>
        <CardHeader>
          <CardTitle>Termos e Condições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="terms-and-conditions">Texto dos Termos e Condições</Label>
              <Textarea
                id="terms-and-conditions"
                value={config.termsAndConditions}
                onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                placeholder="Digite os termos e condições que serão exibidos no formulário de inscrição..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-sm text-slate-400 mt-2">
                Este texto será exibido em um popup quando o usuário clicar em "Termos e Condições" no formulário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pagamento</CardTitle>
          <p className="text-sm text-slate-400">
            Configure as opções de pagamento disponíveis para os usuários
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="due-date-limit">Data Limite para Vencimento</Label>
                <Input
                  id="due-date-limit"
                  type="date"
                  value={config.paymentSettings?.dueDateLimit || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    paymentSettings: {
                      ...config.paymentSettings,
                      dueDateLimit: e.target.value
                    }
                  })}
                />
              <p className="text-sm text-slate-400 mt-1">
                Data limite para vencimento de boletos e parcelas. O sistema calculará automaticamente o número máximo de parcelas que cabem dentro deste prazo.
              </p>
              {config.paymentSettings?.dueDateLimit && (
                <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Máximo de parcelas calculado:</strong> {calculateMaxInstallments(config.paymentSettings.dueDateLimit)}x
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    Baseado na data limite: {new Date(config.paymentSettings.dueDateLimit).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="pix-discount">PIX - Vantagem sem Taxa Sistema (%)</Label>
              <Input
                id="pix-discount"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={config.paymentSettings?.pixDiscountPercentage || 5}
                onChange={(e) => setConfig({
                  ...config,
                  paymentSettings: {
                    ...config.paymentSettings,
                    pixDiscountPercentage: parseFloat(e.target.value) || 0
                  }
                })}
                placeholder="5"
              />
              <p className="text-sm text-slate-400 mt-1">
                PIX apresentado como vantagem por não ter taxa do sistema. Outros métodos mostram taxa adicional sobre o valor base.
              </p>
            </div>

            <div>
              <Label htmlFor="credit-card-fee">Taxa Cartão (%)</Label>
              <Input
                id="credit-card-fee"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={config.paymentSettings?.creditCardFeePercentage || 5}
                onChange={(e) => setConfig({
                  ...config,
                  paymentSettings: {
                    ...config.paymentSettings,
                    creditCardFeePercentage: parseFloat(e.target.value) || 0
                  }
                })}
                placeholder="5"
              />
              <p className="text-sm text-slate-400 mt-1">
                Taxa do sistema aplicada no PIX parcelado e cartão de crédito (não é taxa adicional por cartão)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch
                  id="allow-pix"
                  checked={config.paymentSettings?.allowPix || true}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    paymentSettings: {
                      ...config.paymentSettings,
                      allowPix: checked
                    }
                  })}
                />
              <Label htmlFor="allow-pix">Permitir Pagamento via PIX</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allow-credit-card"
                checked={config.paymentSettings?.allowCreditCard || true}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  paymentSettings: {
                    ...config.paymentSettings,
                    allowCreditCard: checked
                  }
                })}
              />
              <Label htmlFor="allow-credit-card">Permitir Pagamento via Cartão de Crédito</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-700 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormConfigManager;
