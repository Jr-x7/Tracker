import { useState, useMemo } from 'react';
import { Plus, Filter } from 'lucide-react';
import { POCCard, AddPOCCard } from './POCCard';
import { POC } from '../types';
import { EditPOCModal } from './EditPOCModal';
import { FilterModal, FilterState, initialFilterState } from './FilterModal';

interface POCTabProps {
  pocs: POC[];
  onAdd?: () => void;
  onUpdate: () => void;
}

export function POCTab({ pocs, onUpdate }: POCTabProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPOC, setSelectedPOC] = useState<POC | null>(null);

  const handleAdd = () => {
    setSelectedPOC(null);
    setIsEditModalOpen(true);
  };


  const availableFilters = useMemo(() => {
    // POCs don't rely have locations or owners in the same way, but we can map what we have
    const categories = Array.from(new Set(pocs.map(p => p.category).filter(Boolean) as string[]));
    // Hack: use 'locations' for something else or leave empty? Maybe use Primary POC as owner?
    const owners = Array.from(new Set(pocs.map(p => p.primaryPOC).filter(Boolean) as string[]));

    return {
      locations: [],
      categories,
      statuses: ['healthy', 'warning', 'critical'],
      owners
    };
  }, [pocs]);

  // ... loadPOCs ...

  const filteredPOCs = pocs.filter(item => {
    const matchesSearch = !filters.search ||
      item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.primaryPOC?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.secondaryPOC?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesHealth = filters.healthStatus === 'all' || item.status === filters.healthStatus;

    // Status filter - mapping generic statuses if possible, otherwise generic "all" check
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && item.status !== 'critical') ||
      (filters.status === 'retired' && item.status === 'critical'); // Approximation

    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesOwner = filters.ownedBy === 'all' || item.primaryPOC === filters.ownedBy;

    return matchesSearch && matchesHealth && matchesStatus && matchesCategory && matchesOwner;
  });

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'all').length;

  const handleEdit = (item: POC) => {
    setSelectedPOC(item);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedPOC(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    onUpdate();
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proof of Concepts</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage ongoing POCs and demos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`p-2 rounded-xl border transition-all relative ${activeFilterCount > 0
              ? 'bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
          >
            <Filter className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        availableFilters={availableFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddPOCCard onClick={handleAdd} />
        {filteredPOCs.map((item) => (
          <POCCard
            key={item.id}
            poc={item}
            onUpdate={onUpdate}
            onEdit={() => handleEdit(item)}
          />
        ))}
      </div>

      {isEditModalOpen && (
        <EditPOCModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleSuccess}
          poc={selectedPOC || undefined}
        />
      )}
    </div>
  );
}
