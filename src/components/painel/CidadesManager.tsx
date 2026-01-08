import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, MapPin, FileText, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Cidade {
  id: string;
  nome: string;
  estado: string;
  createdAt: string;
}

const CidadesManager = () => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [newCidade, setNewCidade] = useState({
    nome: '',
    estado: ''
  });

  const estados = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  useEffect(() => {
    fetchCidades();
  }, []);

  const fetchCidades = async () => {
    try {
      const data = await apiClient.getCidadesConfiguradas();
      setCidades(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Erro ao carregar cidades');
    } finally {
      setIsLoading(false);
    }
  };

  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);

  const handleEstadoChange = async (estado: string) => {
    setNewCidade(prev => ({ ...prev, estado, nome: '' }));
    if (estado) {
      setCarregandoCidades(true);
      try {
        const response = await apiClient.getCidades(estado);
        setCidadesDisponiveis(response);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setCarregandoCidades(false);
      }
    } else {
      setCidadesDisponiveis([]);
    }
  };

  const handleAddCidade = async () => {
    if (!newCidade.nome || !newCidade.estado) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await apiClient.addCidadeConfigurada(newCidade);
      toast.success('Cidade adicionada com sucesso');
      setNewCidade({ nome: '', estado: '' });
      setCidadesDisponiveis([]);
      setIsAdding(false);
      fetchCidades();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar cidade');
    }
  };

  const handleBatchAdd = async () => {
    if (!batchText.trim()) {
      toast.error('Digite pelo menos uma cidade');
      return;
    }

    setIsProcessingBatch(true);
    const cidadesText = batchText.trim().split('\n').filter(line => line.trim());
    const cidadesExistentes = cidades.map(c => c.nome.toLowerCase());
    
    let adicionadas = 0;
    let ignoradas = 0;
    const erros = [];

    try {
      // Primeiro, vamos buscar todas as cidades disponíveis para fazer o match
      const todasCidades = [];
      for (const estado of estados) {
        try {
          const cidadesDoEstado = await apiClient.getCidades(estado.value);
          todasCidades.push(...cidadesDoEstado.map((c: any) => ({
            ...c,
            estado: estado.value
          })));
        } catch (error) {
          console.warn(`Erro ao carregar cidades de ${estado.label}:`, error);
        }
      }

      // Processar cada cidade do texto
      for (const cidadeNome of cidadesText) {
        const nomeLimpo = cidadeNome.trim();
        
        // Verificar se já existe
        if (cidadesExistentes.includes(nomeLimpo.toLowerCase())) {
          ignoradas++;
          continue;
        }

        // Buscar match nas cidades disponíveis
        const cidadeEncontrada = todasCidades.find(c => 
          c.nome.toLowerCase() === nomeLimpo.toLowerCase()
        );

        if (cidadeEncontrada) {
          try {
            await apiClient.addCidadeConfigurada({
              nome: cidadeEncontrada.nome,
              estado: cidadeEncontrada.estado
            });
            adicionadas++;
          } catch (error: any) {
            erros.push(`${nomeLimpo}: ${error.message || 'Erro ao adicionar'}`);
          }
        } else {
          ignoradas++;
        }
      }

      // Mostrar resultado
      if (adicionadas > 0) {
        toast.success(`${adicionadas} cidade(s) adicionada(s) com sucesso!`);
      }
      if (ignoradas > 0) {
        toast.info(`${ignoradas} cidade(s) ignorada(s) (não encontradas ou já existentes)`);
      }
      if (erros.length > 0) {
        toast.error(`${erros.length} erro(s) ao adicionar cidades`);
        console.error('Erros detalhados:', erros);
      }

      // Limpar e recarregar
      setBatchText('');
      setIsBatchMode(false);
      fetchCidades();

    } catch (error: any) {
      toast.error('Erro ao processar cidades em lote');
      console.error('Erro:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleRemoveCidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta cidade?')) return;

    try {
      await apiClient.removeCidadeConfigurada(id);
      toast.success('Cidade removida com sucesso');
      fetchCidades();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover cidade');
    }
  };

  const getEstadoLabel = (estado: string) => {
    return estados.find(e => e.value === estado)?.label || estado;
  };

  if (isLoading) {
    return (
      <div className="text-soft-white">Carregando cidades...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-neon-purple/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-soft-white flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-neon-purple" />
            Cidades com Representantes
          </CardTitle>
          <CardDescription className="text-text-gray">
            Gerencie as cidades que já possuem representantes no UAIZOUK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-soft-white">
              Total de cidades: <Badge className="bg-neon-purple text-white">{cidades.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsAdding(!isAdding);
                  setIsBatchMode(false);
                }}
                variant={isAdding && !isBatchMode ? "default" : "outline"}
                className={isAdding && !isBatchMode ? "bg-neon-purple hover:bg-neon-purple/80 text-white" : "border-neon-purple/50 text-soft-white"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Individual
              </Button>
              <Button
                onClick={() => {
                  setIsBatchMode(!isBatchMode);
                  setIsAdding(false);
                }}
                variant={isBatchMode ? "default" : "outline"}
                className={isBatchMode ? "bg-neon-cyan hover:bg-neon-cyan/80 text-dark-bg" : "border-neon-cyan/50 text-neon-cyan"}
              >
                <FileText className="w-4 h-4 mr-2" />
                Adicionar em Lote
              </Button>
            </div>
          </div>

          {isAdding && (
            <Card className="mb-6 border-neon-cyan/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-soft-white">Estado</Label>
                    <Select value={newCidade.estado} onValueChange={handleEstadoChange}>
                      <SelectTrigger className="bg-dark-bg border-neon-purple/50 text-soft-white">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-bg border-neon-purple/50">
                        {estados.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value} className="text-soft-white">
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-soft-white">Cidade</Label>
                    <Select
                      value={newCidade.nome}
                      onValueChange={(nome) => setNewCidade(prev => ({ ...prev, nome }))}
                      disabled={!newCidade.estado || carregandoCidades}
                    >
                      <SelectTrigger className="bg-dark-bg border-neon-purple/50 text-soft-white">
                        <SelectValue placeholder={
                          !newCidade.estado
                            ? "Primeiro selecione o estado"
                            : carregandoCidades
                              ? "Carregando cidades..."
                              : "Selecione a cidade"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-bg border-neon-purple/50 max-h-60">
                        {cidadesDisponiveis.map((cidade: any) => (
                          <SelectItem key={cidade.id} value={cidade.nome} className="text-soft-white">
                            {cidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewCidade({ nome: '', estado: '' });
                      setCidadesDisponiveis([]);
                    }}
                    className="border-neon-purple/50 text-soft-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddCidade}
                    className="bg-neon-cyan hover:bg-neon-cyan/80 text-dark-bg"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {cidades.length === 0 ? (
            <div className="text-center py-8 text-text-gray">
              Nenhuma cidade configurada ainda
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neon-purple/20">
                    <TableHead className="text-soft-white">Cidade</TableHead>
                    <TableHead className="text-soft-white">Estado</TableHead>
                    <TableHead className="text-soft-white">Data de Adição</TableHead>
                    <TableHead className="text-soft-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cidades.map((cidade) => (
                    <TableRow key={cidade.id} className="border-neon-purple/10">
                      <TableCell className="text-soft-white font-medium">
                        {cidade.nome}
                      </TableCell>
                      <TableCell className="text-soft-white">
                        {getEstadoLabel(cidade.estado)}
                      </TableCell>
                      <TableCell className="text-text-gray">
                        {new Date(cidade.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCidade(cidade.id)}
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CidadesManager;
