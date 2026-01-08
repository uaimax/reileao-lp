import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  ShieldOff
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/users');
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserPassword) {
      setError('Email e senha são obrigatórios');
      return;
    }

    if (newUserPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      const response = await apiClient.post('/api/users', {
        email: newUserEmail,
        password: newUserPassword
      });

      setUsers(prev => [response as User, ...prev]);
      setNewUserEmail('');
      setNewUserPassword('');
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar usuário');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, {
        is_active: !isActive
      });

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isActive: response.isActive }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário ${userEmail}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-50">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-slate-50">Gestão de Usuários</h2>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-50">Criar Novo Usuário</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-50">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Digite o email do usuário"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-50">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Digite a senha (mín. 6 caracteres)"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 border-slate-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-50">Email</TableHead>
              <TableHead className="text-slate-50">Status</TableHead>
              <TableHead className="text-slate-50">Criado em</TableHead>
              <TableHead className="text-slate-50">Atualizado em</TableHead>
              <TableHead className="text-slate-50 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-slate-700">
                <TableCell className="text-slate-50 font-medium">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.isActive ? "default" : "secondary"}
                    className={user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                  >
                    {user.isActive ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-3 h-3 mr-1" />
                        Inativo
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {formatDate(user.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleUserStatus(user.id, user.isActive)}
                      className="data-[state=checked]:bg-yellow-500"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            Nenhum usuário encontrado
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-medium mb-1">Informações sobre Usuários</h3>
            <p className="text-slate-400 text-sm">
              • Usuários ativos podem fazer login no painel<br/>
              • Usuários inativos não conseguem acessar o sistema<br/>
              • Apenas usuários ativos recebem notificações<br/>
              • Não é possível deletar o próprio usuário
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManager;
