import { Calendar, User, AlertCircle, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Software } from '../types';
import { HealthBadge } from './HealthBadge';
import { CircularProgress } from './CircularProgress';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { EditAssetModal } from './EditAssetModal';

interface SoftwareCardProps {
  software: Software;
  onClick?: () => void;
  onUpdate?: () => void;
}

export function SoftwareCard({ software, onClick, onUpdate }: SoftwareCardProps) {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const daysUntilCalibration = Math.ceil(
    (new Date(software.nextCalibration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getUrgencyColor = () => {
    if (daysUntilCalibration <= 7) return 'from-red-500 to-pink-500';
    if (daysUntilCalibration <= 30) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this software?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3002/api/assets/${software.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        onUpdate?.();
      } else {
        alert('Failed to delete software');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Error deleting software');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-purple-500/20
      hover:border-purple-400 dark:hover:border-purple-400 transition-all duration-500
      hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 dark:hover:shadow-purple-400/20
      cursor-pointer animate-fadeIn"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-6">
          {software.image && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={software.image}
                alt={software.name}
                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {software.name}
              </h3>
              <div className="flex items-center space-x-2">
                <HealthBadge status={software.healthStatus} />
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                      className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 transition-colors"
                      title="Edit Software"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Software"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4">
              <CircularProgress value={software.depreciation} size={70} strokeWidth={6} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-purple-500/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                {software.assignedTo?.name ? software.assignedTo.name.split(' ').map(n => n[0]).join('') : 'UA'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {software.assignedTo?.name || 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-purple-500/10">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(software.lastCalibrated).toLocaleDateString()}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-purple-500/10">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Next Update</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {daysUntilCalibration} days
                  </p>
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${getUrgencyColor()} animate-pulse`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500" />
      </div>

      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => onUpdate?.()}
        asset={software}
        type="software"
      />
    </>
  );
}

export function AddSoftwareCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/20 dark:bg-gray-800/20 border-2 border-dashed border-gray-300 dark:border-purple-500/30
      hover:border-purple-400 dark:hover:border-purple-400 transition-all duration-500
      hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-400/10
      min-h-[350px] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          Add New Software
        </p>
      </div>
    </button>
  );
}
