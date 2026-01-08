import { Activity } from 'lucide-react';
import { HealthStatus } from '../types';

interface HealthBadgeProps {
  status: HealthStatus;
}

export function HealthBadge({ status }: HealthBadgeProps) {
  const config = {
    healthy: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-500/50',
      text: 'text-green-700 dark:text-green-400',
      label: 'Healthy',
      pulse: 'bg-green-500',
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-500/50',
      text: 'text-yellow-700 dark:text-yellow-400',
      label: 'Warning',
      pulse: 'bg-yellow-500',
    },
    critical: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-500/50',
      text: 'text-red-700 dark:text-red-400',
      label: 'Critical',
      pulse: 'bg-red-500',
    },
  };

  // Safe lookup with default
  const statusKey = config[status] ? status : 'healthy';
  const { bg, border, text, label, pulse } = config[statusKey];

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg ${bg} border ${border} backdrop-blur-sm transition-all duration-300`}>
      <div className="relative">
        <Activity className={`w-4 h-4 ${text}`} />
        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${pulse} rounded-full animate-ping`} />
        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${pulse} rounded-full`} />
      </div>
      <span className={`text-xs font-semibold ${text}`}>{label}</span>
    </div>
  );
}
