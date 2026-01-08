import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { Software } from '../types';
import { SoftwareCard, AddSoftwareCard } from './SoftwareCard';
import { fetchSoftware } from '../services/api';
import { EditAssetModal } from './EditAssetModal';
import { useAuth } from '../context/AuthContext';

export function SoftwareTab() {
  const { user } = useAuth();
  const [software, setSoftware] = useState<Software[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const loadSoftware = async () => {
      try {
        const data = await fetchSoftware();
        setSoftware(data);
      } catch (error) {
        console.error('Failed to load software:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSoftware();
  }, [refreshTrigger]);

  const exportData = () => {
    const dataStr = JSON.stringify(software, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'software-export.json';
    link.click();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading software...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Applications & Software
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {software.length} licenses tracked
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-400 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
          </button>

          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/30"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {software.map((item) => (
          <SoftwareCard key={item.id} software={item} onUpdate={refreshData} />
        ))}
        {user?.role === 'admin' && <AddSoftwareCard onClick={() => setIsCreateModalOpen(true)} />}
      </div>

      <EditAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUpdate={refreshData}
        type="software"
      />
    </div>
  );
}
