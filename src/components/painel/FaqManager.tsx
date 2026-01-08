import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Edit, Trash2, Save, X, Loader2,
  GripVertical, MoveUp, MoveDown, Eye, EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SITE_NAME } from '@/lib/site-config';

interface Faq {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

interface FaqContent {
  id: number;
  sectionTitle: string;
  sectionSubtitle: string;
}

interface FormData {
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

const FaqManager = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqContent, setFaqContent] = useState<FaqContent>({
    id: 1,
    sectionTitle: 'Perguntas Frequentes',
    sectionSubtitle: `Tire suas dúvidas sobre o ${SITE_NAME}`
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    question: '',
    answer: '',
    displayOrder: 0,
    isActive: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadFaqData();
  }, []);

  const loadFaqData = async () => {
    try {
      setIsLoading(true);
      const [faqsResponse, contentResponse] = await Promise.all([
        fetch('/api/faqs?includeInactive=true'),
        fetch('/api/faq-content')
      ]);

      if (faqsResponse.ok) {
        const faqsData = await faqsResponse.json();
        setFaqs(faqsData);
      }

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setFaqContent(contentData);
      }
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as perguntas frequentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      displayOrder: 0,
      isActive: true
    });
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Pergunta e resposta são obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (editingId) {
        // Update existing FAQ
        await fetch(`/api/faqs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        toast({ title: "FAQ atualizada com sucesso!" });
      } else {
        // Create new FAQ
        await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        toast({ title: "FAQ criada com sucesso!" });
      }

      await loadFaqData();
      resetForm();
      setShowAddForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a FAQ.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (faq: Faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
      isActive: faq.isActive
    });
    setEditingId(faq.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta FAQ?')) return;

    try {
      setIsLoading(true);
      await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
      await loadFaqData();
      toast({ title: "FAQ excluída com sucesso!" });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a FAQ.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (faq: Faq) => {
    try {
      setIsLoading(true);

      const newActiveStatus = !faq.isActive;
      await fetch(`/api/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...faq, isActive: newActiveStatus }),
      });

      await loadFaqData();

      toast({
        title: newActiveStatus ? "FAQ ativada!" : "FAQ desativada!",
        description: `A FAQ foi ${newActiveStatus ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling FAQ active status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da FAQ.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (faq: Faq, index: number) => {
    if (index === 0) return;

    const otherFaq = faqs[index - 1];

    try {
      setIsLoading(true);

      await Promise.all([
        fetch(`/api/faqs/${faq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...faq, displayOrder: otherFaq.displayOrder }),
        }),
        fetch(`/api/faqs/${otherFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...otherFaq, displayOrder: faq.displayOrder }),
        })
      ]);

      await loadFaqData();

      toast({
        title: "Posição alterada!",
        description: "A FAQ foi movida para cima.",
      });
    } catch (error) {
      console.error('Error moving FAQ up:', error);
      toast({
        title: "Erro ao mover",
        description: "Não foi possível alterar a posição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (faq: Faq, index: number) => {
    if (index === faqs.length - 1) return;

    const otherFaq = faqs[index + 1];

    try {
      setIsLoading(true);

      await Promise.all([
        fetch(`/api/faqs/${faq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...faq, displayOrder: otherFaq.displayOrder }),
        }),
        fetch(`/api/faqs/${otherFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...otherFaq, displayOrder: faq.displayOrder }),
        })
      ]);

      await loadFaqData();

      toast({
        title: "Posição alterada!",
        description: "A FAQ foi movida para baixo.",
      });
    } catch (error) {
      console.error('Error moving FAQ down:', error);
      toast({
        title: "Erro ao mover",
        description: "Não foi possível alterar a posição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSave = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/faq-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqContent),
      });

      toast({ title: "Configurações da seção salvas!" });
    } catch (error) {
      console.error('Error saving FAQ content:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações da seção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && faqs.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          <span className="ml-2 text-slate-50">Carregando FAQs...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Configuration */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-slate-50">
            Configurações da Seção FAQ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sectionTitle" className="text-slate-50">
              Título da Seção
            </Label>
            <Input
              id="sectionTitle"
              value={faqContent.sectionTitle}
              onChange={(e) => setFaqContent(prev => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder="Perguntas Frequentes"
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sectionSubtitle" className="text-slate-50">
              Subtítulo da Seção
            </Label>
            <Input
              id="sectionSubtitle"
              value={faqContent.sectionSubtitle}
              onChange={(e) => setFaqContent(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
              placeholder={`Tire suas dúvidas sobre o ${SITE_NAME}`}
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
          <Button onClick={handleContentSave} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* FAQ Management */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-50">Gerenciar Perguntas Frequentes</h2>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar FAQ
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-50">
              {editingId ? 'Editar FAQ' : 'Adicionar Nova FAQ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-slate-50">
                Pergunta
              </Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                placeholder="Digite a pergunta..."
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <RichTextEditor
                label="Resposta"
                content={formData.answer}
                onChange={(content) => setFormData({...formData, answer: content})}
                placeholder="Digite a resposta..."
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder" className="text-slate-50">
                  Ordem de Exibição
                </Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>

              <div className="flex items-center gap-2 mt-6">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label className="text-slate-50 text-sm">Ativa</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Salvar Alterações' : 'Adicionar FAQ'}
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

      {/* FAQ List */}
      <div className="grid gap-4">
        {faqs.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">Nenhuma pergunta frequente cadastrada.</p>
              <p className="text-sm text-slate-400 mt-2">Clique em "Adicionar FAQ" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq, index) => (
            <Card key={faq.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <GripVertical className="w-5 h-5 text-slate-400 cursor-grab mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-50">{faq.question}</h3>
                      {!faq.isActive && <Badge variant="secondary">Inativa</Badge>}
                    </div>
                    <div
                      className="text-sm text-slate-400 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                    <p className="text-xs text-slate-400 mt-2">Ordem: {faq.displayOrder}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMoveUp(faq, index)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                        disabled={isLoading || index === 0}
                        title="Mover para cima"
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleMoveDown(faq, index)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                        disabled={isLoading || index === faqs.length - 1}
                        title="Mover para baixo"
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleActive(faq)}
                        size="sm"
                        variant="outline"
                        className={faq.isActive
                          ? "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        }
                        disabled={isLoading}
                        title={faq.isActive ? 'Desativar FAQ' : 'Ativar FAQ'}
                      >
                        {faq.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => handleEdit(faq)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                        disabled={isLoading}
                        title="Editar FAQ"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(faq.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        disabled={isLoading}
                        title="Excluir FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FaqManager;