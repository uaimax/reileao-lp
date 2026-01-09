import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/hooks/useLanguage';
import { EnhancedCheckbox } from '@/components/EnhancedCheckbox';
import { InstallmentSelector } from '@/components/InstallmentSelector';
import { SEOHead } from '@/components/SEOHead';
import { useLandingData } from '@/hooks/use-landing-data';
import { usePageTracking, useMetaPixelTracking, useFormTracking } from '@/hooks/use-meta-pixel';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/phone-input.css';
import { SITE_NAME, getSiteNameWithYear } from '@/lib/site-config';
import Stepper from '@/components/ui/stepper';

interface TicketType {
  isActive?: boolean;
  name: string;
  price: number;
  requiresPartner: boolean;
  description?: string;
}

interface Product {
  name: string;
  price: number;
  options: string[];
  availableUntil?: string;
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

interface FormData {
  isForeigner: boolean;
  cpf: string;
  fullName: string;
  email: string;
  whatsapp: string;
  birthDate: string;
  state: string;
  city: string;
  ticketType: string;
  partnerName: string;
  selectedProducts: { [key: string]: string };
  termsAccepted: boolean;
  noRefundAccepted: boolean;
  rescheduleAccepted: boolean;
  withdrawalAccepted: boolean;
  interestAccepted: boolean;
  paymentMethod: 'pix' | 'pix_installment' | 'credit_card';
  installments: number;
}

type FormSection = 'identification' | 'tickets' | 'products' | 'payment' | 'summary';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { data: landingData } = useLandingData();

  // Meta Pixel tracking
  usePageTracking('Registration Form');
  const { trackInitiateCheckout, trackCompleteRegistration, trackCustomEvent } = useMetaPixelTracking();
  const { trackFormStart, trackFormSubmit, trackFormComplete } = useFormTracking('Event Registration');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [eventConfig, setEventConfig] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<FormSection>('identification');
  const [completedSections, setCompletedSections] = useState<Set<FormSection>>(new Set());

  // Track form start when component mounts
  useEffect(() => {
    trackFormStart();
    trackCustomEvent('RegistrationFormView', {
      content_name: 'Event Registration Form',
      content_category: 'form',
      event_name: eventConfig?.eventTitle || SITE_NAME
    });
  }, [trackFormStart, trackCustomEvent, eventConfig]);

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

  // Função para verificar se uma seção está completa
  // 🏆 GHOST SELECTION LOCKDOWN - Função para detectar placeholders
  const isValidSelection = (value: string | null | undefined): boolean => {
    if (!value) return false;

    const trimmedValue = value.trim();

    // Lista de placeholders conhecidos (incluindo múltiplos idiomas)
    const placeholders = [
      '',
      'Selecione uma opção',
      'Selecione',
      'Select an option',
      'Select',
      'Escolha uma opção',
      'Escolha',
      'Choose an option',
      'Choose',
      'Seleccione una opción',
      'Seleccione',
      '-- Selecione --',
      '-- Select --',
      '-- Escolha --'
    ];

    return !placeholders.includes(trimmedValue);
  };

  // 🎯 UX EXPERT: Validação simples - qualquer resposta válida habilita o botão
  const isProductsSectionValid = (): boolean => {
    if (!config?.products) return true;

    // Para cada produto, verificar se tem QUALQUER resposta válida
    for (const product of config.products) {
      const selectedValue = formData.selectedProducts[product.name];

      // Se não tem resposta alguma, não pode continuar
      if (!selectedValue || selectedValue === '') {
        return false;
      }

      // Se tem resposta, verificar se é válida
      if (selectedValue === 'Não' || selectedValue === 'Não quero.') {
        // "Não" é uma resposta válida
        continue;
      }

      // Para produtos boolean, "Sim" é válido
      if ((product as any).isBoolean && selectedValue === 'Sim') {
        continue;
      }

      // Para produtos com opções, verificar se a opção é válida
      if (product.options && product.options.length > 0) {
        if (product.options.includes(selectedValue)) {
          continue;
        }
      }

      // Se chegou aqui, a resposta não é válida
      return false;
    }

    return true;
  };

  const isSectionComplete = (section: FormSection): boolean => {
    switch (section) {
      case 'identification':
        return !!(formData.fullName && formData.email && formData.whatsapp && formData.birthDate &&
                 (!formData.isForeigner ? (formData.cpf && !cpfError && isValidSelection(formData.state) && isValidSelection(formData.city)) : true));
      case 'tickets':
        return !!isValidSelection(formData.ticketType) &&
               (!config?.ticketTypes?.find(t => t.name === formData.ticketType)?.requiresPartner || !!formData.partnerName);
      case 'products':
        return isProductsSectionValid();
      case 'payment':
        return !!formData.paymentMethod;
      case 'summary':
        return formData.termsAccepted && formData.noRefundAccepted && formData.rescheduleAccepted && formData.withdrawalAccepted;
      default:
        return false;
    }
  };

