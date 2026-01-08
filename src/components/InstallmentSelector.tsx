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
      <label className="block text-sm font-medium text-slate-700">
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
                  ? "border-yellow-500 bg-yellow-50 text-yellow-600"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              )}
            >
              <div className="text-sm font-bold">
                {num}x
              </div>
              <div className="text-xs text-slate-500">
                R$ {installmentValue.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Escolha o número de parcelas (máximo {maxInstallments}x)
      </p>
    </div>
  );
};
