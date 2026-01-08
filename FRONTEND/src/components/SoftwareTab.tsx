import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { SoftwareCard, AddSoftwareCard } from './SoftwareCard';
import { Software } from '../types';
import { EditAssetModal } from './EditAssetModal';
import { FilterModal, FilterState, initialFilterState } from './FilterModal';
import { useAuth } from '../context/AuthContext';

interface SoftwareTabProps {
  software: Software[];
  onAdd?: () => void;
  onUpdate: () => void;
}

export function SoftwareTab({ software, onUpdate }: SoftwareTabProps) {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);

  const handleAdd = () => {
    setSelectedSoftware(null);
    setIsEditModalOpen(true);
  };
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Extract available filter options dynamically
  const availableFilters = useMemo(() => {
    const locations: string[] = [];
    const categories: string[] = [];
    // Software specific statuses can be derived from healthStatus for now since 'status' field is missing in type
    const statuses = ['active', 'expired', 'retired'];
    const owners: string[] = [];

    return { locations, categories, statuses, owners };
  }, [software]);

  const filteredSoftware = software.filter(item => {
    const matchesSearch = !filters.search ||
      item.name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesHealth = filters.healthStatus === 'all' || item.healthStatus === filters.healthStatus;

    // Fallback status logic since 'status' field is missing in Software interface
    // We can treat 'healthy' as 'active' for basic filtering if needed, or just ignore status filter for now
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && item.healthStatus === 'healthy') ||
      (filters.status === 'retired' && item.healthStatus === 'warning'); // Example mapping

    return matchesSearch && matchesHealth && matchesStatus;
  });

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'all').length;


  const handleEdit = (item: Software) => {
    setSelectedSoftware(item);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedSoftware(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    onUpdate();
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Software</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage software licenses and subscriptions</p>
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`p-2 rounded-xl border transition-all relative ${activeFilterCount > 0
            ? 'bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-400'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
            }`}>
          <Filter className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddSoftwareCard onClick={handleAdd} />
        {filteredSoftware.map((item) => (
          <SoftwareCard key={item.id} software={item} onUpdate={onUpdate} />
        ))}
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        availableFilters={availableFilters}
      />

      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleSuccess}
        asset={selectedSoftware}
        type="software"
      />
    </div>
  );
}
