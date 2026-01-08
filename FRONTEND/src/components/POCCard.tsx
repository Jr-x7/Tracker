import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Folder, Terminal, CheckCircle, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { POC } from '../types';
import { HealthBadge } from './HealthBadge';
import { CircularProgress } from './CircularProgress';
import { useAuth } from '../context/AuthContext';
import { EditPOCModal } from './EditPOCModal';

interface POCCardProps {
  poc: POC;
  onUpdate?: () => void;
}

export function POCCard({ poc, onUpdate }: POCCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/40 dark:bg-gray-800/40 border-l-4 border-y border-r
      ${isExpanded ? 'border-l-emerald-500' : 'border-l-gray-300 dark:border-l-emerald-500/30'}
      border-gray-200/50 dark:border-emerald-500/20
      hover:border-emerald-400 dark:hover:border-emerald-400 transition-all duration-500
      hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/10
      animate-fadeIn`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-6 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {poc.name}
                  </h3>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-bounce" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {poc.description}
                </p>

                <div className="flex items-center space-x-4">
                  <HealthBadge status={poc.status} />
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Folder className="w-4 h-4" />
                    <span>{poc.laptop}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                        className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-emerald-500 transition-colors"
                        title="Edit POC"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete POC"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4">
                <CircularProgress value={poc.depreciation} size={70} strokeWidth={6} />
              </div>
            </div>
          </button>

          {isExpanded && (
            <div className="px-6 pb-6 space-y-4 animate-fadeIn">
              {poc.image && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-emerald-500/20">
                  <img
                    src={poc.image}
                    alt={poc.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-emerald-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Frontend Path</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(poc.frontendPath, 'frontend')}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                      {copiedField === 'frontend' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  <code className="text-xs text-cyan-600 dark:text-cyan-400 font-mono break-all">
                    {poc.frontendPath}
                  </code>
                </div>

                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-emerald-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Backend Path</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(poc.backendPath, 'backend')}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                      {copiedField === 'backend' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  <code className="text-xs text-purple-600 dark:text-purple-400 font-mono break-all">
                    {poc.backendPath}
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-semibold text-emerald-400">Run Command</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(poc.runCommand, 'command')}
                      className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {copiedField === 'command' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <code className="text-sm text-green-400 font-mono block">
                    {poc.runCommand}
                  </code>
                </div>

                {poc.envCommand && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-purple-400" />
                        <p className="text-sm font-semibold text-purple-400">Env Activation</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(poc.envCommand!, 'env')}
                        className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copiedField === 'env' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <code className="text-sm text-purple-400 font-mono block">
                      {poc.envCommand}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
      </div>

      <EditPOCModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => onUpdate?.()}
        poc={poc}
      />
    </>
  );
}

export function AddPOCCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl
      bg-white/20 dark:bg-gray-800/20 border-2 border-dashed border-gray-300 dark:border-emerald-500/30
      hover:border-emerald-400 dark:hover:border-emerald-400 transition-all duration-500
      hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/10
      min-h-[180px] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          Add New POC
        </p>
      </div>
    </button>
  );
}
