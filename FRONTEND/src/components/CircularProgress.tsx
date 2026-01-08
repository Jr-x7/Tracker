interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ value = 0, size = 60, strokeWidth = 4 }: CircularProgressProps) {
  // Ensure value is a valid number between 0 and 100
  const safeValue = typeof value === 'number' && !isNaN(value) ? Math.min(Math.max(value, 0), 100) : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const getGradientId = () => `gradient-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = getGradientId();

  const getColor = () => {
    if (safeValue < 30) return { from: '#10b981', to: '#059669' };
    if (safeValue < 60) return { from: '#f59e0b', to: '#d97706' };
    return { from: '#ef4444', to: '#dc2626' };
  };

  const colors = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold bg-gradient-to-br from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
          {Math.round(safeValue)}%
        </span>
      </div>
    </div>
  );
}
