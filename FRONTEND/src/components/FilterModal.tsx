import { X, Search, Filter as FilterIcon } from 'lucide-react';
import { useState } from 'react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    availableFilters?: {
        categories: string[];
        locations: string[];
        statuses: string[];
        owners: string[];
    };
}

export interface FilterState {
    search: string;
    healthStatus: string;
    status: string;
    category: string;
    location: string;
    ownedBy: string;
}

export const initialFilterState: FilterState = {
    search: '',
    healthStatus: 'all',
    status: 'all',
    category: 'all',
    location: 'all',
    ownedBy: 'all'
};

export function FilterModal({ isOpen, onClose, filters, onFilterChange, availableFilters }: FilterModalProps) {
    if (!isOpen) return null;

    const handleChange = (key: keyof FilterState, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
        k !== 'search' && v !== 'all'
    ).length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                                <FilterIcon className="w-5 h-5" />
                            </div>
                            Filter Assets
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Refine your view with specific criteria
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Global Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, tag, or description..."
                                value={filters.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                className="w-full pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Health */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Health Status</label>
                            <select
                                value={filters.healthStatus}
                                onChange={(e) => handleChange('healthStatus', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                            >
                                <option value="all">Any Health</option>
                                <option value="healthy">Healthy</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Lifecycle Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                            >
                                <option value="all">Any Status</option>
                                <option value="active">Active</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                            >
                                <option value="all">All Locations</option>
                                {availableFilters?.locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                            >
                                <option value="all">All Categories</option>
                                {availableFilters?.categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Owned By */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Owner</label>
                            <select
                                value={filters.ownedBy}
                                onChange={(e) => handleChange('ownedBy', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                            >
                                <option value="all">All Owners</option>
                                {availableFilters?.owners.map(owner => (
                                    <option key={owner} value={owner}>{owner}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => onFilterChange(initialFilterState)}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Clear all filters
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-[1.02]"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
