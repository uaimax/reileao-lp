import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SITE_NAME, getDownloadFilename } from '@/lib/site-config';

interface StructuredData {
  metadata: {
    generatedAt: string;
    version: string;
    purpose: string;
    source: string;
  };
  event: {
    title: string;
    subtitle: string;
    tagline: string;
    dateDisplay: string;
    countdownTarget: string;
    countdownText: string;
    registrationUrl: string;
    whatsappNumber: string;
    whatsappMessage: string;
    whatsappEnabled: boolean;
    heroVideoUrl: string;
  };
  hero: {
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  about: {
    sectionTitle: string;
    paragraphs: string[];
    trailerVideoUrl: string;
    trailerButtonText: string;
    beginnerTitle: string;
    beginnerText: string;
    advancedTitle: string;
    advancedText: string;
  };
  stats: {
    sectionTitle: string;
    participants: { count: number; label: string };
    teachers: { count: number; label: string };
    djs: { count: number; label: string };
    partyHours: { count: number; label: string };
  };
  artists: {
    sectionTitle: string;
    sectionSubtitle: string;
    list: Array<{
      id: number;
      name: string;
      role: string;
      cityState: string;
      photoUrl: string;
      description: string;
      promotionalVideoUrl: string;
      displayOrder: number;
      isActive: boolean;
    }>;
  };
  testimonials: {
    sectionTitle: string;
    sectionSubtitle: string;
    list: Array<{
      id: number;
      name: string;
      role: string;
      cityState: string;
      photoUrl: string;
      text: string;
      displayOrder: number;
      isActive: boolean;
    }>;
  };
  location: {
    sectionTitle: string;
    sectionSubtitle: string;
    city: string;
    state: string;
    country: string;
    description: string;
    imageUrl: string;
    mapEmbedUrl: string;
  };
  participation: {
    sectionTitle: string;
    sectionSubtitle: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };
  faq: {
    sectionTitle: string;
    sectionSubtitle: string;
    questions: Array<{
      id: number;
      question: string;
      answer: string;
      displayOrder: number;
      isActive: boolean;
    }>;
  };
  footer: {
    description: string;
    socialLinks: {
      instagram: string;
      facebook: string;
      youtube: string;
      tiktok: string;
    };
    contactEmail: string;
    copyrightText: string;
  };
}

const StructuredData = () => {
  const [data, setData] = useState<StructuredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/structured-data');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const structuredData = await response.json();
      setData(structuredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Error fetching structured data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Dados estruturados copiados para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const downloadJson = () => {
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename('structured-data', 'json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download realizado!",
      description: "Arquivo JSON baixado com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Carregando dados estruturados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dados Estruturados {SITE_NAME}</h1>
              <p className="text-gray-600 mt-2">
                Informações estruturadas para consumo por IAs e sistemas automatizados
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                {showRawJson ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showRawJson ? 'Ocultar JSON' : 'Ver JSON'}
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar JSON
              </Button>
              <Button onClick={downloadJson}>
                <Download className="w-4 h-4 mr-2" />
                Baixar JSON
              </Button>
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Metadata</Badge>
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Versão:</span>
                  <p className="text-gray-600">{data.metadata.version}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gerado em:</span>
                  <p className="text-gray-600">
                    {new Date(data.metadata.generatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Propósito:</span>
                  <p className="text-gray-600">{data.metadata.purpose}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fonte:</span>
                  <p className="text-gray-600">{data.metadata.source}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raw JSON View */}
        {showRawJson && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>JSON Raw</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Structured Data Sections */}
        <div className="grid gap-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">Evento</Badge>
                Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{data.event.title}</h4>
                  <p className="text-gray-600">{data.event.subtitle}</p>
                  <p className="text-sm text-purple-600 mt-1">{data.event.tagline}</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Data:</span>
                    <p className="text-gray-600">{data.event.dateDisplay}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">WhatsApp:</span>
                    <p className="text-gray-600">
                      {data.event.whatsappEnabled ? 'Ativo' : 'Inativo'} - {data.event.whatsappNumber}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">URL de Inscrição:</span>
                    <p className="text-blue-600 break-all">{data.event.registrationUrl}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">Estatísticas</Badge>
                Números do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.stats.participants.count}</div>
                  <div className="text-sm text-gray-600">{data.stats.participants.label}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.stats.teachers.count}</div>
                  <div className="text-sm text-gray-600">{data.stats.teachers.label}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.stats.djs.count}</div>
                  <div className="text-sm text-gray-600">{data.stats.djs.label}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.stats.partyHours.count}</div>
                  <div className="text-sm text-gray-600">{data.stats.partyHours.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">Artistas</Badge>
                Professores e DJs Confirmados ({data.artists.list.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.artists.list.map((artist) => (
                  <div key={artist.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={artist.photoUrl}
                        alt={artist.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-semibold text-gray-900">{artist.name}</h5>
                        <p className="text-sm text-gray-600">{artist.role}</p>
                        <p className="text-xs text-purple-600">{artist.cityState}</p>
                      </div>
                    </div>
                    {artist.description && (
                      <p className="text-sm text-gray-600">{artist.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">FAQ</Badge>
                Perguntas Frequentes ({data.faq.questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.faq.questions.map((faq) => (
                  <div key={faq.id} className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold text-gray-900 mb-2">{faq.question}</h5>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">Localização</Badge>
                Informações do Local
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    {data.location.city}, {data.location.state}
                  </h4>
                  <p className="text-gray-600">{data.location.country}</p>
                  {data.location.description && (
                    <p className="text-sm text-gray-600 mt-2">{data.location.description}</p>
                  )}
                </div>
                <div>
                  {data.location.imageUrl && (
                    <img
                      src={data.location.imageUrl}
                      alt="Localização"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StructuredData;
