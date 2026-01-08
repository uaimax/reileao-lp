import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, Loader2, Copy, MoveUp, MoveDown, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getArtists, createArtist, updateArtist, deleteArtist, Artist } from '@/lib/api';
import { getS3Status } from '@/lib/s3-client';
import { FileUpload } from '@/components/ui/file-upload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface FormData {
  name: string;
  role: string;
  cityState: string;
  photoUrl: string;
  description: string;
  promotionalVideoUrl: string;
  displayOrder: number;
}

const ArtistasManager = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [s3Enabled, setS3Enabled] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    cityState: '',
    photoUrl: '',
    description: '',
    promotionalVideoUrl: '',
    displayOrder: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadArtists();
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

  const loadArtists = async () => {
    try {
      setIsLoading(true);
      // Include inactive artists in admin panel
      const data = await getArtists(true);
      setArtists(data);
    } catch (error) {
      console.error('Error loading artists:', error);
      toast({
        title: "Erro ao carregar artistas",
        description: "Não foi possível carregar a lista de artistas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      cityState: '',
      photoUrl: '',
      description: '',
      promotionalVideoUrl: '',
      displayOrder: 0
    });
  };

  const handleAdd = async () => {
    if (formData.name && formData.role && formData.cityState) {
      try {
        setIsLoading(true);
        await createArtist({
          name: formData.name,
          role: formData.role,
          cityState: formData.cityState,
          photoUrl: formData.photoUrl || null,
          description: formData.description || null,
          promotionalVideoUrl: formData.promotionalVideoUrl || null,
          displayOrder: formData.displayOrder || 0,
          isActive: true
        });

        await loadArtists();
        resetForm();
        setShowAddForm(false);

        toast({
          title: "Artista adicionado!",
          description: `${formData.name} foi adicionado com sucesso.`,
        });
      } catch (error) {
        console.error('Error adding artist:', error);
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar o artista.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (artist: Artist) => {
    setFormData({
      name: artist.name,
      role: artist.role,
      cityState: artist.cityState,
      photoUrl: artist.photoUrl || '',
      description: artist.description || '',
      promotionalVideoUrl: artist.promotionalVideoUrl || '',
      displayOrder: artist.displayOrder || 0
    });
    setEditingId(artist.id);
  };

  const handleSaveEdit = async () => {
    if (editingId && formData.name && formData.role && formData.cityState) {
      try {
        setIsLoading(true);
        await updateArtist(editingId, {
          name: formData.name,
          role: formData.role,
          cityState: formData.cityState,
          photoUrl: formData.photoUrl || null,
          description: formData.description || null,
          promotionalVideoUrl: formData.promotionalVideoUrl || null,
          displayOrder: formData.displayOrder || 0
        });

        await loadArtists();
        resetForm();
        setEditingId(null);

        toast({
          title: "Artista atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } catch (error) {
        console.error('Error updating artist:', error);
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
      await deleteArtist(id);
      await loadArtists();

      toast({
        title: "Artista removido!",
        description: "O artista foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o artista.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = (artist: Artist) => {
    setFormData({
      name: `${artist.name} - Cópia`,
      role: artist.role,
      cityState: artist.cityState,
      photoUrl: artist.photoUrl || '',
      description: artist.description || '',
      promotionalVideoUrl: artist.promotionalVideoUrl || '',
      displayOrder: artist.displayOrder || 0
    });
    setShowAddForm(true);
    setEditingId(null);
  };

  const handleMoveUp = async (artist: Artist, index: number) => {
    if (index === 0) return;

    const otherArtist = artists[index - 1];

    try {
      setIsLoading(true);

      // Swap display orders
      await Promise.all([
        updateArtist(artist.id, { ...artist, displayOrder: otherArtist.displayOrder }),
        updateArtist(otherArtist.id, { ...otherArtist, displayOrder: artist.displayOrder })
      ]);

      await loadArtists();

      toast({
        title: "Posição alterada!",
        description: `${artist.name} foi movido para cima.`,
      });
    } catch (error) {
      console.error('Error moving artist up:', error);
      toast({
        title: "Erro ao mover",
        description: "Não foi possível alterar a posição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (artist: Artist, index: number) => {
    if (index === artists.length - 1) return;

    const otherArtist = artists[index + 1];

    try {
      setIsLoading(true);

      // Swap display orders
      await Promise.all([
        updateArtist(artist.id, { ...artist, displayOrder: otherArtist.displayOrder }),
        updateArtist(otherArtist.id, { ...otherArtist, displayOrder: artist.displayOrder })
      ]);

      await loadArtists();

      toast({
        title: "Posição alterada!",
        description: `${artist.name} foi movido para baixo.`,
      });
    } catch (error) {
      console.error('Error moving artist down:', error);
      toast({
        title: "Erro ao mover",
        description: "Não foi possível alterar a posição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (artist: Artist) => {
    try {
      setIsLoading(true);

      const newActiveStatus = !artist.isActive;
      await updateArtist(artist.id, { ...artist, isActive: newActiveStatus });

      await loadArtists();

      toast({
        title: newActiveStatus ? "Artista ativado!" : "Artista desativado!",
        description: `${artist.name} foi ${newActiveStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling artist active status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do artista.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && artists.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          <span className="ml-2 text-slate-50">Carregando artistas...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-50">Gerenciar Artistas</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Artista
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-50">
              {editingId ? 'Editar Artista' : 'Adicionar Novo Artista'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-50">Nome do Artista</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome completo"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-50">Função</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="Ex: DJ, Professor, DJ e MC"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cityState" className="text-slate-50">Cidade / Estado</Label>
                <Input
                  id="cityState"
                  value={formData.cityState}
                  onChange={(e) => setFormData({...formData, cityState: e.target.value})}
                  placeholder="Ex: São Paulo - SP"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />
              </div>
              <div className="space-y-2">
                {s3Enabled ? (
                  <FileUpload
                    label="Foto do Artista"
                    value={formData.photoUrl}
                    onChange={(url) => setFormData({...formData, photoUrl: url})}
                    folder="artists"
                    accept="image/*"
                    disabled={isLoading}
                  />
                ) : (
                  <>
                    <Label htmlFor="photoUrl" className="text-slate-50">URL da Foto</Label>
                    <Input
                      id="photoUrl"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                  </>
                )}
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

            <div className="space-y-2">
              <RichTextEditor
                label="Descrição"
                content={formData.description}
                onChange={(content) => setFormData({...formData, description: content})}
                placeholder="Descrição do artista..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionalVideoUrl" className="text-slate-50">Vídeo Promocional (YouTube)</Label>
              <Input
                id="promotionalVideoUrl"
                value={formData.promotionalVideoUrl}
                onChange={(e) => setFormData({...formData, promotionalVideoUrl: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
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
                {editingId ? 'Salvar Alterações' : 'Adicionar Artista'}
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
        {artists.map((artist, index) => (
          <Card key={artist.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {artist.photoUrl && (
                  <img
                    src={artist.photoUrl}
                    alt={artist.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-50">{artist.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      artist.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {artist.isActive ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                  <p className="text-slate-400">{artist.role} - {artist.cityState}</p>
                  <p className="text-xs text-slate-400">Ordem: {artist.displayOrder}</p>
                  {artist.description && (
                    <div
                      className="text-sm text-slate-400 mt-1 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: artist.description }}
                    />
                  )}
                  {artist.promotionalVideoUrl && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Vídeo: {artist.promotionalVideoUrl}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMoveUp(artist, index)}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                      disabled={isLoading || index === 0}
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleMoveDown(artist, index)}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                      disabled={isLoading || index === artists.length - 1}
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleActive(artist)}
                      size="sm"
                      variant="outline"
                      className={artist.isActive
                        ? "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                        : "border-green-500 text-green-500 hover:bg-green-500 hover:text-slate-900"
                      }
                      disabled={isLoading}
                      title={artist.isActive ? 'Desativar artista' : 'Ativar artista'}
                    >
                      {artist.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => handleDuplicate(artist)}
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-slate-900"
                      disabled={isLoading}
                      title="Duplicar artista"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEdit(artist)}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
                      disabled={isLoading}
                      title="Editar artista"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(artist.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArtistasManager;