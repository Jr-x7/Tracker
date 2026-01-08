import { FilterModal, FilterState, initialFilterState } from './FilterModal';

// ... inside component ...
const [filters, setFilters] = useState<FilterState>(initialFilterState);
const [isFilterOpen, setIsFilterOpen] = useState(false);

// ... loadSoftware ...

const filteredSoftware = software.filter(item => {
  const matchesSearch = !filters.search ||
    item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    item.licenseKey?.toLowerCase().includes(filters.search.toLowerCase());

  const matchesHealth = filters.healthStatus === 'all' || item.healthStatus === filters.healthStatus;
  // Software status uses same 'active' | 'expired' (mapped to maintenance/retired logic if needed, or simple check)
  const matchesStatus = filters.status === 'all' ||
    (filters.status === 'active' && item.status === 'active') ||
    (filters.status === 'retired' && item.status === 'expired');

  return matchesSearch && matchesHealth && matchesStatus;
});

  // ... return JSX ...
        <button 
           onClick={() => setIsFilterOpen(true)}
           className="relative flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-400 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
             {(filters.search || filters.healthStatus !== 'all' || filters.status !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-purple-500 absolute top-2 right-2" />
            )}
        </button>

  // ... Grid uses filteredSoftware ...
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSoftware.map((item) => (
          <SoftwareCard key={item.id} software={item} onUpdate={refreshData} />
        ))}
        {user?.role === 'admin' && <AddSoftwareCard onClick={() => setIsCreateModalOpen(true)} />}
      </div>

{/* Modals */ }
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters} 
        onFilterChange={setFilters} 
      />

      <EditAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUpdate={refreshData}
        type="software"
      />
