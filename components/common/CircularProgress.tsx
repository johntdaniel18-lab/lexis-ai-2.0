import React from 'react';

interface CircularProgressProps {
  score: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ score, total, size = 52, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (score / total) : 0;
  const offset = circumference - progress * circumference;

  const getStrokeColor = () => {
    if (progress >= 0.8) return 'text-emerald-500';
    if (progress >= 0.5) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute" width={size} height={size}>
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${getStrokeColor()} transition-all duration-500`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center">
         <span className="text-sm font-bold text-slate-800 leading-none">{score}</span>
         <span className="text-[10px] text-slate-400 font-bold leading-none border-t border-slate-300 px-1">
           {total}
         </span>
      </div>
    </div>
  );
};

export default CircularProgress;