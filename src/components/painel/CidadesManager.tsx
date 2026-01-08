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
import { SITE_NAME } from '@/lib/site-config';

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
      <div className="text-slate-50">Carregando cidades...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-50 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-yellow-500" />
            Cidades com Representantes
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie as cidades que já possuem representantes no {SITE_NAME}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-slate-50">
              Total de cidades: <Badge className="bg-yellow-500 text-slate-900">{cidades.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsAdding(!isAdding);
                  setIsBatchMode(false);
                }}
                variant={isAdding && !isBatchMode ? "default" : "outline"}
                className={isAdding && !isBatchMode ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900" : "border-slate-600 text-slate-50"}
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
                className={isBatchMode ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900" : "border-slate-600 text-yellow-500"}
              >
                <FileText className="w-4 h-4 mr-2" />
                Adicionar em Lote
              </Button>
            </div>
          </div>

          {isAdding && (
            <Card className="mb-6 border-slate-600">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-50">Estado</Label>
                    <Select value={newCidade.estado} onValueChange={handleEstadoChange}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {estados.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value} className="text-slate-50">
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-50">Cidade</Label>
                    <Select
                      value={newCidade.nome}
                      onValueChange={(nome) => setNewCidade(prev => ({ ...prev, nome }))}
                      disabled={!newCidade.estado || carregandoCidades}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder={
                          !newCidade.estado
                            ? "Primeiro selecione o estado"
                            : carregandoCidades
                              ? "Carregando cidades..."
                              : "Selecione a cidade"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                        {cidadesDisponiveis.map((cidade: any) => (
                          <SelectItem key={cidade.id} value={cidade.nome} className="text-slate-50">
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
                    className="border-slate-600 text-slate-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddCidade}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {cidades.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhuma cidade configurada ainda
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-50">Cidade</TableHead>
                    <TableHead className="text-slate-50">Estado</TableHead>
                    <TableHead className="text-slate-50">Data de Adição</TableHead>
                    <TableHead className="text-slate-50">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cidades.map((cidade) => (
                    <TableRow key={cidade.id} className="border-slate-700">
                      <TableCell className="text-slate-50 font-medium">
                        {cidade.nome}
                      </TableCell>
                      <TableCell className="text-slate-50">
                        {getEstadoLabel(cidade.estado)}
                      </TableCell>
                      <TableCell className="text-slate-400">
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
