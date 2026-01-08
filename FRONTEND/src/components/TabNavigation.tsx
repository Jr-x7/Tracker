import { Monitor, AppWindow, FlaskConical } from 'lucide-react';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  gradient: string;
}

function TabButton({ icon, label, isActive, onClick, gradient }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300
        ${isActive
          ? `bg-gradient-to-br ${gradient} text-white shadow-lg shadow-cyan-500/40 dark:shadow-cyan-400/30 scale-105`
          : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105'
        }
        border ${isActive ? 'border-transparent' : 'border-gray-200/50 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-500'}
        backdrop-blur-xl
      `}
    >
      <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-semibold text-sm sm:text-base">{label}</span>

      {isActive && (
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-50 blur-xl -z-10 animate-pulse`} />
      )}

      {!isActive && (
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
      )}
    </button>
  );
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
        <TabButton
          icon={<Monitor className="w-5 h-5" />}
          label="Equipment"
          isActive={activeTab === 'equipment'}
          onClick={() => onTabChange('equipment')}
          gradient="from-cyan-400 via-blue-500 to-blue-600"
        />
        <TabButton
          icon={<AppWindow className="w-5 h-5" />}
          label="Applications & Software"
          isActive={activeTab === 'software'}
          onClick={() => onTabChange('software')}
          gradient="from-purple-400 via-purple-500 to-pink-500"
        />
        <TabButton
          icon={<FlaskConical className="w-5 h-5" />}
          label="Proof of Concepts"
          isActive={activeTab === 'pocs'}
          onClick={() => onTabChange('pocs')}
          gradient="from-green-400 via-emerald-500 to-teal-500"
        />
      </div>
    </div>
  );
}
