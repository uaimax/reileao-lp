import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, Testimonial } from '@/lib/api';
import { getS3Status } from '@/lib/s3-client';
import { FileUpload } from '@/components/ui/file-upload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface FormData {
  name: string;
  cityState: string;
  testimonialText: string;
  photoUrl: string;
  displayOrder: number;
}

const DepoimentosManager = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [s3Enabled, setS3Enabled] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cityState: '',
    testimonialText: '',
    photoUrl: '',
    displayOrder: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadTestimonials();
    checkS3Status();
  }, []);

  const checkS3Status = async () => {
    try {
      const status = await getS3Status();
      setS3Enabled(status.enabled && status.configured);
    } catch (error) {
      console.error('Error checking S3 status:', error);
      setS3Enabled(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast({
        title: "Erro ao carregar depoimentos",
        description: "Não foi possível carregar a lista de depoimentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cityState: '',
      testimonialText: '',
      photoUrl: '',
      displayOrder: 0
    });
  };

  const handleAdd = async () => {
    if (formData.name && formData.cityState && formData.testimonialText) {
      try {
        setIsLoading(true);
        await createTestimonial({
          name: formData.name,
          cityState: formData.cityState,
          testimonialText: formData.testimonialText,
          photoUrl: formData.photoUrl,
          displayOrder: formData.displayOrder || 0,
          isActive: true
        });

        await loadTestimonials();
        resetForm();
        setShowAddForm(false);

        toast({
          title: "Depoimento adicionado!",
          description: `Depoimento de ${formData.name} foi adicionado com sucesso.`,
        });
      } catch (error) {
        console.error('Error adding testimonial:', error);
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar o depoimento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (testimonial: any) => {
    setFormData({
      name: testimonial.name,
      cityState: testimonial.cityState,
      testimonialText: testimonial.testimonialText,
      photoUrl: testimonial.photoUrl || '',
      displayOrder: testimonial.displayOrder || 0
    });
    setEditingId(testimonial.id);
  };

  const handleSaveEdit = async () => {
    if (editingId && formData.name && formData.cityState && formData.testimonialText) {
      try {
        setIsLoading(true);
        await updateTestimonial(editingId, {
          name: formData.name,
          cityState: formData.cityState,
          testimonialText: formData.testimonialText,
          photoUrl: formData.photoUrl,
          displayOrder: formData.displayOrder || 0
        });

        await loadTestimonials();
        resetForm();
        setEditingId(null);

        toast({
          title: "Depoimento atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } catch (error) {
        console.error('Error updating testimonial:', error);
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
      await deleteTestimonial(id);
      await loadTestimonials();

      toast({
        title: "Depoimento removido!",
        description: "O depoimento foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o depoimento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && testimonials.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          <span className="ml-2 text-slate-50">Carregando depoimentos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-50">Gerenciar Depoimentos</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Depoimento
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-50">
              {editingId ? 'Editar Depoimento' : 'Adicionar Novo Depoimento'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-50">Nome da Pessoa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome completo"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cityState" className="text-slate-50">Cidade e Estado</Label>
                <Input
                  id="cityState"
                  value={formData.cityState}
                  onChange={(e) => setFormData({...formData, cityState: e.target.value})}
                  placeholder="Ex: Uberlândia (MG)"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            {s3Enabled && (
              <div className="space-y-2">
                <FileUpload
                  label="Foto da Pessoa"
                  value={formData.photoUrl}
                  onChange={(url) => setFormData({...formData, photoUrl: url})}
                  folder="testimonials"
                  accept="image/*"
                  disabled={isLoading}
                />
              </div>
            )}

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

            <div className="space-y-2">
              <RichTextEditor
                label="Texto do Depoimento"
                content={formData.testimonialText}
                onChange={(content) => setFormData({...formData, testimonialText: content})}
                placeholder="Digite o depoimento completo aqui..."
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={editingId ? handleSaveEdit : handleAdd} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Salvar Alterações' : 'Adicionar Depoimento'}
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
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {testimonial.photoUrl ? (
                      <img
                        src={testimonial.photoUrl}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {testimonial.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-50">{testimonial.name}</h3>
                      <p className="text-yellow-500 text-sm">{testimonial.cityState}</p>
                      <p className="text-xs text-slate-400">Ordem: {testimonial.displayOrder}</p>
                    </div>
                  </div>
                  <div
                    className="text-slate-400 leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: testimonial.testimonialText }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(testimonial)}
                    size="sm"
                    variant="outline"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(testimonial.id)}
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
      </div>
    </div>
  );
};

export default DepoimentosManager;