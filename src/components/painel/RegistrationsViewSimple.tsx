import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface Registration {
  id: number;
  fullName: string;
  email: string;
  total: string | number;
  paymentStatus?: string;
  createdAt: string;
}

const RegistrationsViewSimple = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.log('Carregando inscrições...');
      const data = await apiClient.getAllRegistrations() as Registration[];
      console.log('Dados recebidos:', data);
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Inscrições</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando inscrições...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Inscrições</h1>
        <Button onClick={loadRegistrations} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      <div className="space-y-4">
        {registrations.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma inscrição encontrada</h3>
              <p className="text-gray-400">Ainda não há inscrições para este evento</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => (
            <Card key={registration.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{registration.fullName}</h3>
                    <p className="text-gray-400">{registration.email}</p>
                    <p className="text-gray-300">R$ {getTotalAsNumber(registration.total).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Status: {registration.paymentStatus || 'pending'}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(registration.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">{registrations.length}</div>
                <div className="text-sm text-gray-400">Total</div>
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
      </div>
    </div>
  );
};

export default RegistrationsViewSimple;

