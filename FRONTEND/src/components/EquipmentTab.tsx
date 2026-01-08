import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { EquipmentCard, AddEquipmentCard } from './EquipmentCard';
import { Equipment } from '../types';
import { EditAssetModal } from './EditAssetModal';
import { FilterModal, FilterState, initialFilterState } from './FilterModal';

interface EquipmentTabProps {
  equipment: Equipment[];
  onAdd?: () => void;
  onUpdate: () => void;
}

export function EquipmentTab({ equipment, onUpdate }: EquipmentTabProps) {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const handleAdd = () => {
    setSelectedEquipment(null);
    setIsEditModalOpen(true);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Extract available filter options dynamically
  const availableFilters = useMemo(() => {
    const locations = Array.from(new Set(equipment.map(e => e.location).filter(Boolean) as string[]));
    const categories = Array.from(new Set(equipment.map(e => e.modelCategory || e.category).filter(Boolean) as string[]));
    const statuses = ['active', 'maintenance', 'retired'];
    const owners = Array.from(new Set(equipment.map(e => e.ownedBy).filter(Boolean) as string[]));

    return { locations, categories, statuses, owners };
  }, [equipment]);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.assetTag?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.assignedTo?.name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesHealth = filters.healthStatus === 'all' || item.healthStatus === filters.healthStatus;

    const matchesStatus = filters.status === 'all' || item.status === filters.status || item.lifecycleStageStatus === filters.status;

    const matchesLocation = filters.location === 'all' || item.location === filters.location;
    const matchesCategory = filters.category === 'all' ||
      item.category === filters.category ||
      item.modelCategory === filters.category;
    const matchesOwner = filters.ownedBy === 'all' || item.ownedBy === filters.ownedBy;

    return matchesSearch && matchesHealth && matchesStatus && matchesLocation && matchesCategory && matchesOwner;
  });

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== 'all').length;

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    onUpdate();
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage and track hardware assets</p>
        </div>
        <div className="flex gap-3">
          <button
            ref={filterButtonRef}
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
        triggerRef={filterButtonRef}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddEquipmentCard onClick={handleAdd} />
        {filteredEquipment.map((item) => (
          <EquipmentCard
            key={item.id}
            equipment={item}
            onUpdate={onUpdate}
            onEdit={() => handleEdit(item)}
          />
        ))}
      </div>

      {isEditModalOpen && (
        <EditAssetModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleSuccess}
          asset={selectedEquipment || undefined}
          type="equipment"
        />
      )}
    </div>
  );
}
