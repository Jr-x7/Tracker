import { TrendingUp, Activity, DollarSign, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, suffix = '', icon, gradient, delay = 0 }: StatCardProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-cyan-500/20
      hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-500
      hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-400/20
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transition: 'all 0.6s ease-out' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-pulse`} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {count}
            </span>
            {suffix && (
              <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                {suffix}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-600 dark:text-green-400 font-medium">+12.5%</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
        </div>
      </div>

      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
    </div>
  );
}

interface HeroStatsProps {
  activeTab: 'equipment' | 'software' | 'pocs';
  equipment: any[];
  software: any[];
  pocs: any[];
}

export function HeroStats({ activeTab, equipment, software, pocs }: HeroStatsProps) {
  const calculateStats = () => {
    let data: any[] = [];
    let labels = {
      total: 'Total Assets',
      healthy: 'Healthy Assets',
      depreciation: 'Depreciation',
      upcoming: 'Upcoming Calibrations'
    };

    switch (activeTab) {
      case 'equipment':
        data = equipment;
        labels = {
          total: 'Total Equipment',
          healthy: 'Healthy Equipment',
          depreciation: 'Avg Depreciation',
          upcoming: 'Upcoming Calibrations'
        };
        break;
      case 'software':
        data = software;
        labels = {
          total: 'Total Applications',
          healthy: 'Active Licenses',
          depreciation: 'Avg Depreciation',
          upcoming: 'License Renewals'
        };
        break;
      case 'pocs':
        data = pocs;
        labels = {
          total: 'Total POCs',
          healthy: 'Active POCs',
          depreciation: 'Avg Progress',
          upcoming: 'Pending Reviews'
        };
        break;
    }

    const totalAssets = data.length;
    const healthyCount = data.filter(item => item.healthStatus === 'healthy' || item.status === 'active').length;
    const healthyPercentage = totalAssets > 0 ? Math.round((healthyCount / totalAssets) * 100) : 0;

    const avgDepreciation = totalAssets > 0
      ? Math.round(data.reduce((sum, item) => sum + (item.depreciation || 0), 0) / totalAssets)
      : 0;

    const upcomingCount = data.filter(item => {
      if (!item.nextCalibration) return false;
      const daysUntil = Math.ceil((new Date(item.nextCalibration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    }).length;

    return {
      totalAssets,
      healthyAssets: healthyPercentage,
      depreciation: avgDepreciation,
      upcomingCalibrations: upcomingCount,
      labels
    };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={stats.labels.total}
          value={stats.totalAssets}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-cyan-400 to-blue-500"
          delay={0}
        />
        <StatCard
          title={stats.labels.healthy}
          value={stats.healthyAssets}
          suffix="%"
          icon={<Activity className="w-6 h-6" />}
          gradient="from-green-400 to-emerald-500"
          delay={100}
        />
        <StatCard
          title={stats.labels.depreciation}
          value={stats.depreciation}
          suffix="%"
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-purple-400 to-pink-500"
          delay={200}
        />
        <StatCard
          title={stats.labels.upcoming}
          value={stats.upcomingCalibrations}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-orange-400 to-red-500"
          delay={300}
        />
      </div>
    </div>
  );
}
