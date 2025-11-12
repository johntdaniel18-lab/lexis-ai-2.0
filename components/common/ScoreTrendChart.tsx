import React, { useMemo } from 'react';
import { CompletedTest } from '../../types';

interface ScoreTrendChartProps {
  completedTests: CompletedTest[];
}

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ completedTests }) => {
  const data = useMemo(() => {
    if (completedTests.length < 2) return [];
    return completedTests
      .sort((a, b) => new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime())
      .map(test => ({
        date: new Date(test.completionDate),
        score: test.feedback.overallScore,
      }));
  }, [completedTests]);

  if (data.length < 2) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Score Trend</h3>
        <div className="flex-grow flex items-center justify-center text-center text-slate-400">
          <p>Complete at least two tests to see your progress chart.</p>
        </div>
      </div>
    );
  }

  const width = 500;
  const height = 250;
  const padding = 40;

  const minScore = 4;
  const maxScore = 9;
  const scoreRange = maxScore - minScore;

  const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
  const getY = (score: number) => height - padding - ((score - minScore) / scoreRange) * (height - 2 * padding);

  const path = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.score)}`).join(' ');

  const yAxisLabels = [4.0, 5.0, 6.0, 7.0, 8.0, 9.0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Score Trend</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-Axis Grid Lines and Labels */}
        {yAxisLabels.map(score => (
          <g key={score}>
            <line
              x1={padding}
              y1={getY(score)}
              x2={width - padding}
              y2={getY(score)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={getY(score) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {score.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X-Axis Labels */}
        {data.map((point, i) => (
           (data.length < 10 || i === 0 || i === data.length - 1 || i % 2 === 0) &&
          <text
            key={i}
            x={getX(i)}
            y={height - padding + 15}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
          >
            {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {/* Main Line */}
        <path d={path} fill="none" stroke="#f97316" strokeWidth="2" />

        {/* Data Points */}
        {data.map((point, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(point.score)}
            r="3"
            fill="#f97316"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
};

export default ScoreTrendChart;