  // Função para avançar para a próxima seção
  const goToNextSection = () => {
    // 🏆 GHOST SELECTION LOCKDOWN - Validação adicional antes de avançar
    if (currentSection === 'products' && !isProductsSectionValid()) {
      console.log('🚨 GHOST SELECTION LOCKDOWN: Tentativa de avançar com formulário inválido bloqueada!');
      return;
    }

    const sections: FormSection[] = ['identification', 'tickets', 'products', 'payment', 'summary'];
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCompletedSections(prev => new Set([...prev, currentSection]));
      setCurrentSection(nextSection);
    }
  };

  // Função para voltar para a seção anterior
  const goToPreviousSection = () => {
    const sections: FormSection[] = ['identification', 'tickets', 'products', 'payment', 'summary'];
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentSection(prevSection);
    }
  };

  // Função para calcular o valor final baseado no método de pagamento
  const calculateFinalTotal = (baseTotal: number, paymentMethod: string): number => {
    if (!config?.paymentSettings || !baseTotal || baseTotal <= 0) return baseTotal;

    const { pixDiscountPercentage = 5, creditCardFeePercentage = 5 } = config.paymentSettings;

    if (paymentMethod === 'pix') {
      // PIX à vista: sem taxa do sistema (valor base sem acréscimos)
      return baseTotal * (1 - pixDiscountPercentage / 100);
    } else if (paymentMethod === 'pix_installment') {
      // PIX parcelado: com taxa do sistema
      return baseTotal * (1 + creditCardFeePercentage / 100);
    } else if (paymentMethod === 'credit_card') {
      // Cartão: com taxa do sistema
      return baseTotal * (1 + creditCardFeePercentage / 100);
    }

    return baseTotal;
  };

  // Função para calcular o valor da economia/taxa
  const calculateSavings = (baseTotal: number, paymentMethod: string): number => {
    if (!config?.paymentSettings || !baseTotal || baseTotal <= 0) return 0;

    const { pixDiscountPercentage = 5, creditCardFeePercentage = 5 } = config.paymentSettings;

    if (paymentMethod === 'pix') {
      // PIX à vista: diferença do valor base (sem taxa do sistema)
      return baseTotal * (pixDiscountPercentage / 100);
    } else if (paymentMethod === 'pix_installment') {
      // PIX parcelado: taxa do sistema (valor adicional)
      return baseTotal * (creditCardFeePercentage / 100);
    } else if (paymentMethod === 'credit_card') {
      // Cartão: taxa do sistema (valor adicional)
      return baseTotal * (creditCardFeePercentage / 100);
    }

    return 0;
  };
  const [states, setStates] = useState<Array<{id: string, nome: string, sigla: string}>>([]);
  const [cities, setCities] = useState<Array<{id: string, nome: string}>>([]);
  const [cpfError, setCpfError] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    isForeigner: false,
    cpf: '',
    fullName: '',
    email: '',
    whatsapp: '',
    birthDate: '',
    state: '',
    city: '',
    ticketType: '',
    partnerName: '',
    selectedProducts: {}, // Inicia sem produtos selecionados
    termsAccepted: false,
    noRefundAccepted: false,
    rescheduleAccepted: false,
    withdrawalAccepted: false,
    interestAccepted: false,
    paymentMethod: 'pix',
    installments: 1
  });

  useEffect(() => {
    loadConfig();
    loadEventConfig();
    loadStates();
  }, []);

  // Reset installments when payment method changes
  useEffect(() => {
    if (formData.paymentMethod === 'pix') {
      setFormData(prev => ({ ...prev, installments: 1 }));
    } else if (formData.paymentMethod === 'pix_installment' || formData.paymentMethod === 'credit_card') {
      // Keep current installments or set to 1 if not set
      setFormData(prev => ({ ...prev, installments: prev.installments || 1 }));
    }
  }, [formData.paymentMethod]);

  useEffect(() => {
    if (formData.state) {
      loadCities(formData.state);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getFormConfig() as any;
      setConfig(response.configData);
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração do formulário',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventConfig = async () => {
    try {
      const response = await apiClient.getEventConfig() as any;
      setEventConfig(response);
    } catch (error) {
      console.error('Error loading event config:', error);
      // Não mostrar toast para erro de configuração do evento, usar valor padrão
    }
  };

  const loadStates = async () => {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const data = await response.json();
      setStates(data.sort((a: any, b: any) => a.nome.localeCompare(b.nome)));
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadCities = async (stateId: string) => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`);
      const data = await response.json();
      setCities(data.sort((a: any, b: any) => a.nome.localeCompare(b.nome)));
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const validateCPF = (cpf: string): boolean => {
    // Remove formatting
    const cleanCPF = cpf.replace(/\D/g, '');

    // Check if has 11 digits
    if (cleanCPF.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  // Função para validar CPF em tempo real
  const handleCpfChange = (value: string) => {
    const formattedCpf = formatCPF(value);
    setFormData({ ...formData, cpf: formattedCpf });

    // Validação em tempo real
    if (formattedCpf.length === 14) { // CPF completo formatado
      if (validateCPF(formattedCpf)) {
        setCpfError('');
      } else {
        setCpfError('CPF inválido');
      }
    } else if (formattedCpf.length > 0) {
      setCpfError('CPF incompleto');
    } else {
      setCpfError('');
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculateTotal = () => {
    if (!config) return 0;

    let total = 0;

    // Add ticket price
    const selectedTicket = config.ticketTypes?.find(t => t.name === formData.ticketType);
    if (selectedTicket) {
      total += selectedTicket.price || 0;
    }

    // Add product prices
    Object.entries(formData.selectedProducts).forEach(([productName, option]) => {
      const product = config.products?.find(p => p.name === productName);
      if (product && option !== 'Não') {
        // For boolean products, check if option is 'Sim'
        if ((product as any).isBoolean) {
          if (option === 'Sim') {
            total += product.price || 0;
          }
        } else {
          total += product.price || 0;
        }
      }
    });

    return total;
  };

  // Função para calcular data limite de desistência (60 dias antes do evento)
  const calculateWithdrawalDeadline = () => {
    // Usar a data de início do evento configurada no painel
    let eventDate: Date;

    if (eventConfig?.eventCountdownTarget) {
      try {
        eventDate = new Date(eventConfig.eventCountdownTarget);
        // Verificar se a data é válida
        if (isNaN(eventDate.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        console.warn('Invalid eventCountdownTarget, using default date:', error);
        // Fallback para data padrão se a configuração estiver inválida
        eventDate = new Date('2025-09-05T14:00:00');
      }
    } else {
      // Fallback para data padrão se não houver configuração
      eventDate = new Date('2025-09-05T14:00:00');
    }

    // Calcular 60 dias antes da data do evento
    const withdrawalDate = new Date(eventDate);
    withdrawalDate.setDate(withdrawalDate.getDate() - 60);

    return withdrawalDate.toLocaleDateString('pt-BR');
  };

  // Função de validação (apenas no submit)
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Validação da seção de identificação
    if (!formData.fullName.trim()) errors.push(t('validation.fullName.required'));

    if (!formData.email.trim()) {
      errors.push(t('validation.email.required'));
    } else if (!validateEmail(formData.email)) {
      errors.push(t('validation.email.invalid'));
    }

    if (!formData.whatsapp.trim()) errors.push(t('validation.whatsapp.required'));
    if (!formData.birthDate) errors.push(t('validation.birthDate.required'));

    if (!formData.isForeigner) {
      if (!formData.cpf.trim()) {
        errors.push(t('validation.cpf.required'));
      } else if (cpfError) {
        errors.push(cpfError);
      }

      if (!formData.state) errors.push(t('validation.state.required'));
      if (!formData.city.trim()) errors.push(t('validation.city.required'));
    }

    // Validação da seção de tickets
    if (!formData.ticketType) errors.push(t('validation.ticketType.required'));

    const selectedTicket = config?.ticketTypes?.find(t => t.name === formData.ticketType);
    if (selectedTicket?.requiresPartner && !formData.partnerName.trim()) {
      errors.push(t('validation.partnerName.required'));
    }

    // Validação da seção de produtos - removida pois é feita em tempo real

    // Validação da seção de pagamento
    if (!formData.paymentMethod) errors.push(t('validation.paymentMethod.required'));

    // Validação da seção de termos
    if (!formData.termsAccepted) errors.push(t('validation.terms.required'));
    if (!formData.noRefundAccepted) errors.push(t('validation.noRefund.required'));
    if (!formData.rescheduleAccepted) errors.push('Você deve aceitar os termos sobre remarcação do evento');
    if (!formData.withdrawalAccepted) errors.push('Você deve aceitar os termos sobre desistência');

    // Validação específica para métodos de pagamento parcelado (taxa de juros)
    if ((formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'pix_installment') && !formData.interestAccepted) {
      errors.push(t('validation.interest.required'));
    }

    // Validação de idade
    const birth = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    if (age < 18) errors.push('Você deve ter 18 anos ou mais');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Erro de validação',
        description: errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Track form submission
      trackFormSubmit();

      // Calculate total for tracking
      const total = calculateFinalTotal(calculateTotal(), formData.paymentMethod) || calculateTotal() || 0;

      // Track initiate checkout
      trackInitiateCheckout(total, 'BRL', [formData.ticketType]);

      // Track custom event
      trackCustomEvent('RegistrationSubmit', {
        content_name: 'Event Registration',
        content_category: 'form',
        event_name: eventConfig?.eventTitle || SITE_NAME,
        ticket_type: formData.ticketType,
        payment_method: formData.paymentMethod,
        installments: formData.installments,
        total_value: total,
        currency: 'BRL',
        is_foreigner: formData.isForeigner,
        has_partner: !!formData.partnerName
      });

      // 1. Primeiro, salvar a inscrição no banco
      const baseTotal = calculateTotal();
      const finalTotal = calculateFinalTotal(baseTotal, formData.paymentMethod) || baseTotal || 0;
      const savingsOrFee = calculateSavings(baseTotal, formData.paymentMethod);

      // Determinar se é desconto (PIX) ou taxa (parcelado/cartão)
      const isDiscount = formData.paymentMethod === 'pix';
      const discountAmount = isDiscount ? savingsOrFee : 0;
      const feeAmount = !isDiscount ? savingsOrFee : 0;

      // Obter a porcentagem aplicada
      const feePercentage = config?.paymentSettings
        ? (formData.paymentMethod === 'pix'
            ? config.paymentSettings.pixDiscountPercentage || 5
            : config.paymentSettings.creditCardFeePercentage || 5)
        : 5;

      // Criar snapshot dos produtos com preços no momento da compra
      const productsSnapshot = Object.entries(formData.selectedProducts)
        .map(([productName, option]) => {
          const product = config?.products?.find(p => p.name === productName);
          if (!product || option === 'Não' || !option) return null;

          // Para produtos boolean, só incluir se for 'Sim'
          if ((product as any).isBoolean && option !== 'Sim') return null;

          return {
            name: productName,
            option: option,
            price: product.price || 0
          };
        })
        .filter(Boolean); // Remove nulls

      // Obter preço do ingresso
      const selectedTicket = config?.ticketTypes?.find(t => t.name === formData.ticketType);
      const ticketPrice = selectedTicket?.price || 0;

      const response = await apiClient.createRegistration({
        eventId: 1,
        cpf: formData.isForeigner ? null : formData.cpf,
        isForeigner: formData.isForeigner,
        fullName: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        birthDate: formData.birthDate,
        state: formData.isForeigner ? null : formData.state,
        city: formData.isForeigner ? null : formData.city,
        ticketType: formData.ticketType,
        ticketPrice: ticketPrice,
        partnerName: formData.partnerName || null,
        selectedProducts: formData.selectedProducts,
        productsSnapshot: productsSnapshot,
        baseTotal: baseTotal,
        discountAmount: discountAmount,
        feeAmount: feeAmount,
        feePercentage: feePercentage,
        total: finalTotal,
        termsAccepted: formData.termsAccepted,
        paymentMethod: formData.isForeigner ? 'paypal' : formData.paymentMethod,
        installments: (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'pix_installment') ? formData.installments : 1
      }) as any;

      const registrationId = response.id;

      // Track successful registration
      trackFormComplete();
      trackCompleteRegistration(total, 'BRL');
      trackCustomEvent('RegistrationComplete', {
        content_name: 'Event Registration Complete',
        content_category: 'conversion',
        event_name: eventConfig?.eventTitle || SITE_NAME,
        registration_id: registrationId,
        ticket_type: formData.ticketType,
        payment_method: formData.paymentMethod,
        total_value: total,
        currency: 'BRL',
        is_foreigner: formData.isForeigner,
        has_partner: !!formData.partnerName
      });

      // 2. Se for estrangeiro (PayPal), redirecionar para confirmação
      if (formData.isForeigner) {
        navigate(`/inscricao/confirmacao/${registrationId}`);
        return;
      }

        // 3. Para brasileiros, criar cobrança ASAAS
        try {
          const chargeResponse = await apiClient.createCharge(registrationId) as any;

          if (chargeResponse.success) {
            // Redirecionar para página de confirmação que mostrará os links de pagamento
            navigate(`/inscricao/confirmacao/${registrationId}`);
          } else {
            throw new Error('Erro ao criar cobrança ASAAS');
          }
        } catch (chargeError: any) {
          console.error('Error creating charge:', chargeError);

          // Se falhar a cobrança, redirecionar para confirmação mesmo assim
          toast({
            title: 'Aviso',
            description: 'Inscrição salva, mas houve problema ao gerar cobrança. Você será redirecionado para a página de confirmação.',
            variant: 'default'
          });

          setTimeout(() => {
            navigate(`/inscricao/confirmacao/${registrationId}`);
          }, 2000);
        }

    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro ao processar inscrição',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-black">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-black">{t('error.config')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={(landingData as any)?.event?.metaTitle || `${(landingData as any)?.event?.eventTitle || getSiteNameWithYear('2025')} - ${t('header.title')}`}
        description={(landingData as any)?.event?.metaDescription || `${(landingData as any)?.event?.eventTitle || getSiteNameWithYear('2025')} - ${t('header.subtitle')}`}
        image={(landingData as any)?.event?.metaImageUrl}
        url={window.location.href}
        type="website"
      />
      <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header com progresso */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-bebas mb-2 text-black">
            {eventConfig?.eventTitle || getSiteNameWithYear('2025')} - {t('header.title')}
          </h1>
          {(landingData?.event?.eventDateDisplay || eventConfig?.eventDateDisplay) && (
            <p className="text-lg font-semibold text-slate-700 mb-2">
              📅 {(landingData?.event?.eventDateDisplay || eventConfig?.eventDateDisplay)}
            </p>
          )}
          <p className="text-slate-600">{t('header.subtitle')}</p>

          {/* Stepper melhorado */}
          <div className="mt-6">
            <Stepper
              steps={[
                { id: 'identification', label: t('progress.identification') },
                { id: 'tickets', label: t('progress.tickets') },
                { id: 'products', label: t('progress.products') },
                { id: 'payment', label: t('progress.payment') },
                { id: 'summary', label: t('progress.summary') }
              ]}
              currentStep={currentSection}
              completedSteps={completedSections}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção 1: Identificação */}
          {currentSection === 'identification' && (
            <Card className="animate-in slide-in-from-right-4 duration-300 bg-white border border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold mr-3">1</span>
                  {t('progress.identification')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {config.foreignerOption?.enabled && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isForeigner"
                      data-testid="isForeigner"
                      checked={formData.isForeigner}
                      onCheckedChange={(checked) => setFormData({ ...formData, isForeigner: !!checked })}
                    />
                    <Label htmlFor="isForeigner">Sou estrangeiro / I am a foreigner</Label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">{t('form.fullName')}</Label>
                    <Input
                      id="fullName"
                      data-testid="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t('form.fullName.placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('form.email')}</Label>
                    <Input
                      id="email"
                      data-testid="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('form.email.placeholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsapp">{t('form.whatsapp')}</Label>
                    <PhoneInput
                      id="whatsapp"
                      data-testid="whatsapp"
                      value={formData.whatsapp}
                      onChange={(value) => setFormData({ ...formData, whatsapp: value || '' })}
                      defaultCountry="BR"
                      placeholder={t('form.whatsapp.placeholder')}
                      className="phone-input-custom"
                      style={{
                        '--PhoneInput-color--focus': '#eab308',
                        '--PhoneInputCountrySelect-marginRight': '0.5em',
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">{t('form.birthDate')}</Label>
                    <Input
                      id="birthDate"
                      data-testid="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />
                  </div>
                </div>

                {!formData.isForeigner && (
                  <>
                    <div>
                      <Label htmlFor="cpf">{t('form.cpf')}</Label>
                      <Input
                        id="cpf"
                        data-testid="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder={t('form.cpf.placeholder')}
                        maxLength={14}
                        className={cpfError ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {cpfError && (
                        <div className="text-red-400 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{cpfError}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">{t('form.state')}</Label>
                        <Select value={formData.state} onValueChange={(value) => {
                          setFormData({ ...formData, state: value });
                          loadCities(value);
                        }}>
                          <SelectTrigger data-testid="state" className={!isValidSelection(formData.state) && formData.state ? 'border-red-500' : ''}>
                            <SelectValue placeholder={t('form.state.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.sigla}>
                                {state.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* 🏆 GHOST SELECTION LOCKDOWN - Feedback para Estado */}
                        {formData.state && !isValidSelection(formData.state) && (
                          <div className="text-red-400 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>🚨 Selecione um estado válido</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="city">{t('form.city')}</Label>
                        <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                          <SelectTrigger data-testid="city" className={!isValidSelection(formData.city) && formData.city ? 'border-red-500' : ''}>
                            <SelectValue placeholder={t('form.city.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.nome}>
                                {city.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* 🏆 GHOST SELECTION LOCKDOWN - Feedback para Cidade */}
                        {formData.city && !isValidSelection(formData.city) && (
                          <div className="text-red-400 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>🚨 Selecione uma cidade válida</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={goToNextSection}
                    disabled={!isSectionComplete('identification')}
                    className={`transition-all duration-200 font-semibold ${
                      isSectionComplete('identification')
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer opacity-100 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 hover:bg-gray-300'
                    }`}
                    onKeyDown={(e) => {
                      // 🏆 GHOST SELECTION LOCKDOWN - Bloquear Enter se inválido
                      if (e.key === 'Enter' && !isSectionComplete('identification')) {
                        e.preventDefault();
                        console.log('🚨 Enter bloqueado - seção de identificação inválida');
                      }
                    }}
                    title={!isSectionComplete('identification') ? 'Complete todos os campos obrigatórios para continuar' : 'Clique para continuar'}
                  >
                    {t('button.continue')}
                    {!isSectionComplete('identification') && (
                      <span className="ml-2 text-xs">🔒</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 2: Tipo de Ingresso */}
          {currentSection === 'tickets' && (
            <Card className="animate-in slide-in-from-right-4 duration-300 bg-white border border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold mr-3">2</span>
                  {t('tickets.section.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.ticketTypes?.filter(ticket => ticket.isActive !== false).map((ticket) => (
                    <div key={ticket.name} className="border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-2 mb-3">
                        <input
                          type="radio"
                          id={`ticket-${ticket.name}`}
                          data-testid={`ticket-${ticket.name}`}
                          name="ticketType"
                          value={ticket.name}
                          checked={formData.ticketType === ticket.name}
                          onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <Label htmlFor={`ticket-${ticket.name}`} className="text-lg font-semibold">
                          {ticket.name}
                        </Label>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">
                        {ticket.description}
                      </p>
                      <p className="text-2xl font-bold text-yellow-500">R$ {ticket.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {formData.ticketType && config.ticketTypes?.find(t => t.name === formData.ticketType)?.requiresPartner && (
                  <div>
                    <Label htmlFor="partnerName">{t('form.partnerName')}</Label>
                    <Input
                      id="partnerName"
                      data-testid="partnerName"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      placeholder={t('form.partnerName.placeholder')}
                    />
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={goToPreviousSection}
                    variant="outline"
                  >
                    {t('button.back')}
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextSection}
                    disabled={!isSectionComplete('tickets')}
                    className={`transition-all duration-200 font-semibold ${
                      isSectionComplete('tickets')
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer opacity-100 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 hover:bg-gray-300'
                    }`}
                    onKeyDown={(e) => {
                      // 🏆 GHOST SELECTION LOCKDOWN - Bloquear Enter se inválido
                      if (e.key === 'Enter' && !isSectionComplete('tickets')) {
                        e.preventDefault();
                        console.log('🚨 Enter bloqueado - seção de tickets inválida');
                      }
                    }}
                    title={!isSectionComplete('tickets') ? 'Complete todos os campos obrigatórios para continuar' : 'Clique para continuar'}
                  >
                    {t('button.continue')}
                    {!isSectionComplete('tickets') && (
                      <span className="ml-2 text-xs">🔒</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 3: Produtos Adicionais - NOVA UX DIRETA */}
          {currentSection === 'products' && (
            <Card className="animate-in slide-in-from-right-4 duration-300 bg-white border border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold mr-3">3</span>
                  {t('products.section.title')}
                </CardTitle>
                <p className="text-slate-500 text-sm mt-2">
                  Para cada produto abaixo, escolha uma opção. <strong>Todos os produtos devem ser respondidos para continuar.</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {config?.products?.filter(product => {
                  if (product.availableUntil) {
                    const now = new Date();
                    const availableUntil = new Date(product.availableUntil);
                    return now <= availableUntil;
                  }
                  return true;
                }).map((product) => {
                  const selectedValue = formData.selectedProducts[product.name];
                  const hasOptions = product.options && product.options.length > 0;

                  // 🔧 CORREÇÃO: Detectar se é produto boolean mesmo tendo options
                  const isBooleanProduct = (product as any).isBoolean ||
                    (hasOptions && product.options.length === 2 &&
                     product.options.includes('Sim') && product.options.includes('Não'));

                  const hasRealOptions = hasOptions && !isBooleanProduct;
                  const isAnswered = selectedValue && selectedValue !== '';

                  return (
                    <div key={product.name} className={`
                      rounded-xl p-6 border-2 transition-all duration-300
                      ${isAnswered
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-orange-400 bg-orange-50 shadow-md'
                      }
                    `}>

                      {/* PRODUCT HEADER */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-bold text-slate-900 mr-3">
                              {product.name}
                            </h3>
                            <span className="text-2xl font-bold text-yellow-500">
                              R$ {product.price.toFixed(2)}
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-slate-500 text-sm mb-3">
                              {product.description}
                            </p>
                          )}
                        </div>

                        {/* STATUS INDICATOR */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isAnswered
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 text-white animate-pulse'
                        }`}>
                          {isAnswered ? '✅ Respondido' : '⏳ Aguardando'}
                        </div>
                      </div>

                      {/* OPTIONS */}
                      <div className="space-y-3">
                        <Label className="text-slate-900 font-semibold block">
                          Escolha uma opção para {product.name}:
                        </Label>

                        {/* RADIO BUTTONS */}
                        <div className="grid grid-cols-1 gap-3">
                          {/* OPÇÃO: NÃO QUERO */}
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedValue === 'Não'
                                ? 'border-red-500 bg-red-50 shadow-md'
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              selectedProducts: {
                                ...prev.selectedProducts,
                                [product.name]: 'Não'
                              }
                            }))}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                selectedValue === 'Não'
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-slate-400'
                              }`}>
                                {selectedValue === 'Não' && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className={`font-medium ${
                                selectedValue === 'Não' ? 'text-red-600' : 'text-slate-600'
                              }`}>
                                ❌ Não quero.
                              </span>
                            </div>
                          </div>

                          {/* OPÇÕES DO PRODUTO */}
                          {hasRealOptions ? (
                            // Produto com múltiplas opções (tamanhos, sabores, etc)
                            product.options.map((option) => (
                              <div
                                key={option}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                  selectedValue === option
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-slate-300 hover:border-slate-400 bg-white'
                                }`}
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  selectedProducts: {
                                    ...prev.selectedProducts,
                                    [product.name]: option
                                  }
                                }))}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                      selectedValue === option
                                        ? 'border-green-500 bg-green-500'
                                        : 'border-slate-400'
                                    }`}>
                                      {selectedValue === option && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      )}
                                    </div>
                                    <span className={`font-medium ${
                                      selectedValue === option ? 'text-green-600' : 'text-slate-600'
                                    }`}>
                                      ✅ Sim, quero:  <strong>{option}</strong>
                                    </span>
                                  </div>
                                  <span className={`text-sm ${
                                    selectedValue === option ? 'text-green-600' : 'text-slate-500'
                                  }`}>
                                    +R$ {product.price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            // Produto boolean simples
                            <div
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedValue === 'Sim'
                                  ? 'border-green-500 bg-green-50 shadow-md'
                                  : 'border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                selectedProducts: {
                                  ...prev.selectedProducts,
                                  [product.name]: 'Sim'
                                }
                              }))}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    selectedValue === 'Sim'
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-slate-400'
                                  }`}>
                                    {selectedValue === 'Sim' && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                  <span className={`font-medium ${
                                    selectedValue === 'Sim' ? 'text-green-600' : 'text-slate-600'
                                  }`}>
                                    ✅ Sim, quero!
                                  </span>
                                </div>
                                <span className={`text-sm ${
                                  selectedValue === 'Sim' ? 'text-green-600' : 'text-slate-500'
                                }`}>
                                  +R$ {product.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* VALIDATION STATUS */}
                {!isSectionComplete('products') && (
                  <div className="p-4 rounded-lg border-2 border-orange-400 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full mr-3 flex items-center justify-center bg-orange-500">
                          ⏳
                        </div>
                        <span className="font-semibold text-orange-600">
                          Ainda há produtos aguardando resposta
                        </span>
                      </div>
                    </div>
                  </div>
                )}


                {/* NAVIGATION */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={goToPreviousSection}
                    variant="outline"
                    size="lg"
                  >
                    ← {t('button.back')}
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextSection}
                    disabled={!isSectionComplete('products')}
                    size="lg"
                    className={`transition-all duration-200 font-semibold ${
                      isSectionComplete('products')
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer opacity-100 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 hover:bg-gray-300'
                    }`}
                  >
                    {isSectionComplete('products')
                      ? `✅ Continuar para Pagamento →`
                      : `🔒 Responda todos os produtos (${
                          config?.products?.filter(p => {
                            const val = formData.selectedProducts[p.name];
                            return !val || val === '';
                          }).length || 0
                        } restantes)`
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 4: Forma de Pagamento */}
          {currentSection === 'payment' && (
            <Card className="animate-in slide-in-from-right-4 duration-300 bg-white border border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold mr-3">4</span>
                  {t('payment.section.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo dos Produtos Selecionados */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 text-sm mr-2">📋</span>
                    {t('payment.summary.title')}
                  </h4>
                  <div className="space-y-2">
                    {/* Ingresso Selecionado */}
                    {formData.ticketType && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          🎫 {formData.ticketType}
                          {formData.partnerName && ` (Dupla: ${formData.partnerName})`}
                        </span>
                        <span className="text-slate-900 font-medium">
                          R$ {config?.ticketTypes?.find(t => t.name === formData.ticketType)?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    )}

                    {/* Produtos Adicionais Selecionados */}
                    {Object.entries(formData.selectedProducts).map(([productName, option]) => {
                      const product = config?.products?.find(p => p.name === productName);
                      if (!product || option === 'Não' || !option) return null;

                      return (
                        <div key={productName} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">
                            🛍️ {productName}: {option}
                          </span>
                          <span className="text-slate-900 font-medium">
                            R$ {product.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      );
                    })}

                    {/* Linha Separadora */}
                    <div className="border-t border-slate-300 my-2"></div>

                    {/* Total Base */}
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500">{t('payment.summary.totalBase')}</span>
                      <span className="text-slate-900" data-testid="baseTotal">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {config?.paymentSettings && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{t('payment.choose.title')}</h3>
                      <p className="text-slate-500 text-sm">{t('payment.choose.subtitle')}</p>
                    </div>

                    <div className="space-y-4">
                      {/* PIX à Vista - OPÇÃO PRINCIPAL */}
                      {config.paymentSettings.allowPix && (
                        <div
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 relative ${
                            formData.paymentMethod === 'pix'
                              ? 'border-green-500 bg-green-50 shadow-lg'
                              : 'border-green-300 bg-green-50/50 hover:border-green-500 hover:bg-green-50'
                          }`}
                          data-testid="payment-pix"
                          onClick={() => setFormData({ ...formData, paymentMethod: 'pix' })}
                        >
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {t('payment.pix.recommended')}
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-lg">{t('payment.pix.title')}</h4>
                                <p className="text-sm text-slate-600">{t('payment.pix.subtitle')}</p>
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              formData.paymentMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-slate-300'
                            }`}>
                              {formData.paymentMethod === 'pix' && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>

                          <div className="bg-green-100 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-slate-600">{t('payment.pix.baseValue')}</span>
                              <span className="text-slate-500">R$ {(calculateTotal() || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-green-600 font-medium">PIX sem taxa do sistema:</span>
                              <span className="text-green-600 font-medium">-R$ {(calculateSavings(calculateTotal(), 'pix') || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-green-300 pt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-lg">{t('payment.pix.finalValue')}</span>
                                <span className="font-bold text-green-600 text-2xl" data-testid="finalTotal">R$ {(calculateFinalTotal(calculateTotal(), 'pix') || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-green-600">
                            <span>{t('payment.pix.benefits.economy')}</span>
                            <span>{t('payment.pix.benefits.noFees')}</span>
                            <span>{t('payment.pix.benefits.instant')}</span>
                          </div>
                        </div>
                      )}

                      {/* OUTRAS OPÇÕES - Layout Compacto */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* PIX Parcelado */}
                        {config.paymentSettings.allowPix && (
                          <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                              formData.paymentMethod === 'pix_installment'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                            }`}
                            data-testid="payment-pix_installment"
                            onClick={() => setFormData({ ...formData, paymentMethod: 'pix_installment' })}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  formData.paymentMethod === 'pix_installment' ? 'bg-blue-500' : 'bg-slate-400'
                                }`}>
                                  <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <div>
                                  <h5 className={`font-semibold ${
                                    formData.paymentMethod === 'pix_installment' ? 'text-slate-900' : 'text-slate-700'
                                  }`}>{t('payment.pixInstallment.title')}</h5>
                                  <p className="text-xs text-slate-500">{t('payment.pixInstallment.subtitle', { '0': calculateMaxInstallments(config.paymentSettings.dueDateLimit) })}</p>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.paymentMethod === 'pix_installment' ? 'border-blue-500 bg-blue-500' : 'border-slate-400'
                              }`}>
                                {formData.paymentMethod === 'pix_installment' && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <div className="text-xs text-slate-500 mb-1">
                                {t('payment.pixInstallment.baseValue', { '0': (calculateTotal() || 0).toFixed(2) })}
                              </div>
                              <div className="text-xs text-red-500 mb-1">
                                {t('payment.pixInstallment.fee', { '0': (config.paymentSettings.creditCardFeePercentage || 5) })}
                              </div>
                              <span className={`font-bold ${
                                formData.paymentMethod === 'pix_installment' ? 'text-blue-600' : 'text-slate-500'
                              }`}>
                                R$ {(calculateFinalTotal(calculateTotal(), 'pix_installment') || 0).toFixed(2)}
                              </span>
                            </div>

                            {/* Seletor de parcelas para PIX parcelado */}
                            {formData.paymentMethod === 'pix_installment' && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <InstallmentSelector
                                  value={formData.installments}
                                  onChange={(value) => setFormData({ ...formData, installments: value })}
                                  maxInstallments={calculateMaxInstallments(config.paymentSettings.dueDateLimit)}
                                  totalAmount={calculateFinalTotal(calculateTotal(), 'pix_installment') || 0}
                                  paymentMethod="pix_installment"
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cartão de Crédito */}
                        {config.paymentSettings.allowCreditCard && (
                          <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                              formData.paymentMethod === 'credit_card'
                                ? 'border-slate-500 bg-slate-100'
                                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                            }`}
                            data-testid="payment-credit_card"
                            onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  formData.paymentMethod === 'credit_card' ? 'bg-slate-600' : 'bg-slate-400'
                                }`}>
                                  <span className="text-white font-bold text-sm">💳</span>
                                </div>
                                <div>
                                  <h5 className={`font-semibold ${
                                    formData.paymentMethod === 'credit_card' ? 'text-slate-900' : 'text-slate-700'
                                  }`}>{t('payment.creditCard.title')}</h5>
                                  <p className="text-xs text-slate-500">{t('payment.pixInstallment.subtitle', { '0': calculateMaxInstallments(config.paymentSettings.dueDateLimit) })}</p>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.paymentMethod === 'credit_card' ? 'border-slate-600 bg-slate-600' : 'border-slate-400'
                              }`}>
                                {formData.paymentMethod === 'credit_card' && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <div className="text-xs text-slate-500 mb-1">
                                {t('payment.creditCard.baseValue', { '0': (calculateTotal() || 0).toFixed(2) })}
                              </div>
                              <div className="text-xs text-red-500 mb-1">
                                {t('payment.creditCard.fee', { '0': (config.paymentSettings.creditCardFeePercentage || 5) })}
                              </div>
                              <span className={`font-bold ${
                                formData.paymentMethod === 'credit_card' ? 'text-slate-700' : 'text-slate-500'
                              }`}>
                                R$ {(calculateFinalTotal(calculateTotal(), 'credit_card') || 0).toFixed(2)}
                              </span>
                            </div>

                            {/* Seletor de parcelas para Cartão de Crédito */}
                            {formData.paymentMethod === 'credit_card' && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <InstallmentSelector
                                  value={formData.installments}
                                  onChange={(value) => setFormData({ ...formData, installments: value })}
                                  maxInstallments={calculateMaxInstallments(config.paymentSettings.dueDateLimit)}
                                  totalAmount={calculateFinalTotal(calculateTotal(), 'credit_card') || 0}
                                  paymentMethod="credit_card"
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={goToPreviousSection}
                    variant="outline"
                  >
                    {t('button.back')}
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextSection}
                    disabled={!isSectionComplete('payment')}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md hover:shadow-lg"
                  >
                    {t('button.continue')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 5: Resumo e Confirmação */}
          {currentSection === 'summary' && (
            <Card className="animate-in slide-in-from-right-4 duration-300 bg-white border border-slate-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold mr-3">5</span>
                  {t('summary.section.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* RESUMO DO PEDIDO */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-yellow-500" />
                    {t('summary.order.title')}
                  </h3>

                  <div className="space-y-2 text-slate-600">
                    <div className="flex justify-between">
                      <span>{t('summary.name')}</span>
                      <span className="text-slate-900 font-medium">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('summary.email')}</span>
                      <span className="text-slate-900 font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('summary.whatsapp')}</span>
                      <span className="text-slate-900 font-medium">{formData.whatsapp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('summary.ticketType')}</span>
                      <span className="text-slate-900 font-medium">{formData.ticketType}</span>
                    </div>
                    {formData.partnerName && (
                      <div className="flex justify-between">
                        <span>{t('summary.partner')}</span>
                        <span className="text-slate-900 font-medium">{formData.partnerName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{t('summary.paymentMethod')}</span>
                      <span className="text-slate-900 font-medium">
                        {formData.paymentMethod === 'pix' && t('summary.paymentMethod.pix')}
                        {formData.paymentMethod === 'pix_installment' && t('summary.paymentMethod.pixInstallment')}
                        {formData.paymentMethod === 'credit_card' && t('summary.paymentMethod.creditCard')}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{t('summary.total')}</span>
                        <span className="text-yellow-500 font-bold text-xl">
                          {(formData.paymentMethod === 'pix_installment' || formData.paymentMethod === 'credit_card') && formData.installments > 1
                            ? `${formData.installments}x de R$ ${((calculateFinalTotal(calculateTotal(), formData.paymentMethod) || 0) / formData.installments).toFixed(2)}`
                            : `R$ ${(calculateFinalTotal(calculateTotal(), formData.paymentMethod) || 0).toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TERMOS E CONDIÇÕES */}
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <EnhancedCheckbox
                      id="termsAccepted"
                      data-testid="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: !!checked })}
                      required
                      label={
                        <>
                          {t('terms.accept')}{' '}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                type="button"
                                className="text-yellow-500 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t('terms.link')}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{t('terms.title')}</DialogTitle>
                              </DialogHeader>
                              <div className="whitespace-pre-wrap text-sm">
                                {config?.termsAndConditions || 'Termos e condições não disponíveis.'}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      }
                    />
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <EnhancedCheckbox
                      id="noRefundAccepted"
                      data-testid="noRefundAccepted"
                      checked={formData.noRefundAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, noRefundAccepted: !!checked })}
                      required
                      label="Estou ciente que os valores não são reembolsáveis em caso de cancelamento ou show-off (não comparecimento). *Salvo os casos respaldados pelo CDC (7 dias após a compra)."
                    />
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <EnhancedCheckbox
                      id="rescheduleAccepted"
                      data-testid="rescheduleAccepted"
                      checked={formData.rescheduleAccepted || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, rescheduleAccepted: !!checked })}
                      required
                      label="Estou ciente que o evento poderá ser remarcado em caso de catástrofes naturais ou calamidade pública, ou em casos determinados por órgãos públicos que impeçam a execução do evento de maneira integral."
                    />
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <EnhancedCheckbox
                      id="withdrawalAccepted"
                      data-testid="withdrawalAccepted"
                      checked={formData.withdrawalAccepted || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, withdrawalAccepted: !!checked })}
                      required
                      label={`Estou ciente que caso desista da inscrição e queira transferir para outra pessoa, só poderei fazê-lo até o dia ${calculateWithdrawalDeadline() || 'data limite'}.`}
                    />
                  </div>


                  {/* Checkbox condicional para juros - aparece apenas para cartão de crédito e PIX parcelado */}
                  {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'pix_installment') && (
                    <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <EnhancedCheckbox
                        id="interestAccepted"
                        data-testid="interestAccepted"
                        checked={formData.interestAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, interestAccepted: !!checked })}
                        required
                        label="Ao marcar esta caixa, declaro que concordo com a aplicação de juros por atraso correspondente a 10% a.m. conforme estabelecido na Lei 9.298/1996."
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={goToPreviousSection}
                    variant="outline"
                  >
                    {t('button.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isSectionComplete('summary')}
                    className="bg-yellow-500 hover:bg-yellow-600"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('button.processing')}
                      </>
                    ) : (
                      <>
                        {t('button.finish')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Testimonials Carousel */}
        <div className="mt-8 mb-6">
          <TestimonialCarousel />
        </div>

        {/* Language Selector Footer */}
        <div className="mt-8 flex justify-center">
          <LanguageSelector />
        </div>
      </div>
    </div>
    </>
  );
}

export default RegistrationForm;
