import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import { CheckCircle, Plane, CreditCard, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PIX_EMAIL } from '@/lib/site-config';

interface PrimeirinhoConfirmationProps {
  leadUuid: string;
  onConfirmationSubmit: (data: any) => void;
}

const PrimeirinhoConfirmation = ({ leadUuid, onConfirmationSubmit }: PrimeirinhoConfirmationProps) => {
  const [selectedOption, setSelectedOption] = useState<'passagem' | 'pagamento' | null>(null);
  const [passagemData, setPassagemData] = useState({
    passagemConfirmada: false,
    naoDesistirConfirmado: false,
    comprovantePassagem: ''
  });
  const [pagamentoData, setPagamentoData] = useState({
    pixPago: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePassagemSubmit = async () => {
    if (!passagemData.passagemConfirmada || !passagemData.naoDesistirConfirmado) {
      toast.error('Você deve confirmar todas as opções');
      return;
    }

    if (!passagemData.comprovantePassagem) {
      toast.error('Você deve anexar o comprovante de passagem');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmationSubmit({
        option: 'passagem',
        ...passagemData,
        dataConfirmacao: new Date().toISOString()
      });
      toast.success('Confirmação enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar confirmação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePagamentoSubmit = async () => {
    if (!pagamentoData.pixPago) {
      toast.error('Você deve marcar que já fez o PIX');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmationSubmit({
        option: 'pagamento',
        ...pagamentoData,
        dataConfirmacao: new Date().toISOString()
      });
      toast.success('Confirmação enviada com sucesso!');
      // O status será alterado para 'confirmed' automaticamente
      // e a página será redirecionada para mostrar PrimeirinhoConfirmed
    } catch (error) {
      toast.error('Erro ao enviar confirmação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedOption) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Aprovamos! Mas calma...
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Antes de comemorar, queremos confirmar se você vem mesmo
              <span className="text-cyan-400 font-medium"> (pra não tomar a vaga de ninguém)</span>.
            </p>
          </div>

          {/* Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-cyan-400">Opção Gratuita</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Você ganha o pacote totalmente gratuito e basta provar que já está de malas prontas.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h3 className="text-lg font-semibold text-green-400">Opção Paga</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Você paga apenas R$90 para garantir sua vaga. É uma forma de confirmarmos que você vem.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opção 1 - Passagem */}
            <button
              onClick={() => setSelectedOption('passagem')}
              className="group bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Eu garanto que vou</h3>
                <p className="text-cyan-100 text-lg mb-4">
                  e posso mostrar minha passagem aérea (ou de ônibus)
                </p>
                <div className="inline-flex items-center text-sm font-medium bg-white/20 px-4 py-2 rounded-full">
                  <span className="mr-2">✓</span>
                  Opção Gratuita
                </div>
              </div>
            </button>

            {/* Opção 2 - Pagamento */}
            <button
              onClick={() => setSelectedOption('pagamento')}
              className="group bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Eu quero pagar</h3>
                <p className="text-green-100 text-lg mb-4">
                  para bloquear minha vaga
                </p>
                <div className="inline-flex items-center text-sm font-medium bg-white/20 px-4 py-2 rounded-full">
                  <span className="mr-2">R$</span>
                  <span className="text-2xl font-bold">90</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOption === 'passagem') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Confirmação de Passagem
            </h1>
            <p className="text-gray-300 text-lg">
              Prove que você já está de malas prontas!
            </p>
          </div>

          {/* Form */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="space-y-6">
              {/* Checkbox 1 */}
              <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-xl">
                <Checkbox
                  id="passagem-confirmada"
                  checked={passagemData.passagemConfirmada}
                  onCheckedChange={(checked) =>
                    setPassagemData(prev => ({ ...prev, passagemConfirmada: !!checked }))
                  }
                  className="mt-1"
                />
                <label htmlFor="passagem-confirmada" className="text-white text-lg leading-relaxed cursor-pointer flex-1">
                  <span className="font-semibold text-cyan-400">✓</span> Confirmo que já comprei minhas passagens
                </label>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-xl">
                <Checkbox
                  id="nao-desistir"
                  checked={passagemData.naoDesistirConfirmado}
                  onCheckedChange={(checked) =>
                    setPassagemData(prev => ({ ...prev, naoDesistirConfirmado: !!checked }))
                  }
                  className="mt-1"
                />
                <label htmlFor="nao-desistir" className="text-white text-lg leading-relaxed cursor-pointer flex-1">
                  <span className="font-semibold text-cyan-400">✓</span> Confirmo que não tenho intenção de desistir do ingresso que ganhei e sei que estaria tirando o lugar de outra pessoa
                </label>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  Anexar Comprovante
                </h3>
                <p className="text-gray-400 text-sm">
                  Anexe o comprovante da sua passagem (aérea ou ônibus)
                </p>
                <FileUpload
                  label="Selecione o comprovante"
                  value={passagemData.comprovantePassagem}
                  onChange={(url) => setPassagemData(prev => ({ ...prev, comprovantePassagem: url }))}
                  folder="comprovantes-passagem"
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => setSelectedOption(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handlePassagemSubmit}
                disabled={isSubmitting || !passagemData.passagemConfirmada || !passagemData.naoDesistirConfirmado || !passagemData.comprovantePassagem}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOption === 'pagamento') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Confirmação de Pagamento
            </h1>
            <p className="text-gray-300 text-lg">
              Pague apenas R$90 para garantir sua vaga!
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-6">
            <div className="text-center space-y-6">
              <div className="text-2xl text-white">
                Faça o PIX de
                <span className="text-4xl font-bold text-green-400 mx-2">R$90</span>
                para:
              </div>

              <div className="bg-gray-900 border-2 border-green-500/50 rounded-xl p-6">
                <div className="text-2xl font-mono font-bold text-green-400 break-all">
                  {PIX_EMAIL}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Chave PIX (e-mail)
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 font-medium">
                  💡 <strong>Dica:</strong> Após fazer o PIX, marque a opção abaixo para confirmar
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-xl">
              <Checkbox
                id="pix-pago"
                checked={pagamentoData.pixPago}
                onCheckedChange={(checked) =>
                  setPagamentoData(prev => ({ ...prev, pixPago: !!checked }))
                }
                className="mt-1"
              />
              <label htmlFor="pix-pago" className="text-white text-lg leading-relaxed cursor-pointer flex-1">
                <span className="font-semibold text-green-400">✓</span> Marque aqui se já tiver feito o PIX
              </label>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => setSelectedOption(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handlePagamentoSubmit}
                disabled={isSubmitting || !pagamentoData.pixPago}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'CONFIRMAR QUE JÁ FIZ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PrimeirinhoConfirmation;
