import { CheckCircle } from 'lucide-react';

interface StepperProps {
  steps: Array<{ id: string; label: string }>;
  currentStep: string;
  completedSteps: Set<string>;
}

const Stepper = ({ steps, currentStep, completedSteps }: StepperProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center relative">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.has(step.id);
          const isPending = !isActive && !isCompleted;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-green-500 text-white border-2 border-green-500'
                        : isActive
                        ? 'bg-yellow-500 text-slate-900 border-2 border-yellow-500 shadow-md scale-110'
                        : 'bg-slate-200 text-slate-500 border-2 border-slate-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-[80px]
                    ${
                      isActive
                        ? 'text-slate-900 font-semibold'
                        : isCompleted
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-16 md:w-24 h-0.5 mx-2 transition-all duration-300
                    ${
                      completedSteps.has(steps[index + 1]?.id) || isCompleted
                        ? 'bg-green-500'
                        : 'bg-slate-300'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

