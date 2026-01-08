import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, CheckCircle, AlertCircle, Home, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { usePageTracking, useMetaPixelTracking } from '@/hooks/use-meta-pixel';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/phone-input.css';

interface Registration {
  id: number;
  fullName: string;
  email: string;
  ticketType: string;
  createdAt: string;
}

const RegistrationSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Meta Pixel tracking
  usePageTracking('Registration Search');
  const { trackSearch, trackCustomEvent } = useMetaPixelTracking();

  const [formData, setFormData] = useState({
    email: '',
    cpf: '',
    whatsapp: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFound, setIsFound] = useState(false);
  const [multipleResults, setMultipleResults] = useState<Registration[]>([]);

  // Formatação de CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const validateForm = (): boolean => {
    const { email, cpf, whatsapp } = formData;

    // Validar cada campo individualmente e contar válidos
    const validFields: string[] = [];

    // Validar email
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: 'Email inválido',
          description: 'Digite um email válido',
          variant: 'destructive'
        });
        return false;
      }
      validFields.push('email');
    }

    // Validar CPF (pelo menos 11 dígitos)
    if (cpf && cpf.trim() !== '') {
      const cpfDigits = cpf.replace(/\D/g, '');
      if (cpfDigits.length < 11) {
        toast({
          title: 'CPF incompleto',
          description: 'Digite um CPF válido com 11 dígitos',
          variant: 'destructive'
        });
        return false;
      }
      validFields.push('cpf');
    }

    // Validar WhatsApp (pelo menos 10 dígitos - DDD + número)
    if (whatsapp && whatsapp.trim() !== '') {
      const phoneDigits = whatsapp.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        toast({
          title: 'WhatsApp incompleto',
          description: 'Digite um número de WhatsApp válido',
          variant: 'destructive'
        });
        return false;
      }
      validFields.push('whatsapp');
    }

    // Pelo menos 2 campos válidos devem estar preenchidos
    if (validFields.length < 2) {
      toast({
        title: 'Campos insuficientes',
        description: 'ℹ️ Preencha pelo menos 2 campos válidos para buscar sua inscrição',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setMultipleResults([]);

      // Track search event
      const searchQuery = formData.email || formData.cpf || formData.whatsapp;
      trackSearch(searchQuery);
      trackCustomEvent('RegistrationSearch', {
        content_name: 'Registration Search',
        content_category: 'search',
        search_string: searchQuery,
        search_type: formData.email ? 'email' : formData.cpf ? 'cpf' : 'whatsapp'
      });

      // Debug: log dos dados que serão enviados
      console.log('Dados enviados para busca:', {
        email: formData.email,
        cpf: formData.cpf || undefined,
        whatsapp: formData.whatsapp || undefined
      });

      // Buscar inscrições
      const response = await apiClient.searchRegistrations({
        email: formData.email,
        cpf: formData.cpf || undefined,
        whatsapp: formData.whatsapp || undefined
      }) as any;

      if (!response.registrations || response.count === 0) {
        toast({
          title: 'Inscrição não encontrada',
          description: 'Não encontramos sua inscrição com os dados informados. Verifique se digitou corretamente ou tente outro campo.',
          variant: 'destructive'
        });
        return;
      }

      // Se encontrou exatamente uma inscrição, redirecionar
      if (response.count === 1) {
        setIsFound(true);
        setTimeout(() => {
          navigate(`/inscricao/confirmacao/${response.registrations[0].id}`);
        }, 1500);
        return;
      }

      // Se encontrou múltiplas inscrições
      setMultipleResults(response.registrations);

    } catch (error: any) {
      console.error('Erro ao buscar inscrição:', error);
      toast({
        title: 'Erro na busca',
        description: error.message || 'Ocorreu um erro ao buscar sua inscrição. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRegistration = (id: number) => {
    navigate(`/inscricao/confirmacao/${id}`);
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent('Oi! Preciso de ajuda para encontrar minha inscrição no UAIZOUK.');
    window.open(`https://wa.me/5534988364084?text=${message}`, '_blank');
  };

  // Se encontrou e está redirecionando
  if (isFound) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-soft-white mb-2">
            ✅ Inscrição encontrada!
          </h2>
          <p className="text-text-gray">Redirecionando para sua página...</p>
        </div>
      </div>
    );
  }

  // Se encontrou múltiplos resultados
  if (multipleResults.length > 0) {
    return (
      <div className="min-h-screen bg-dark-bg py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Múltiplas Inscrições Encontradas
            </h1>
            <p className="text-text-gray">
              Encontramos mais de uma inscrição. Clique para acessar a sua:
            </p>
          </div>

          <div className="space-y-4">
            {multipleResults.map((registration) => (
              <Card
                key={registration.id}
                className="bg-dark-card border-green-500/30 hover:border-green-500 transition-all cursor-pointer"
                onClick={() => handleSelectRegistration(registration.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-soft-white mb-1">
                        {registration.fullName}
                      </h3>
                      <p className="text-text-gray text-sm">
                        {registration.email}
                      </p>
                      <p className="text-text-gray text-sm">
                        Tipo: {registration.ticketType}
                      </p>
                      <p className="text-text-gray text-xs mt-1">
                        Criada em: {new Date(registration.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600">
                      Acessar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setMultipleResults([])}
              className="border-green-500/30 text-soft-white hover:bg-dark-card"
            >
              <Home className="w-4 h-4 mr-2" />
              Fazer nova busca
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Formulário principal
  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Search className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Encontre sua inscrição
          </h1>
          <p className="text-text-gray">
            Digite seus dados e veja o status da sua inscrição e pagamentos
          </p>
        </div>

        {/* Formulário */}
        <Card className="bg-dark-card border-green-500/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Dados para busca</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Aviso */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-text-gray text-center">
                  ℹ️ Preencha pelo menos <strong>2 campos</strong> para buscar sua inscrição
                </p>
              </div>

              {/* Email (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-soft-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="bg-dark-bg/50 border-green-500/30 text-soft-white focus:border-green-500"
                />
              </div>

              {/* CPF (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-soft-white">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="bg-dark-bg/50 border-green-500/30 text-soft-white focus:border-green-500"
                />
              </div>

              {/* WhatsApp (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-soft-white">
                  WhatsApp
                </Label>
                <PhoneInput
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(value) => setFormData({ ...formData, whatsapp: value || '' })}
                  defaultCountry="BR"
                  placeholder="Digite seu WhatsApp"
                  className="phone-input-custom"
                  style={{
                    '--PhoneInput-color--focus': '#22c55e',
                    '--PhoneInputCountrySelect-marginRight': '0.5em',
                  }}
                />
              </div>

              {/* Botão de submissão */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Consultar Inscrição
                  </>
                )}
              </Button>
            </form>

            {/* Link de suporte */}
            <div className="mt-6 text-center">
              <p className="text-text-gray text-sm mb-2">
                Ainda não conseguiu?
              </p>
              <Button
                variant="outline"
                onClick={handleWhatsAppSupport}
                className="border-green-500/30 text-soft-white hover:bg-dark-card"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Fale com nosso suporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botão voltar */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-text-gray hover:text-soft-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSearch;

