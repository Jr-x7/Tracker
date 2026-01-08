import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { POC } from '../types';
import { POCCard, AddPOCCard } from './POCCard';
import { fetchPOCs } from '../services/api';
import { EditPOCModal } from './EditPOCModal';
import { useAuth } from '../context/AuthContext';

export function POCTab() {
  const { user } = useAuth();
  const [pocs, setPocs] = useState<POC[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const loadPOCs = async () => {
      try {
        const data = await fetchPOCs();
        setPocs(data);
      } catch (error) {
        console.error('Failed to load POCs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPOCs();
  }, [refreshTrigger]);

  const exportData = () => {
    const dataStr = JSON.stringify(pocs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pocs-export.json';
    link.click();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading POCs...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Proof of Concepts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {pocs.length} POCs in development
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
          </button>

          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/30"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {pocs.map((poc) => (
          <POCCard key={poc.id} poc={poc} onUpdate={refreshData} />
        ))}
        {user?.role === 'admin' && <AddPOCCard onClick={() => setIsCreateModalOpen(true)} />}
      </div>

      <EditPOCModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUpdate={refreshData}
      />
    </div>
  );
}
