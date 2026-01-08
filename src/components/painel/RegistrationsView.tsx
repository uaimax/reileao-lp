import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Download, Eye, Calendar, User, Mail, Phone, CreditCard, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ProductSnapshot {
  name: string;
  option: string;
  price: number;
}

interface Registration {
  id: number;
  eventId: number;
  cpf?: string;
  isForeigner: boolean;
  fullName: string;
  email: string;
  whatsapp: string;
  birthDate: string;
  state?: string;
  city?: string;
  ticketType: string;
  ticketPrice?: string | number;
  partnerName?: string;
  selectedProducts: Record<string, string> | null;
  productsSnapshot?: ProductSnapshot[];
  baseTotal?: string | number;
  discountAmount?: string | number;
  feeAmount?: string | number;
  feePercentage?: string | number;
  total: string | number;
  termsAccepted: boolean;
  paymentMethod: string;
  paymentStatus?: string;
  installments: number;
  createdAt: string;
  updatedAt?: string;
}

const RegistrationsView = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const { toast } = useToast();

  // Helper function to convert total to number
  const getTotalAsNumber = (total: string | number): number => {
    return typeof total === 'string' ? parseFloat(total) : total;
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllRegistrations() as Registration[];
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as inscrições',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.cpf?.includes(searchTerm) ||
      reg.whatsapp.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || (reg.paymentStatus || 'pending') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    const actualStatus = status || 'pending';
    const variants = {
      pending: 'secondary',
      paid: 'default',
      cancelled: 'destructive',
      refunded: 'outline'
    } as const;

    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };

    return (
      <Badge variant={variants[actualStatus as keyof typeof variants] || 'secondary'}>
        {labels[actualStatus as keyof typeof labels] || actualStatus}
      </Badge>
    );
  };

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (registration: Registration) => {
    setEditingRegistration(registration);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await apiClient.updateRegistration(id, { paymentStatus: newStatus });
      toast({
        title: 'Sucesso',
        description: `Status atualizado para ${newStatus}`,
        variant: 'default'
      });
      await loadRegistrations();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta inscrição?')) {
      return;
    }

    try {
      await apiClient.deleteRegistration(id);
      toast({
        title: 'Sucesso',
        description: 'Inscrição excluída com sucesso',
        variant: 'default'
      });
      await loadRegistrations();
    } catch (error) {
      console.error('Erro ao excluir inscrição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a inscrição',
        variant: 'destructive'
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Nome', 'Email', 'WhatsApp', 'CPF/Estrangeiro',
      'Estado', 'Cidade', 'Tipo de Ingresso', 'Nome da Dupla',
      'Produtos', 'Total', 'Status', 'Método de Pagamento', 'Parcelas', 'Data'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map(reg => [
        reg.id,
        `"${reg.fullName}"`,
        `"${reg.email}"`,
        `"${reg.whatsapp}"`,
        reg.isForeigner ? 'Estrangeiro' : `"${reg.cpf || ''}"`,
        `"${reg.state || ''}"`,
        `"${reg.city || ''}"`,
        `"${reg.ticketType}"`,
        `"${reg.partnerName || ''}"`,
        `"${Object.entries(reg.selectedProducts || {}).map(([name, option]) => `${name}: ${option}`).join(', ')}"`,
        getTotalAsNumber(reg.total).toFixed(2),
        reg.paymentStatus || 'pending',
        reg.paymentMethod,
        reg.installments,
        format(new Date(reg.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscricoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando inscrições...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inscrições</h1>
          <p className="text-gray-400">Visualize e gerencie todas as inscrições do evento</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRegistrations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportToCSV} className="bg-neon-purple hover:bg-neon-purple/80">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email, CPF ou WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de inscrições */}
      <div className="space-y-4">
        {filteredRegistrations.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma inscrição encontrada</h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há inscrições para este evento'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRegistrations.map((registration) => (
            <Card key={registration.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{registration.fullName}</h3>
                      {getStatusBadge(registration.paymentStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4" />
                        <span>{registration.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4" />
                        <span>{registration.whatsapp}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-4 h-4" />
                        <span>{registration.isForeigner ? 'Estrangeiro' : registration.cpf}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(registration.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CreditCard className="w-4 h-4" />
                        <span>R$ {getTotalAsNumber(registration.total).toFixed(2)}</span>
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium">{registration.ticketType}</span>
                        {registration.partnerName && (
                          <span className="text-gray-400"> + {registration.partnerName}</span>
                        )}
                      </div>
                    </div>

                    {Object.keys(registration.selectedProducts || {}).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-400 mb-1">Produtos adicionais:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(registration.selectedProducts || {}).map(([name, option], index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {name}: {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(registration)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(registration)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Select
                      value={registration.paymentStatus || 'pending'}
                      onValueChange={(value) => handleUpdateStatus(registration.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="refunded">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(registration.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-purple">{registrations.length}</div>
              <div className="text-sm text-gray-400">Total de Inscrições</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {registrations.filter(r => (r.paymentStatus || 'pending') === 'paid').length}
              </div>
              <div className="text-sm text-gray-400">Pagas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {registrations.filter(r => (r.paymentStatus || 'pending') === 'pending').length}
              </div>
              <div className="text-sm text-gray-400">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                R$ {registrations.reduce((sum, r) => sum + getTotalAsNumber(r.total), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Valor Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Detalhes da Inscrição</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Nome Completo</label>
                  <p className="text-white">{selectedRegistration.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">WhatsApp</label>
                  <p className="text-white">{selectedRegistration.whatsapp}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CPF/Estrangeiro</label>
                  <p className="text-white">
                    {selectedRegistration.isForeigner ? 'Estrangeiro' : selectedRegistration.cpf}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Data de Nascimento</label>
                  <p className="text-white">
                    {format(new Date(selectedRegistration.birthDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Estado</label>
                  <p className="text-white">{selectedRegistration.state || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Cidade</label>
                  <p className="text-white">{selectedRegistration.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Tipo de Ingresso</label>
                  <p className="text-white">{selectedRegistration.ticketType}</p>
                </div>
                {selectedRegistration.partnerName && (
                  <div>
                    <label className="text-sm text-gray-400">Nome da Dupla</label>
                    <p className="text-white">{selectedRegistration.partnerName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-400">Status do Pagamento</label>
                  <div className="mt-1">{getStatusBadge(selectedRegistration.paymentStatus)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Método de Pagamento</label>
                  <p className="text-white">{selectedRegistration.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Parcelas</label>
                  <p className="text-white">{selectedRegistration.installments}x</p>
                </div>
              </div>

              {/* Breakdown de Valores */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <label className="text-sm text-gray-400 mb-3 block font-semibold">Detalhamento do Valor</label>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  {/* Ingresso */}
                  {selectedRegistration.ticketPrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        Ingresso ({selectedRegistration.ticketType}):
                      </span>
                      <span className="text-white">R$ {getTotalAsNumber(selectedRegistration.ticketPrice).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Produtos Adicionais */}
                  {selectedRegistration.productsSnapshot && selectedRegistration.productsSnapshot.length > 0 && (
                    <>
                      {selectedRegistration.productsSnapshot.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">
                            {product.name} ({product.option}):
                          </span>
                          <span className="text-white">
                            {product.price > 0 ? `R$ ${product.price.toFixed(2)}` : 'Grátis'}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Subtotal (se houver breakdown) */}
                  {selectedRegistration.baseTotal && (
                    <>
                      <div className="border-t border-gray-600 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Subtotal:</span>
                        <span className="text-white font-medium">R$ {getTotalAsNumber(selectedRegistration.baseTotal).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {/* Desconto (PIX à vista) */}
                  {selectedRegistration.discountAmount && getTotalAsNumber(selectedRegistration.discountAmount) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-400">
                        Desconto PIX sem taxa do sistema ({selectedRegistration.feePercentage}%):
                      </span>
                      <span className="text-green-400">-R$ {getTotalAsNumber(selectedRegistration.discountAmount).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Taxa (PIX parcelado/Cartão) */}
                  {selectedRegistration.feeAmount && getTotalAsNumber(selectedRegistration.feeAmount) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">
                        Taxa do sistema ({selectedRegistration.feePercentage}%):
                      </span>
                      <span className="text-red-400">+R$ {getTotalAsNumber(selectedRegistration.feeAmount).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Divisória Final */}
                  <div className="border-t border-gray-600 my-2"></div>

                  {/* Total Final */}
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">Valor final:</span>
                    <span className="text-white font-bold text-xl">R$ {getTotalAsNumber(selectedRegistration.total).toFixed(2)}</span>
                  </div>

                  {/* Valor por parcela (se parcelado) */}
                  {selectedRegistration.installments > 1 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        {selectedRegistration.installments}x de:
                      </span>
                      <span className="text-gray-300">
                        R$ {(getTotalAsNumber(selectedRegistration.total) / selectedRegistration.installments).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700 mt-4">
                <div>
                  <label className="text-sm text-gray-400">Data de Inscrição</label>
                  <p className="text-white">
                    {format(new Date(selectedRegistration.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Editar Inscrição</DialogTitle>
          </DialogHeader>
          {editingRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Nome Completo</label>
                  <Input
                    value={editingRegistration.fullName}
                    onChange={(e) => setEditingRegistration({...editingRegistration, fullName: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <Input
                    value={editingRegistration.email}
                    onChange={(e) => setEditingRegistration({...editingRegistration, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">WhatsApp</label>
                  <Input
                    value={editingRegistration.whatsapp}
                    onChange={(e) => setEditingRegistration({...editingRegistration, whatsapp: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Total</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={getTotalAsNumber(editingRegistration.total)}
                    onChange={(e) => setEditingRegistration({...editingRegistration, total: parseFloat(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-neon-purple hover:bg-neon-purple/80"
                  onClick={async () => {
                    if (!editingRegistration) return;

                    try {
                      await apiClient.updateRegistration(editingRegistration.id, {
                        fullName: editingRegistration.fullName,
                        email: editingRegistration.email,
                        whatsapp: editingRegistration.whatsapp,
                        total: getTotalAsNumber(editingRegistration.total)
                      });

                      toast({
                        title: 'Sucesso',
                        description: 'Inscrição atualizada com sucesso',
                        variant: 'default'
                      });
                      setIsEditDialogOpen(false);
                      await loadRegistrations();
                    } catch (error) {
                      console.error('Erro ao atualizar inscrição:', error);
                      toast({
                        title: 'Erro',
                        description: 'Não foi possível atualizar a inscrição',
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationsView;