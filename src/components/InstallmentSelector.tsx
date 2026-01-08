import React from 'react';
import { cn } from '@/lib/utils';

interface InstallmentSelectorProps {
  value: number;
  onChange: (value: number) => void;
  maxInstallments: number;
  totalAmount: number;
  paymentMethod: 'pix_installment' | 'credit_card';
  className?: string;
}

export const InstallmentSelector: React.FC<InstallmentSelectorProps> = ({
  value,
  onChange,
  maxInstallments,
  totalAmount,
  paymentMethod,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-gray-300">
        Número de parcelas
      </label>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(num => {
          const installmentValue = totalAmount / num;
          const isSelected = value === num;

          return (
            <button
              key={num}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(num);
              }}
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200 text-center",
                "hover:scale-105 active:scale-95 cursor-pointer",
                isSelected
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50"
              )}
            >
              <div className="text-sm font-bold">
                {num}x
              </div>
              <div className="text-xs text-gray-400">
                R$ {installmentValue.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">
        Escolha o número de parcelas (máximo {maxInstallments}x)
      </p>
    </div>
  );
};
