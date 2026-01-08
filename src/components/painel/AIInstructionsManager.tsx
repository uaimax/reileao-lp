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
  GripVertical, MoveUp, MoveDown, Eye, EyeOff, Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface AIInstruction {
  id: number;
  title: string;
  content: string;
  orderIndex: number;
  isActive: boolean;
}

interface FormData {
  title: string;
  content: string;
  orderIndex: number;
  isActive: boolean;
}

const AIInstructionsManager = () => {
  const [instructions, setInstructions] = useState<AIInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    orderIndex: 0,
    isActive: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadInstructionsData();
  }, []);

  const loadInstructionsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-instructions?includeInactive=true');

      if (response.ok) {
        const data = await response.json();
        setInstructions(data);
      }
    } catch (error) {
      console.error('Error loading AI instructions data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as instruções para IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
      setFormData({
        title: '',
        content: '',
        orderIndex: 0,
        isActive: true
      });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (editingId) {
        // Update existing instruction
        await fetch(`/api/ai-instructions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        toast({ title: "Instrução atualizada com sucesso!" });
      } else {
        // Create new instruction
        await fetch('/api/ai-instructions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        toast({ title: "Instrução criada com sucesso!" });
      }

      await loadInstructionsData();
      resetForm();
      setShowAddForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving AI instruction:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a instrução.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (instruction: AIInstruction) => {
      setFormData({
        title: instruction.title,
        content: instruction.content,
        orderIndex: instruction.orderIndex,
        isActive: instruction.isActive
      });
    setEditingId(instruction.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta instrução?')) return;

    try {
      setIsLoading(true);
      await fetch(`/api/ai-instructions/${id}`, { method: 'DELETE' });
      await loadInstructionsData();
      toast({ title: "Instrução excluída com sucesso!" });
    } catch (error) {
      console.error('Error deleting AI instruction:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a instrução.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (instruction: AIInstruction) => {
    try {
      setIsLoading(true);

      const newActiveStatus = !instruction.isActive;
      await fetch(`/api/ai-instructions/${instruction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...instruction, isActive: newActiveStatus }),
      });

      await loadInstructionsData();

      toast({
        title: newActiveStatus ? "Instrução ativada!" : "Instrução desativada!",
        description: `A instrução foi ${newActiveStatus ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling AI instruction active status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da instrução.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (instruction: AIInstruction, index: number) => {
    if (index === 0) return;

    const otherInstruction = instructions[index - 1];

    try {
      setIsLoading(true);

      await Promise.all([
        fetch(`/api/ai-instructions/${instruction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...instruction, order_index: otherInstruction.order_index }),
        }),
        fetch(`/api/ai-instructions/${otherInstruction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...otherInstruction, order_index: instruction.order_index }),
        })
      ]);

      await loadInstructionsData();

      toast({
        title: "Posição alterada!",
        description: "A instrução foi movida para cima.",
      });
    } catch (error) {
      console.error('Error moving AI instruction up:', error);
      toast({
        title: "Erro ao mover",
        description: "Não foi possível alterar a posição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (instruction: AIInstruction, index: number) => {
    if (index === instructions.length - 1) return;

    const otherInstruction = instructions[index + 1];

    try {
      setIsLoading(true);

      await Promise.all([
        fetch(`/api/ai-instructions/${instruction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...instruction, order_index: otherInstruction.order_index }),
        }),
        fetch(`/api/ai-instructions/${otherInstruction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...otherInstruction, order_index: instruction.order_index }),
        })
      ]);

      await loadInstructionsData();

      toast({
        title: "Posição alterada!",
        description: "A instrução foi movida para baixo.",
      });
    } catch (error) {
      console.error('Error moving AI instruction down:', error);
      toast({
        title: "Erro ao mover",
        description: "Não foi possível alterar a posição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && instructions.length === 0) {
    return (
      <Card className="glass-effect border-neon-purple/30">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
          <span className="ml-2 text-soft-white">Carregando instruções...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-8 h-8 text-neon-cyan" />
        <div>
          <h1 className="text-3xl font-bold text-soft-white">Instruções Adicionais para IA</h1>
          <p className="text-text-gray mt-1">
            Configure informações complementares que aparecerão no eventSummary para consumo por IAs
          </p>
        </div>
      </div>

      {/* Instructions Management */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-soft-white">Gerenciar Instruções</h2>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="btn-neon"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Instrução
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card className="glass-effect border-neon-purple/30">
          <CardHeader>
            <CardTitle className="text-xl text-soft-white">
              {editingId ? 'Editar Instrução' : 'Adicionar Nova Instrução'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-soft-white">
                Título da Instrução
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Informações sobre Hospedagem"
                className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
              />
            </div>

            <div className="space-y-2">
              <RichTextEditor
                label="Conteúdo da Instrução"
                content={formData.content}
                onChange={(content) => setFormData({...formData, content: content})}
                placeholder="Digite o conteúdo que será incluído no eventSummary..."
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_index" className="text-soft-white">
                  Ordem de Exibição
                </Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
                />
              </div>

              <div className="flex items-center gap-2 mt-6">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label className="text-soft-white text-sm">Ativa</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading} className="btn-neon">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Salvar Alterações' : 'Adicionar Instrução'}
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions List */}
      <div className="grid gap-4">
        {instructions.length === 0 ? (
          <Card className="glass-effect border-neon-purple/30">
            <CardContent className="text-center py-8">
              <Bot className="w-12 h-12 text-text-gray mx-auto mb-4" />
              <p className="text-text-gray">Nenhuma instrução para IA cadastrada.</p>
              <p className="text-sm text-text-gray mt-2">Clique em "Adicionar Instrução" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          instructions.map((instruction, index) => (
            <Card key={instruction.id} className="glass-effect border-neon-purple/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <GripVertical className="w-5 h-5 text-text-gray cursor-grab mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-neon-cyan">{instruction.title}</h3>
                      {!instruction.isActive && <Badge variant="secondary">Inativa</Badge>}
                    </div>
                    <div
                      className="text-sm text-text-gray prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: instruction.content }}
                    />
                    <p className="text-xs text-text-gray mt-2">Ordem: {instruction.order_index}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMoveUp(instruction, index)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-dark-bg"
                        disabled={isLoading || index === 0}
                        title="Mover para cima"
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleMoveDown(instruction, index)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-dark-bg"
                        disabled={isLoading || index === instructions.length - 1}
                        title="Mover para baixo"
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleActive(instruction)}
                        size="sm"
                        variant="outline"
                        className={instruction.isActive
                          ? "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          : "border-green-500 text-green-500 hover:bg-green-500 hover:text-dark-bg"
                        }
                        disabled={isLoading}
                        title={instruction.isActive ? 'Desativar Instrução' : 'Ativar Instrução'}
                      >
                        {instruction.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => handleEdit(instruction)}
                        size="sm"
                        variant="outline"
                        className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg"
                        disabled={isLoading}
                        title="Editar Instrução"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(instruction.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        disabled={isLoading}
                        title="Excluir Instrução"
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

export default AIInstructionsManager;
