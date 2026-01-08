import { TrendingUp, Activity, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchStats } from '../services/api';

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

export function HeroStats() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    healthyAssets: 0,
    depreciation: 0,
    upcomingCalibrations: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-cyan-400 to-blue-500"
          delay={0}
        />
        <StatCard
          title="Healthy Assets"
          value={stats.healthyAssets}
          suffix="%"
          icon={<Activity className="w-6 h-6" />}
          gradient="from-green-400 to-emerald-500"
          delay={100}
        />
        <StatCard
          title="Depreciation"
          value={stats.depreciation}
          suffix="%"
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-purple-400 to-pink-500"
          delay={200}
        />
        <StatCard
          title="Upcoming Calibrations"
          value={stats.upcomingCalibrations}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-orange-400 to-red-500"
          delay={300}
        />
      </div>
    </div>
  );
}
