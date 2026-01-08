
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { SITE_NAME } from '@/lib/site-config';

const PainelLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.login(email, password);

      if (response.success) {
        localStorage.setItem('painelAuth', 'true');
        localStorage.setItem('painelUser', JSON.stringify(response.user));
        navigate('/painel');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-painel min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-50">
            Painel {SITE_NAME}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
                required
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PainelLogin;
