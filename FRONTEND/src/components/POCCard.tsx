import { useState } from 'react';
import { Copy, Terminal, Edit2, Trash2, Loader2, Activity, User, Users } from 'lucide-react';
import { POC } from '../types';
import { HealthBadge } from './HealthBadge';
import { CircularProgress } from './CircularProgress';
import { useAuth } from '../context/AuthContext';


interface POCCardProps {
  poc: POC;
  onUpdate?: () => void;
  onEdit: () => void;
}

export function POCCard({ poc, onUpdate, onEdit }: POCCardProps) {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusGradient = () => {
    if (poc.status === 'healthy') return 'from-green-400 to-emerald-500';
    if (poc.status === 'warning') return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this POC?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pocs/${poc.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        onUpdate?.();
      } else {
        alert('Failed to delete POC');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Error deleting POC');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-emerald-500/20
      hover:border-emerald-400 dark:hover:border-emerald-400 transition-all duration-500
      hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/10
      cursor-default animate-fadeIn flex flex-col h-full"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

      <div className="relative p-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
              {poc.name}
            </h3>

            {poc.category && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {poc.category}
              </span>
            )}

            <div className="mt-2 flex items-center space-x-2">
              <HealthBadge status={poc.status} />

              {user?.role === 'admin' && (
                <div className="flex items-center gap-1 opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1.5 hover:bg-emerald-500/10 rounded-full text-gray-400 hover:text-emerald-500 transition-colors"
                    title="Edit POC"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete POC"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4 shrink-0">
            <CircularProgress value={poc.depreciation} size={60} strokeWidth={5} />
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
          {poc.description || "No description provided."}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
          <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-emerald-500/10">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Primary</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={poc.primaryPOC}>
              {poc.primaryPOC || 'Unassigned'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-emerald-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Secondary</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={poc.secondaryPOC}>
              {poc.secondaryPOC || 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-2">
          {poc.laptop && poc.laptop !== 'Unknown' && (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="text-gray-500">Device</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{poc.laptop}</span>
            </div>
          )}

          {poc.runCommand && (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-mono truncate max-w-[150px]">{poc.runCommand}</span>
              </div>
              <button
                onClick={() => copyToClipboard(poc.runCommand, 'cmd')}
                className="text-gray-400 hover:text-white"
              >
                {copiedField === 'cmd' ? "Copied" : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

      </div>

      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
    </div>
  );
}

import { Plus } from 'lucide-react';

export function AddPOCCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/20 dark:bg-gray-800/20 border-2 border-dashed border-gray-300 dark:border-cyan-500/30
      hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-500
      hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 dark:hover:shadow-cyan-400/10
      min-h-[400px] flex items-center justify-center h-full w-full"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          Add New POC
        </p>
      </div>
    </button>
  );
}
