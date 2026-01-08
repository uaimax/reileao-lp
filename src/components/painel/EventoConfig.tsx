
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EventoConfig = () => {
  const [dataInicio, setDataInicio] = useState('2025-09-05T14:00');
  const [dataFim, setDataFim] = useState('2025-09-07T18:00');
  const [videoFundo, setVideoFundo] = useState('https://youtu.be/U2QPiVaMAVc');
  const [videoLocal, setVideoLocal] = useState('https://youtu.be/sDHDoiNoMjU');
  const [linkCTA, setLinkCTA] = useState('https://uaizouk.com.br/inscricoes');
  const { toast } = useToast();

  const handleSave = () => {
    // Aqui salvaria no banco de dados
    console.log('Salvando configurações:', { 
      dataInicio, 
      dataFim, 
      videoFundo, 
      videoLocal, 
      linkCTA 
    });
    toast({
      title: "Configurações salvas!",
      description: "As alterações foram aplicadas com sucesso.",
    });
  };

  return (
    <Card className="glass-effect border-neon-purple/30">
      <CardHeader>
        <CardTitle className="text-xl text-soft-white">
          Configurações do Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dataInicio" className="text-soft-white">
              Data e Horário de Início
            </Label>
            <Input
              id="dataInicio"
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
            />
            <p className="text-text-gray text-sm">
              Data e horário de início do evento
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataFim" className="text-soft-white">
              Data e Horário de Fim
            </Label>
            <Input
              id="dataFim"
              type="datetime-local"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
            />
            <p className="text-text-gray text-sm">
              Data e horário de fim do evento
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoFundo" className="text-soft-white">
            Vídeo de Fundo do Hero (YouTube)
          </Label>
          <Input
            id="videoFundo"
            type="url"
            value={videoFundo}
            onChange={(e) => setVideoFundo(e.target.value)}
            placeholder="https://youtu.be/..."
            className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
          />
          <p className="text-text-gray text-sm">
            Link do YouTube que será exibido como vídeo de fundo na seção hero
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoLocal" className="text-soft-white">
            Vídeo do Local (YouTube)
          </Label>
          <Input
            id="videoLocal"
            type="url"
            value={videoLocal}
            onChange={(e) => setVideoLocal(e.target.value)}
            placeholder="https://youtu.be/..."
            className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
          />
          <p className="text-text-gray text-sm">
            Link do YouTube que será exibido na seção da cidade
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkCTA" className="text-soft-white">
            Link do CTA "QUERO PARTICIPAR"
          </Label>
          <Input
            id="linkCTA"
            type="url"
            value={linkCTA}
            onChange={(e) => setLinkCTA(e.target.value)}
            placeholder="https://..."
            className="bg-dark-bg/50 border-neon-purple/30 text-soft-white"
          />
          <p className="text-text-gray text-sm">
            Link que será usado no botão "QUERO PARTICIPAR" da página principal
          </p>
        </div>

        <Button onClick={handleSave} className="btn-neon">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventoConfig;
