import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, ChevronDown, ChevronUp, TestTube, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getEventConfig, updateEventConfig, getHeroContent, updateHeroContent } from '@/lib/api';
import { FileUpload } from '@/components/ui/file-upload';
import { getSiteNameWithYear, getWhatsAppMessage } from '@/lib/site-config';

const EventConfigManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [testingS3, setTestingS3] = useState(false);
  const [s3TestResult, setS3TestResult] = useState<'success' | 'error' | null>(null);
  const [eventData, setEventData] = useState({
    // Campos do banco de dados
    eventTitle: '',
    eventSubtitle: '',
    eventTagline: '',
    eventDateDisplay: '',
    eventCountdownTarget: '',
    eventCountdownText: '',
    heroVideoUrl: '',
    registrationUrl: '',
    ctaPrimaryText: '',
    ctaSecondaryText: '',
    s3Endpoint: '',
    s3AccessKey: '',
    s3SecretKey: '',
    s3BucketName: '',
    s3Region: '',
    s3PublicDomain: '',
    s3Enabled: false,
    whatsappNumber: '',
    whatsappMessage: '',
    whatsappEnabled: true,
    temporaryRedirectUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaImageUrl: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [eventConfig, heroContent] = await Promise.all([
        getEventConfig(),
        getHeroContent()
      ]);


      if (eventConfig && typeof eventConfig === 'object') {
        setEventData(prev => ({
          ...prev,
          eventTitle: (eventConfig as any).eventTitle || '',
          eventSubtitle: (eventConfig as any).eventSubtitle || '',
          eventTagline: (eventConfig as any).eventTagline || '',
          eventDateDisplay: (eventConfig as any).eventDateDisplay || '',
          eventCountdownTarget: (eventConfig as any).eventCountdownTarget ? (() => {
            try {
              const date = new Date((eventConfig as any).eventCountdownTarget);
              if (isNaN(date.getTime())) {
                console.warn('Invalid date value for eventCountdownTarget:', (eventConfig as any).eventCountdownTarget);
                return '';
              }
              // Formato para input datetime-local (YYYY-MM-DDTHH:mm)
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch (error) {
              console.warn('Error parsing eventCountdownTarget:', (eventConfig as any).eventCountdownTarget, error);
              return '';
            }
          })() : '',
          eventCountdownText: (eventConfig as any).eventCountdownText || '',
          heroVideoUrl: (eventConfig as any).heroVideoUrl || '',
          registrationUrl: (eventConfig as any).registrationUrl || '',
          s3Endpoint: (eventConfig as any).s3Endpoint || '',
          s3AccessKey: (eventConfig as any).s3AccessKey || '',
          s3SecretKey: (eventConfig as any).s3SecretKey || '',
          s3BucketName: (eventConfig as any).s3BucketName || '',
          s3Region: (eventConfig as any).s3Region || '',
          s3PublicDomain: (eventConfig as any).s3PublicDomain || '',
          s3Enabled: (eventConfig as any).s3Enabled || false,
          whatsappNumber: (eventConfig as any).whatsappNumber || '',
          whatsappMessage: (eventConfig as any).whatsappMessage || '',
          whatsappEnabled: (eventConfig as any).whatsappEnabled !== undefined ? (eventConfig as any).whatsappEnabled : true,
          temporaryRedirectUrl: (eventConfig as any).temporaryRedirectUrl || '',
          metaTitle: (eventConfig as any).metaTitle || '',
          metaDescription: (eventConfig as any).metaDescription || '',
          metaImageUrl: (eventConfig as any).metaImageUrl || ''
        }));

      }

      if (heroContent && typeof heroContent === 'object') {
        setEventData(prev => ({
          ...prev,
          ctaPrimaryText: (heroContent as any).ctaPrimaryText || '',
          ctaSecondaryText: (heroContent as any).ctaSecondaryText || ''
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as configurações do evento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Update event config
      await updateEventConfig({
        eventTitle: eventData.eventTitle,
        eventSubtitle: eventData.eventSubtitle,
        eventTagline: eventData.eventTagline,
        eventDateDisplay: eventData.eventDateDisplay,
        eventCountdownTarget: eventData.eventCountdownTarget ? new Date(eventData.eventCountdownTarget).toISOString() : null,
        eventCountdownText: eventData.eventCountdownText,
        heroVideoUrl: eventData.heroVideoUrl,
        registrationUrl: eventData.registrationUrl,
        s3Endpoint: eventData.s3Endpoint,
        s3AccessKey: eventData.s3AccessKey,
        s3SecretKey: eventData.s3SecretKey,
        s3BucketName: eventData.s3BucketName,
        s3Region: eventData.s3Region,
        s3PublicDomain: eventData.s3PublicDomain,
        s3Enabled: eventData.s3Enabled,
        whatsappNumber: eventData.whatsappNumber,
        whatsappMessage: eventData.whatsappMessage,
        whatsappEnabled: eventData.whatsappEnabled,
        temporaryRedirectUrl: eventData.temporaryRedirectUrl,
        metaTitle: eventData.metaTitle,
        metaDescription: eventData.metaDescription,
        metaImageUrl: eventData.metaImageUrl
      });

      // Update hero content
      await updateHeroContent({
        ctaPrimaryText: eventData.ctaPrimaryText,
        ctaSecondaryText: eventData.ctaSecondaryText
      });

      toast({
        title: "Configurações salvas!",
        description: "As alterações foram aplicadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const testS3Connection = async () => {
    try {
      setTestingS3(true);
      setS3TestResult(null);

      const response = await fetch('/api/test-s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: eventData.s3Endpoint,
          accessKey: eventData.s3AccessKey,
          secretKey: eventData.s3SecretKey,
          bucketName: eventData.s3BucketName,
          region: eventData.s3Region,
          publicDomain: eventData.s3PublicDomain
        })
      });

      if (response.ok) {
        setS3TestResult('success');
        toast({
          title: "Conexão S3 OK!",
          description: "A configuração do S3 está funcionando corretamente.",
        });
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      setS3TestResult('error');
      toast({
        title: "Erro na conexão S3",
        description: "Verifique as configurações e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setTestingS3(false);
    }
  };

  if (isLoading && !eventData.eventTitle) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          <span className="ml-2 text-slate-50">Carregando configurações...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-50">
            Configurações Gerais do Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações básicas do evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventTitle" className="text-slate-50 text-sm font-medium">
                Título do Evento
              </Label>
              <Input
                id="eventTitle"
                value={eventData.eventTitle}
                onChange={(e) => handleChange('eventTitle', e.target.value)}
                placeholder={getSiteNameWithYear('2025')}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDateDisplay" className="text-slate-50 text-sm font-medium">
                Data de Exibição
              </Label>
              <Input
                id="eventDateDisplay"
                value={eventData.eventDateDisplay}
                onChange={(e) => handleChange('eventDateDisplay', e.target.value)}
                placeholder="5–7 SET 2025, Uberlândia–MG"
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventSubtitle" className="text-slate-50 text-sm font-medium">
              Subtítulo do Evento
            </Label>
            <Input
              id="eventSubtitle"
              value={eventData.eventSubtitle}
              onChange={(e) => handleChange('eventSubtitle', e.target.value)}
              placeholder="UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO"
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventTagline" className="text-slate-50 text-sm font-medium">
              Tagline
            </Label>
            <Input
              id="eventTagline"
              value={eventData.eventTagline}
              onChange={(e) => handleChange('eventTagline', e.target.value)}
              placeholder="Muita aula. Muita dança. Muito Zouk."
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
            />
          </div>

          {/* Data e Countdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="eventCountdownTarget" className="text-slate-50 text-sm font-medium">
                Data/Hora do Evento (Countdown)
              </Label>
              <Input
                id="eventCountdownTarget"
                type="datetime-local"
                value={eventData.eventCountdownTarget}
                onChange={(e) => handleChange('eventCountdownTarget', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
              <p className="text-slate-400 text-sm">
                Data e horário que será usado no countdown da página
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventCountdownText" className="text-slate-50 text-sm font-medium">
                Texto do Countdown
              </Label>
              <Input
                id="eventCountdownText"
                value={eventData.eventCountdownText}
                onChange={(e) => handleChange('eventCountdownText', e.target.value)}
                placeholder="A experiência completa inicia em:"
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          {/* URLs e Mídias */}
          <div className="space-y-2">
            <Label htmlFor="heroVideoUrl" className="text-slate-50 text-sm font-medium">
              URL do Vídeo (Youtube)
            </Label>
            <Input
              id="heroVideoUrl"
              value={eventData.heroVideoUrl}
              onChange={(e) => handleChange('heroVideoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=U2QPiVaMAVc"
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
            />
            <p className="text-slate-400 text-sm">
              URL do YouTube (será convertida automaticamente para embed)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationUrl" className="text-slate-50">
              URL de Inscrição
            </Label>
            <Input
              id="registrationUrl"
              type="url"
              value={eventData.registrationUrl}
              onChange={(e) => handleChange('registrationUrl', e.target.value)}
              placeholder="https://meuevento.com.br/inscricoes"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
            <p className="text-slate-400 text-sm">
              Link para onde o botão "QUERO PARTICIPAR" irá direcionar
            </p>
          </div>

          {/* Configurações do WhatsApp */}
          <div className="space-y-6 p-6 bg-slate-800 rounded-lg border-l-4 border-l-green-500 shadow-md">
            <h4 className="text-lg font-semibold text-green-500 flex items-center gap-2">
              <MessageCircle size={20} />
              WhatsApp Flutuante
            </h4>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="whatsappEnabled"
                checked={eventData.whatsappEnabled}
                onChange={(e) => handleChange('whatsappEnabled', e.target.checked)}
                className="rounded border-slate-600"
              />
              <Label htmlFor="whatsappEnabled" className="text-slate-50">
                Exibir botão flutuante do WhatsApp
              </Label>
            </div>

            {eventData.whatsappEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="text-slate-50">
                    Número do WhatsApp (com código do país)
                  </Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={eventData.whatsappNumber}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    placeholder="5534988364084"
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  />
                  <p className="text-slate-400 text-sm">
                    Ex: 5534988364084 (Brasil + DDD + número)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappMessage" className="text-slate-50">
                    Mensagem padrão
                  </Label>
                  <Textarea
                    id="whatsappMessage"
                    value={eventData.whatsappMessage}
                    onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                    placeholder={getWhatsAppMessage()}
                    className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {/* Redirecionamento Temporário */}
          <div className="space-y-6 p-6 bg-slate-800 rounded-lg border-l-4 border-l-orange-500 shadow-md">
            <h4 className="text-lg font-semibold text-orange-500 flex items-center gap-2">
              <span className="text-orange-500">🔄</span>
              Redirecionamento Temporário
            </h4>

            <div className="space-y-2">
              <Label htmlFor="temporaryRedirectUrl" className="text-slate-50">
                URL de Redirecionamento Temporário
              </Label>
              <Input
                id="temporaryRedirectUrl"
                value={eventData.temporaryRedirectUrl}
                onChange={(e) => handleChange('temporaryRedirectUrl', e.target.value)}
                placeholder="https://meuevento.com.br/outra-pagina"
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
              <p className="text-slate-400 text-sm">
                Se preenchido, redireciona APENAS a página principal "/" para esta URL.
                Outras páginas como "/painel", "/inscricao", etc. continuam funcionando normalmente.
              </p>
            </div>
          </div>

          {/* Textos dos botões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaPrimaryText" className="text-slate-50">
                Texto do Botão Principal
              </Label>
              <Input
                id="ctaPrimaryText"
                value={eventData.ctaPrimaryText}
                onChange={(e) => handleChange('ctaPrimaryText', e.target.value)}
                placeholder="QUERO SABER MAIS"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaSecondaryText" className="text-slate-50">
                Texto do Botão Secundário
              </Label>
              <Input
                id="ctaSecondaryText"
                value={eventData.ctaSecondaryText}
                onChange={(e) => handleChange('ctaSecondaryText', e.target.value)}
                placeholder="PULAR PARA INGRESSOS"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="border-t border-slate-700 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="border-slate-600 text-yellow-500 hover:bg-slate-700"
            >
              {showAdvancedSettings ? (
                <ChevronUp className="w-4 h-4 mr-2" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-2" />
              )}
              Configurações Avançadas
            </Button>
          </div>

          {/* Advanced Settings Section */}
          {showAdvancedSettings && (
            <div className="space-y-6 border border-slate-700 rounded-lg p-6 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-50">Configurações S3</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="s3Enabled"
                    checked={eventData.s3Enabled}
                    onChange={(e) => handleChange('s3Enabled', e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <Label htmlFor="s3Enabled" className="text-slate-50">
                    Ativar S3
                  </Label>
                </div>
              </div>

              {eventData.s3Enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3Endpoint" className="text-slate-50">
                        S3 Endpoint
                      </Label>
                      <Input
                        id="s3Endpoint"
                        value={eventData.s3Endpoint}
                        onChange={(e) => handleChange('s3Endpoint', e.target.value)}
                        placeholder="https://account-id.r2.cloudflarestorage.com"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3BucketName" className="text-slate-50">
                        Bucket Name
                      </Label>
                      <Input
                        id="s3BucketName"
                        value={eventData.s3BucketName}
                        onChange={(e) => handleChange('s3BucketName', e.target.value)}
                        placeholder="my-bucket"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3AccessKey" className="text-slate-50">
                        Access Key ID
                      </Label>
                      <Input
                        id="s3AccessKey"
                        type="password"
                        value={eventData.s3AccessKey}
                        onChange={(e) => handleChange('s3AccessKey', e.target.value)}
                        placeholder="Access Key ID"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3SecretKey" className="text-slate-50">
                        Secret Access Key
                      </Label>
                      <Input
                        id="s3SecretKey"
                        type="password"
                        value={eventData.s3SecretKey}
                        onChange={(e) => handleChange('s3SecretKey', e.target.value)}
                        placeholder="Secret Access Key"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3Region" className="text-slate-50">
                        Region
                      </Label>
                      <Input
                        id="s3Region"
                        value={eventData.s3Region}
                        onChange={(e) => handleChange('s3Region', e.target.value)}
                        placeholder="auto (for Cloudflare R2)"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3PublicDomain" className="text-slate-50">
                        Domínio Público (Opcional)
                      </Label>
                      <Input
                        id="s3PublicDomain"
                        value={eventData.s3PublicDomain}
                        onChange={(e) => handleChange('s3PublicDomain', e.target.value)}
                        placeholder="https://pub-123.r2.dev"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                      <p className="text-slate-400 text-xs">
                        URL pública personalizada para acesso direto aos arquivos (ex: R2 custom domain)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      onClick={testS3Connection}
                      disabled={testingS3 || !eventData.s3Endpoint || !eventData.s3AccessKey || !eventData.s3SecretKey || !eventData.s3BucketName}
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                    >
                      {testingS3 ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Testar Conexão S3
                    </Button>

                    {s3TestResult === 'success' && (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Conexão OK</span>
                      </div>
                    )}

                    {s3TestResult === 'error' && (
                      <div className="flex items-center text-red-400">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Erro na conexão</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="metaTitle" className="text-slate-50">
              Meta Title (SEO)
            </Label>
            <Input
              id="metaTitle"
              value={eventData.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="Título para SEO (pode ser igual ao título do evento)"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription" className="text-slate-50">
              Meta Description (SEO)
            </Label>
            <Textarea
              id="metaDescription"
              value={eventData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="Descrição para SEO (pode ser igual ao subtítulo do evento)"
              className="bg-slate-700 border-slate-600 text-slate-50"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaImageUrl" className="text-slate-50">
              Meta Image (SEO / Open Graph)
              <span className="ml-2 text-xs text-slate-400">Adicione uma imagem de 1200x630 px para melhor resultado em compartilhamento</span>
            </Label>
            {/* Se S3 estiver habilitado, usar upload, senão input de URL */}
            {eventData.s3Enabled ? (
              <FileUpload
                label="Imagem para SEO (1200x630 px recomendado)"
                value={eventData.metaImageUrl}
                onChange={(url) => handleChange('metaImageUrl', url)}
                folder="seo"
                accept="image/*"
                disabled={isLoading}
              />
            ) : (
              <Input
                id="metaImageUrl"
                type="url"
                value={eventData.metaImageUrl}
                onChange={(e) => handleChange('metaImageUrl', e.target.value)}
                placeholder="Cole a URL da imagem para SEO"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            )}
            {/* Preview da imagem */}
            {eventData.metaImageUrl && (
              <div className="mt-2">
                <img src={eventData.metaImageUrl} alt="Prévia da imagem SEO" className="max-h-32 rounded border border-slate-600" />
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventConfigManager;