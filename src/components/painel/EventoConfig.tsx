
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
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-slate-50">
          Configurações do Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dataInicio" className="text-slate-50">
              Data e Horário de Início
            </Label>
            <Input
              id="dataInicio"
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
            <p className="text-slate-400 text-sm">
              Data e horário de início do evento
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataFim" className="text-slate-50">
              Data e Horário de Fim
            </Label>
            <Input
              id="dataFim"
              type="datetime-local"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
            <p className="text-slate-400 text-sm">
              Data e horário de fim do evento
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoFundo" className="text-slate-50">
            Vídeo de Fundo do Hero (YouTube)
          </Label>
          <Input
            id="videoFundo"
            type="url"
            value={videoFundo}
            onChange={(e) => setVideoFundo(e.target.value)}
            placeholder="https://youtu.be/..."
            className="bg-slate-700 border-slate-600 text-slate-50"
          />
          <p className="text-slate-400 text-sm">
            Link do YouTube que será exibido como vídeo de fundo na seção hero
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoLocal" className="text-slate-50">
            Vídeo do Local (YouTube)
          </Label>
          <Input
            id="videoLocal"
            type="url"
            value={videoLocal}
            onChange={(e) => setVideoLocal(e.target.value)}
            placeholder="https://youtu.be/..."
            className="bg-slate-700 border-slate-600 text-slate-50"
          />
          <p className="text-slate-400 text-sm">
            Link do YouTube que será exibido na seção da cidade
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkCTA" className="text-slate-50">
            Link do CTA "QUERO PARTICIPAR"
          </Label>
          <Input
            id="linkCTA"
            type="url"
            value={linkCTA}
            onChange={(e) => setLinkCTA(e.target.value)}
            placeholder="https://..."
            className="bg-slate-700 border-slate-600 text-slate-50"
          />
          <p className="text-slate-400 text-sm">
            Link que será usado no botão "QUERO PARTICIPAR" da página principal
          </p>
        </div>

        <Button onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventoConfig;
