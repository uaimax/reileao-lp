interface ProgressBarProps {
  progress: number;
  label: string;
}

const ProgressBar = ({ progress, label }: ProgressBarProps) => {
  return (
    <div className="mb-2">
      <div className="bg-slate-200 rounded-full h-4 max-w-md mx-auto">
        <div
          className="bg-gradient-to-r from-yellow-400 to-yellow-vibrant h-4 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-text-secondary font-medium text-center mt-2">{progress}% {label}</p>
    </div>
  );
};

export default ProgressBar;

