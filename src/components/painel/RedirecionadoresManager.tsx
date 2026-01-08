import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X, Loader2, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRedirects, createRedirect, updateRedirect, deleteRedirect, Redirect } from '@/lib/api';

interface FormData {
  alias: string;
  targetUrl: string;
  displayOrder: number;
}

const RedirecionadoresManager = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    alias: '',
    targetUrl: '',
    displayOrder: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    try {
      setIsLoading(true);
      const data = await getRedirects();
      setRedirects(data);
    } catch (error) {
      console.error('Error loading redirects:', error);
      toast({
        title: "Erro ao carregar redirecionadores",
        description: "Não foi possível carregar a lista de redirecionadores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      alias: '',
      targetUrl: '',
      displayOrder: 0
    });
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateAlias = (alias: string) => {
    // Remove leading slash if present and validate format
    const cleanAlias = alias.startsWith('/') ? alias.slice(1) : alias;
    const aliasRegex = /^[a-zA-Z0-9-_]+$/;
    return aliasRegex.test(cleanAlias) && cleanAlias.length > 0;
  };

  const handleAdd = async () => {
    const cleanAlias = formData.alias.startsWith('/') ? formData.alias.slice(1) : formData.alias;

    if (!validateAlias(cleanAlias)) {
      toast({
        title: "Alias inválido",
        description: "O alias deve conter apenas letras, números, hífens e sublinhados.",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(formData.targetUrl)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await createRedirect({
        alias: cleanAlias,
        targetUrl: formData.targetUrl,
        displayOrder: formData.displayOrder || 0,
        isActive: true
      });

      await loadRedirects();
      resetForm();
      setShowAddForm(false);

      toast({
        title: "Redirecionador adicionado!",
        description: `/${cleanAlias} → ${formData.targetUrl}`,
      });
    } catch (error) {
      console.error('Error adding redirect:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o redirecionador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (redirect: Redirect) => {
    setFormData({
      alias: redirect.alias,
      targetUrl: redirect.targetUrl,
      displayOrder: redirect.displayOrder || 0
    });
    setEditingId(redirect.id);
  };

  const handleSaveEdit = async () => {
    const cleanAlias = formData.alias.startsWith('/') ? formData.alias.slice(1) : formData.alias;

    if (!validateAlias(cleanAlias)) {
      toast({
        title: "Alias inválido",
        description: "O alias deve conter apenas letras, números, hífens e sublinhados.",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(formData.targetUrl)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      try {
        setIsLoading(true);
        await updateRedirect(editingId, {
          alias: cleanAlias,
          targetUrl: formData.targetUrl,
          displayOrder: formData.displayOrder || 0
        });

        await loadRedirects();
        resetForm();
        setEditingId(null);

        toast({
          title: "Redirecionador atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } catch (error) {
        console.error('Error updating redirect:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteRedirect(id);
      await loadRedirects();

      toast({
        title: "Redirecionador removido!",
        description: "O redirecionador foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting redirect:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o redirecionador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (isLoading && redirects.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          <span className="ml-2 text-slate-50">Carregando redirecionadores...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-50">Gerenciar Redirecionadores</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Redirecionador
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-50">
              {editingId ? 'Editar Redirecionador' : 'Adicionar Novo Redirecionador'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alias" className="text-slate-50">Alias (ex: batata)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-slate-50 bg-slate-700 border border-r-0 border-slate-600 rounded-l-md">
                    /
                  </span>
                  <Input
                    id="alias"
                    value={formData.alias}
                    onChange={(e) => setFormData({...formData, alias: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '')})}
                    placeholder="batata"
                    className="bg-slate-700 border-slate-600 text-slate-50 rounded-l-none"
                  />
                </div>
                <p className="text-xs text-slate-400">Apenas letras, números, hífens e sublinhados</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUrl" className="text-slate-50">URL de Destino</Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                  placeholder="https://google.com.br"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder" className="text-slate-50">Ordem de Exibição (Número)</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={editingId ? handleSaveEdit : handleAdd} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Salvar Alterações' : 'Adicionar Redirecionador'}
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-50"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {redirects.map((redirect) => (
          <Card key={redirect.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-50">/{redirect.alias}</h3>
                    <Button
                      onClick={() => copyToClipboard(`${window.location.origin}/${redirect.alias}`)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-yellow-500 hover:bg-yellow-500/20"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-slate-400">→</span>
                    <a
                      href={redirect.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-500 hover:underline flex items-center gap-1"
                    >
                      {redirect.targetUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400">Ordem: {redirect.displayOrder}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(redirect)}
                    size="sm"
                    variant="outline"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(redirect.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {redirects.length === 0 && !isLoading && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-8">
              <p className="text-slate-400 mb-4">Nenhum redirecionador cadastrado ainda.</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Redirecionador
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RedirecionadoresManager;