import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Edit, Trash2, Save, X, Loader2, ExternalLink, Eye, EyeOff,
  GripVertical, BarChart3, Calendar, Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/ui/file-upload';
import { useDebounce } from '@/hooks/use-debounce';
import { getSiteNameWithYear } from '@/lib/site-config';
import { useLandingData } from '@/hooks/use-landing-data';

interface BioLink {
  id: number;
  title: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  isScheduled: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
  clickCount?: number;
}

interface BioConfig {
  id: number;
  eventLogoUrl?: string;
  showEventDate: boolean;
  showTrailerButton: boolean;
  bioTitle?: string;
  bioSubtitle?: string;
}

interface FormData {
  title: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  isScheduled: boolean;
  scheduleStart: string;
  scheduleEnd: string;
}

const BioLinksManager = () => {
  const [bioLinks, setBioLinks] = useState<BioLink[]>([]);
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  // Helper function to check if a link is expired
  const isLinkExpired = (link: BioLink): boolean => {
    if (!link.isScheduled || !link.scheduleEnd) return false;
    const now = new Date();
    const endDate = new Date(link.scheduleEnd);
    return now > endDate;
  };
  const [bioConfig, setBioConfig] = useState<BioConfig>({
    id: 1,
    showEventDate: true,
    showTrailerButton: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    url: '',
    displayOrder: 0,
    isActive: true,
    isScheduled: false,
    scheduleStart: '',
    scheduleEnd: ''
  });

  // Estados locais para inputs com debouncing
  const [localBioTitle, setLocalBioTitle] = useState('');
  const [localBioSubtitle, setLocalBioSubtitle] = useState('');

  // Debounced values que irão disparar as atualizações
  const debouncedBioTitle = useDebounce(localBioTitle, 1000);
  const debouncedBioSubtitle = useDebounce(localBioSubtitle, 1000);

  const { toast } = useToast();

  useEffect(() => {
    loadBioData();
  }, []);

  // Sincronizar valores locais quando bioConfig carrega
  useEffect(() => {
    setLocalBioTitle(bioConfig.bioTitle || '');
    setLocalBioSubtitle(bioConfig.bioSubtitle || '');
  }, [bioConfig.bioTitle, bioConfig.bioSubtitle]);

  // Atualizar quando valores debounced mudam (só depois que bioConfig carregou)
  useEffect(() => {
    if (bioConfig.id && debouncedBioTitle !== (bioConfig.bioTitle || '')) {
      handleConfigUpdate({ bioTitle: debouncedBioTitle || null });
    }
  }, [debouncedBioTitle, bioConfig.id]);

  useEffect(() => {
    if (bioConfig.id && debouncedBioSubtitle !== (bioConfig.bioSubtitle || '')) {
      handleConfigUpdate({ bioSubtitle: debouncedBioSubtitle || null });
    }
  }, [debouncedBioSubtitle, bioConfig.id]);

  const loadBioData = async () => {
    try {
      setIsLoading(true);
      const [linksResponse, configResponse, analyticsResponse] = await Promise.all([
        fetch('/api/bio-links?includeInactive=true&includeExpired=true'),
        fetch('/api/bio-config'),
        fetch('/api/bio-analytics/summary')
      ]);

      if (linksResponse.ok) {
        const links = await linksResponse.json();

        // Merge analytics data if available
        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json();
          const linksWithAnalytics = links.map((link: BioLink) => ({
            ...link,
            clickCount: analytics.find((a: any) => a.bioLinkId === link.id)?.clickCount || 0
          }));
          setBioLinks(linksWithAnalytics);
        } else {
          setBioLinks(links);
        }
      }

      if (configResponse.ok) {
        const config = await configResponse.json();
        setBioConfig(config);
      }
    } catch (error) {
      console.error('Error loading bio data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da bio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      displayOrder: bioLinks.length + 1,
      isActive: true,
      isScheduled: false,
      scheduleStart: '',
      scheduleEnd: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e URL são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        scheduleStart: formData.isScheduled && formData.scheduleStart ? new Date(formData.scheduleStart).toISOString() : null,
        scheduleEnd: formData.isScheduled && formData.scheduleEnd ? new Date(formData.scheduleEnd).toISOString() : null,
      };

      if (editingId) {
        await fetch(`/api/bio-links/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast({ title: "Link atualizado com sucesso!" });
      } else {
        await fetch('/api/bio-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast({ title: "Link criado com sucesso!" });
      }

      await loadBioData();
      resetForm();
    } catch (error) {
      console.error('Error saving bio link:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (link: BioLink) => {
    setFormData({
      title: link.title,
      url: link.url,
      displayOrder: link.displayOrder,
      isActive: link.isActive,
      isScheduled: link.isScheduled,
      scheduleStart: link.scheduleStart ? new Date(link.scheduleStart).toISOString().slice(0, 16) : '',
      scheduleEnd: link.scheduleEnd ? new Date(link.scheduleEnd).toISOString().slice(0, 16) : ''
    });
    setEditingId(link.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return;

    try {
      setIsLoading(true);
      await fetch(`/api/bio-links/${id}`, { method: 'DELETE' });
      await loadBioData();
      toast({ title: "Link excluído com sucesso!" });
    } catch (error) {
      console.error('Error deleting bio link:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigUpdate = async (updates: Partial<BioConfig>) => {
    try {
      setIsLoading(true);
      const updatedConfig = { ...bioConfig, ...updates };

      await fetch('/api/bio-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      setBioConfig(updatedConfig);
      toast({ title: "Configuração atualizada!" });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Erro ao atualizar configuração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLinks = showOnlyActive ? bioLinks.filter(link => link.isActive) : bioLinks;

  return (
    <div className="space-y-6">
      {/* Bio Configuration */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-50">Configurações da Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FileUpload
                label="Logo do Evento (Circular)"
                value={bioConfig.eventLogoUrl}
                onChange={(url) => handleConfigUpdate({ eventLogoUrl: url })}
                folder="bio"
                accept="image/*"
              />

              <div>
                <Label className="text-slate-50">Título Personalizado</Label>
                <Input
                  value={localBioTitle}
                  onChange={(e) => setLocalBioTitle(e.target.value)}
                  placeholder="Deixe em branco para usar o título do evento"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>

              <div>
                <Label className="text-slate-50">Subtítulo Personalizado</Label>
                <Input
                  value={localBioSubtitle}
                  onChange={(e) => setLocalBioSubtitle(e.target.value)}
                  placeholder="Deixe em branco para usar o subtítulo do evento"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-50">Mostrar Data do Evento</Label>
                <Switch
                  checked={bioConfig.showEventDate}
                  onCheckedChange={(checked) => handleConfigUpdate({ showEventDate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-slate-50">Mostrar Botão do Trailer</Label>
                <Switch
                  checked={bioConfig.showTrailerButton}
                  onCheckedChange={(checked) => handleConfigUpdate({ showTrailerButton: checked })}
                />
              </div>

              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-sm text-yellow-500">
                  <strong>Visualizar:</strong> Acesse <a href="/bio" target="_blank" className="underline">/bio</a> para ver como a página está ficando.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Management */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-50">Links da Bio</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-slate-50 text-sm">Apenas ativos</Label>
                <Switch
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                />
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-slate-600">
              <CardHeader>
                <CardTitle className="text-yellow-500 text-lg">
                  {editingId ? 'Editar Link' : 'Novo Link'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-50">Título *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={`ex: 🎫 Inscrições ${eventData?.eventTitle || getSiteNameWithYear('2025')}`}
                        className="bg-slate-700 border-slate-600 text-slate-50"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-slate-50">URL *</Label>
                      <Input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://..."
                        className="bg-slate-700 border-slate-600 text-slate-50"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-slate-50">Ordem de Exibição</Label>
                      <Input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label className="text-slate-50 text-sm">Ativo</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.isScheduled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isScheduled: checked }))}
                        />
                        <Label className="text-slate-50 text-sm">Agendado</Label>
                      </div>
                    </div>
                  </div>

                  {formData.isScheduled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div>
                        <Label className="text-slate-50">Data/Hora de Início</Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduleStart}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduleStart: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-slate-50"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-50">Data/Hora de Fim</Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduleEnd}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduleEnd: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-slate-50"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {editingId ? 'Atualizar' : 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Nenhum link encontrado.
                </div>
              ) : (
                filteredLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-50 font-medium">{link.title}</span>
                          {!link.isActive && <Badge variant="secondary">Inativo</Badge>}
                          {link.isScheduled && !isLinkExpired(link) && <Badge className="bg-yellow-500/20 text-yellow-500"><Calendar className="w-3 h-3 mr-1" />Agendado</Badge>}
                          {isLinkExpired(link) && <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Expirado</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>{link.url}</span>
                          {link.clickCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {link.clickCount} clicks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(link.url, '_blank')}
                        className="border-slate-600 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(link)}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(link.id)}
                        className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BioLinksManager;