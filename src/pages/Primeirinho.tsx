import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SITE_NAME, getSiteNameWithYear } from '@/lib/site-config';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const Primeirinho = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    estado: '',
    cidade: '',
    aceitaTermos: false
  });
  const [cidades, setCidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleEstadoChange = async (estado: string) => {
    setFormData(prev => ({ ...prev, estado, cidade: '' }));
    if (estado) {
      try {
        const response = await apiClient.getCidades(estado);
        setCidades(response);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        toast.error('Erro ao carregar cidades');
      }
    } else {
      setCidades([]);
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.createPrimeirinhoLead(formData);
      navigate(`/primeirinho/2026/${response.uuid}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar formulário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="section-container py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border-neon-purple/30">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold gradient-text neon-glow mb-4">
                PRIMEIRINHO
              </CardTitle>
              <CardDescription className="text-xl text-neon-cyan">
                Você pode ganhar o FULL PASS do {SITE_NAME} na hora! Sem sorteio!
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="space-y-4">
                <p className="text-soft-white text-lg">
                  É simples, queremos contar com um representante de cada cidade, sendo assim você precisa:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                    <span className="text-soft-white">Nunca ter vindo no {SITE_NAME} ainda.</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                    <span className="text-soft-white">Ser de uma cidade que ainda não tivemos representante nos últimos anos</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-neon-purple/20 pt-8">
                <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                  Como descobrir?
                </h3>
                <p className="text-soft-white text-center mb-8">
                  Preencha o formulário abaixo:
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-soft-white">Nome completo:</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="bg-dark-bg border-neon-purple/50 text-soft-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-soft-white">E-mail:</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-dark-bg border-neon-purple/50 text-soft-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-soft-white">WhatsApp:</Label>
                    <Input
                      id="whatsapp"
                      type="text"
                      value={formData.whatsapp}
                      onChange={handleWhatsAppChange}
                      placeholder="(11) 99999-9999"
                      className="bg-dark-bg border-neon-purple/50 text-soft-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-soft-white">Selecione estado:</Label>
                    <Select value={formData.estado} onValueChange={handleEstadoChange}>
                      <SelectTrigger className="bg-dark-bg border-neon-purple/50 text-soft-white">
                        <SelectValue placeholder="Escolha seu estado" />
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
                    <Label className="text-soft-white">Selecione cidade:</Label>
                    <Select
                      value={formData.cidade}
                      onValueChange={(cidade) => setFormData(prev => ({ ...prev, cidade }))}
                      disabled={!formData.estado || cidades.length === 0}
                    >
                      <SelectTrigger className="bg-dark-bg border-neon-purple/50 text-soft-white">
                        <SelectValue placeholder={!formData.estado ? "Primeiro selecione o estado" : "Escolha sua cidade"} />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-bg border-neon-purple/50">
                        {cidades.map((cidade: any) => (
                          <SelectItem key={cidade.id} value={cidade.nome} className="text-soft-white">
                            {cidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="termos"
                      checked={formData.aceitaTermos}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aceitaTermos: !!checked }))}
                      className="border-neon-purple/50"
                    />
                    <Label htmlFor="termos" className="text-soft-white text-sm">
                      Aceito os{' '}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-neon-cyan hover:text-neon-cyan/80 underline cursor-pointer"
                          >
                            termos de participação
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-dark-bg border-neon-purple/50 text-soft-white max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-neon-cyan text-xl font-bold">
                              Termos de Participação - PRIMEIRINHO {getSiteNameWithYear('2026')}
                            </DialogTitle>
                            <DialogDescription className="text-text-gray">
                              Leia atentamente os termos antes de participar
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 text-sm leading-relaxed">
                            <p className="text-soft-white">
                              A premiação que chamamos de <strong className="text-neon-cyan">PRIMEIRINHO</strong> visa trazer pessoas de cidades que ainda não estão presentes no evento, no entanto é importante observar algumas regras:
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <span className="text-neon-cyan font-bold">1.</span>
                                <p className="text-soft-white">
                                  Você precisa ser a primeira pessoa a ter preenchido esse formulário, sendo que dificilmente existiria um empate porque temos o registro exato de hora, minuto, segundo e milésimo do final do preenchimento.
                                </p>
                              </div>

                              <div className="flex items-start space-x-3">
                                <span className="text-neon-cyan font-bold">2.</span>
                                <p className="text-soft-white">
                                  Após o preenchimento desse formulário, informaremos em <strong className="text-neon-cyan">10 de Agosto de 2026</strong> os vencedores diretamente no grupo do Whatsapp.
                                </p>
                              </div>

                              <div className="flex items-start space-x-3">
                                <span className="text-neon-cyan font-bold">3.</span>
                                <p className="text-soft-white">
                                  A premiação inclui apenas o pacote completo da inscrição principal, ou seja, todas as aulas e baladas de <strong className="text-neon-cyan">4 a 7 de Setembro de 2026</strong>, no entanto, não inclui hospedagem, alimentação e transporte.
                                </p>
                              </div>

                              <div className="flex items-start space-x-3">
                                <span className="text-neon-cyan font-bold">4.</span>
                                <p className="text-soft-white">
                                  Não contemplaremos participantes que já estiveram no {SITE_NAME} em outras ocasiões.
                                </p>
                              </div>

                              <div className="flex items-start space-x-3">
                                <span className="text-neon-cyan font-bold">5.</span>
                                <p className="text-soft-white">
                                  Relembro que não é um sorteio e nos reservamos ao direito de não premiar por nosso único e exclusivo critério.
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
                              <p className="text-neon-cyan font-semibold text-center">
                                Ao participar, você concorda com todos os termos acima.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={!formData.aceitaTermos || isLoading}
                    className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-purple/80 hover:to-neon-cyan/80 text-white font-bold py-3 text-lg"
                  >
                    {isLoading ? 'Enviando...' : 'ENVIAR AGORA!'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Primeirinho;
