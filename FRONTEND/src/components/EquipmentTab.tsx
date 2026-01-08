import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { Equipment } from '../types';
import { EquipmentCard, AddEquipmentCard } from './EquipmentCard';
import { fetchEquipment } from '../services/api';
import { EditAssetModal } from './EditAssetModal';
import { useAuth } from '../context/AuthContext';

export function EquipmentTab() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await fetchEquipment();
        setEquipment(data);
      } catch (error) {
        console.error('Failed to load equipment:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEquipment();
  }, [refreshTrigger]);

  const exportData = () => {
    const dataStr = JSON.stringify(equipment, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equipment-export.json';
    link.click();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading equipment...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Equipment Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {equipment.length} items tracked
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-400 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
          </button>

          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/30"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <EquipmentCard key={item.id} equipment={item} onUpdate={refreshData} />
        ))}
        {user?.role === 'admin' && <AddEquipmentCard onClick={() => setIsCreateModalOpen(true)} />}
      </div>

      <EditAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUpdate={refreshData}
        type="equipment"
      />
    </div>
  );
}
