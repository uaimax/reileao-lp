import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Phone, Mail, MapPin, User, Eye, MessageCircle, Copy, Link, Plane, CreditCard, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Lead {
  id: string;
  uuid: string;
  nome: string;
  email: string;
  whatsapp: string;
  estado: string;
  cidade: string;
  status: 'approved' | 'rejected' | 'confirmed';
  createdAt: string;
  updatedAt: string;
  confirmationData?: {
    option: 'passagem' | 'pagamento';
    passagemConfirmada?: boolean;
    naoDesistirConfirmado?: boolean;
    comprovantePassagem?: string;
    pixPago?: boolean;
    dataConfirmacao?: string;
  };
}

const LeadsManager = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await apiClient.getPrimeirinhoLeads();

      // Buscar dados de confirmação do localStorage
      const confirmations = JSON.parse(localStorage.getItem('primeirinho_confirmations') || '{}');

      // Adicionar dados de confirmação aos leads
      const leadsWithConfirmation = data.map((lead: any) => {
        const confirmationData = confirmations[lead.id];
        if (confirmationData) {
          lead.confirmationData = confirmationData;
        }
        return lead;
      });

      // Ordenar por data de entrada (mais antigos primeiro)
      const sortedLeads = leadsWithConfirmation.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setLeads(sortedLeads);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: 'rejected' | 'confirmed') => {
    try {
      await apiClient.updatePrimeirinhoLeadStatus(leadId, newStatus);
      const statusMessages = {
        'rejected': 'reprovado',
        'confirmed': 'confirmado'
      };
      toast.success(`Lead ${statusMessages[newStatus]} com sucesso`);
      fetchLeads();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status do lead');
    }
  };

  const openWhatsApp = (whatsapp: string, nome: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const message = `Olá ${nome}! Vi que você se inscreveu no programa PRIMEIRINHO do UAIZOUK. Como posso ajudá-lo?`;
    const url = `https://api.whatsapp.com/send?phone=55${cleanNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const copyLeadLink = async (uuid: string) => {
    const leadUrl = `${window.location.origin}/primeirinho/2026/${uuid}`;
    try {
      await navigator.clipboard.writeText(leadUrl);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = leadUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Aprovado',
          className: 'bg-neon-green text-dark-bg'
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Confirmado',
          className: 'bg-green-600 text-white'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: 'Reprovado',
          className: 'bg-red-500 text-white'
        };
      default:
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Aprovado',
          className: 'bg-neon-green text-dark-bg'
        };
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="text-soft-white">Carregando leads...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-neon-purple/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-soft-white flex items-center">
            <User className="w-6 h-6 mr-2 text-neon-purple" />
            Leads PRIMEIRINHO
          </CardTitle>
          <CardDescription className="text-text-gray">
            Gerencie os leads do programa PRIMEIRINHO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-bg border-neon-purple/50 text-soft-white"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-dark-bg border-neon-purple/50 text-soft-white">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-dark-bg border-neon-purple/50">
                  <SelectItem value="all" className="text-soft-white">Todos</SelectItem>
                  <SelectItem value="approved" className="text-soft-white">Aprovados</SelectItem>
                  <SelectItem value="confirmed" className="text-soft-white">Confirmados</SelectItem>
                  <SelectItem value="rejected" className="text-soft-white">Reprovados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <div className="text-2xl font-bold text-neon-green">{leads.filter(l => l.status === 'approved').length}</div>
              <div className="text-soft-white">Aprovados</div>
            </div>
            <div className="text-center p-4 bg-green-600/10 border border-green-600/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{leads.filter(l => l.status === 'confirmed').length}</div>
              <div className="text-soft-white">Confirmados</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{leads.filter(l => l.status === 'rejected').length}</div>
              <div className="text-soft-white">Reprovados</div>
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-text-gray">
              Nenhum lead encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neon-purple/20">
                    <TableHead className="text-soft-white">Nome</TableHead>
                    <TableHead className="text-soft-white">Contato</TableHead>
                    <TableHead className="text-soft-white">Localização</TableHead>
                    <TableHead className="text-soft-white">Status</TableHead>
                    <TableHead className="text-soft-white">Confirmação</TableHead>
                    <TableHead className="text-soft-white">Data/Horário de Entrada</TableHead>
                    <TableHead className="text-soft-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const statusInfo = getStatusInfo(lead.status);
                    return (
                      <TableRow key={lead.id} className="border-neon-purple/10">
                        <TableCell className="text-soft-white font-medium">
                          {lead.nome}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-soft-white">
                              <Mail className="w-3 h-3 mr-1" />
                              {lead.email}
                            </div>
                            <div className="flex items-center text-sm text-soft-white">
                              <Phone className="w-3 h-3 mr-1" />
                              {lead.whatsapp}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-soft-white">
                            <MapPin className="w-3 h-3 mr-1" />
                            <div className="flex items-center gap-2">
                              <span>{lead.cidade}, {lead.estado}</span>
                              {leads.filter(l => l.cidade === lead.cidade && l.estado === lead.estado).indexOf(lead) === 0 && (
                                <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold" title="Primeiro da cidade">
                                  1º
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.className}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.confirmationData ? (
                            <div className="flex items-center gap-2">
                              {lead.confirmationData.option === 'passagem' ? (
                                <div className="flex items-center gap-1 text-cyan-400">
                                  <Plane className="w-4 h-4" />
                                  <span className="text-xs">Passagem</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-green-400">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="text-xs">PIX</span>
                                </div>
                              )}
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="Dados de confirmação preenchidos" />
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">Sem confirmação</span>
                          )}
                        </TableCell>
                        <TableCell className="text-text-gray text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(lead.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyLeadLink(lead.uuid)}
                              className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                              title="Copiar link da página do lead"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/painel/lead/${lead.uuid}`)}
                              className="border-neon-purple/50 text-soft-white hover:bg-neon-purple/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsManager;
