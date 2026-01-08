import {
  Edit2,
  Trash2,
  Loader2,
  Tag as TagIcon,
  Plus
} from 'lucide-react';
import { Equipment } from '../types';
import { HealthBadge } from './HealthBadge';
import { CircularProgress } from './CircularProgress';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { EditAssetModal } from './EditAssetModal';

interface EquipmentCardProps {
  equipment: Equipment;
  onUpdate?: () => void;
  onEdit?: (trigger: HTMLElement) => void;
}

export function EquipmentCard({ equipment, onUpdate, onEdit }: EquipmentCardProps) {
  const { user } = useAuth();
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Removed
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // Toggle for extra info

  const daysUntilCalibration = Math.ceil(
    (new Date(equipment.nextCalibration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getUrgencyColor = () => {
    if (daysUntilCalibration <= 7) return 'from-red-500 to-pink-500';
    if (daysUntilCalibration <= 30) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/assets/${equipment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        onUpdate?.();
      } else {
        alert('Failed to delete equipment');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Error deleting equipment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-cyan-500/20
      hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-500
      hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-400/20
      cursor-default animate-fadeIn flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                {equipment.name}
              </h3>
              {equipment.category && (
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {equipment.category}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">
              {equipment.assetTag && (
                <span className="flex items-center gap-1">
                  <TagIcon className="w-3 h-3" /> {equipment.assetTag}
                </span>
              )}
              {equipment.modelNumber && <span>Mod: {equipment.modelNumber}</span>}
              {equipment.modelCategory && <span>Cat: {equipment.modelCategory}</span>}
            </div>

            <div className="flex items-center space-x-2">
              <HealthBadge status={equipment.healthStatus} />

              {/* Actions */}
              {user?.role === 'admin' && (
                <div className="flex items-center gap-1 opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const cardElement = (e.currentTarget.closest('.group') as HTMLElement);
                      onEdit?.(cardElement || e.currentTarget);
                    }}
                    className="p-1.5 hover:bg-cyan-500/10 rounded-full text-gray-400 hover:text-cyan-500 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4 shrink-0">
            <CircularProgress value={equipment.depreciation} size={60} strokeWidth={5} />
          </div>
        </div>

        {/* Core Info Grid */}
        <div className="space-y-3 mt-auto">
          {/* Assigned To */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-cyan-500/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {equipment.assignedTo?.name ? equipment.assignedTo.name.split(' ').map(n => n[0]).join('') : 'UA'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {equipment.assignedTo?.name || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Expandable Details Section */}
          <div className={`space-y-3 transition-all duration-300 ${showDetails ? 'opacity-100' : 'opacity-80'}`}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {equipment.location && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block" title={equipment.location}>{equipment.location}</span>
                </div>
              )}
              {equipment.lifecycleStage && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Stage</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.lifecycleStage}</span>
                </div>
              )}
              {equipment.lifecycleStageStatus && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Status Detail</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.lifecycleStageStatus}</span>
                </div>
              )}
              {equipment.costCenter && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Cost Center</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.costCenter}</span>
                </div>
              )}
              {equipment.department && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Department</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.department}</span>
                </div>
              )}
              {equipment.ownedBy && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Owned By</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.ownedBy}</span>
                </div>
              )}
              {equipment.warrantyExpiration && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Warranty Exp</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.warrantyExpiration}</span>
                </div>
              )}
              {equipment.serialNumber && (
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-gray-500 block">Serial #</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate block">{equipment.serialNumber}</span>
                </div>
              )}
            </div>

            {equipment.notes && (
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <p className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2" title={equipment.notes}>
                  {equipment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer / Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
            className="w-full text-center text-xs text-cyan-500 hover:text-cyan-400 py-1"
          >
            {showDetails ? 'Show Less' : 'Show Details'}
          </button>

        </div>
      </div>
    </div>
  );
}

export function AddEquipmentCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/20 dark:bg-gray-800/20 border-2 border-dashed border-gray-300 dark:border-cyan-500/30
      hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-500
      hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 dark:hover:shadow-cyan-400/10
      min-h-[350px] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          Add New Equipment
        </p>
      </div>
    </button>
  );
}
