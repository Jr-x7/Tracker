import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Monitor, Terminal, Loader2, Activity, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EditPOCModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    poc?: any; // Optional for creation
}

export function EditPOCModal({ isOpen, onClose, onUpdate, poc }: EditPOCModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');
    const [healthStatus, setHealthStatus] = useState('healthy');
    const [laptop, setLaptop] = useState('');
    const [frontendPath, setFrontendPath] = useState('');
    const [backendPath, setBackendPath] = useState('');
    const [frontendCommand, setFrontendCommand] = useState('');
    const [backendCommand, setBackendCommand] = useState('');
    const [envCommand, setEnvCommand] = useState('');
    const [depreciation, setDepreciation] = useState(0);

    const isEditing = !!poc;

    useEffect(() => {
        if (isOpen) {
            if (poc) {
                setName(poc.name || '');
                setImage(poc.image || '');
                setDescription(poc.description || '');
                setStatus(poc.status || 'active');
                setHealthStatus(poc.healthStatus || 'healthy');
                setLaptop(poc.laptop || '');
                setFrontendPath(poc.frontendPath || poc.path || '');
                setBackendPath(poc.backendPath || '');
                setFrontendCommand(poc.frontendCommand || poc.runCommand || '');
                setBackendCommand(poc.backendCommand || '');
                setEnvCommand(poc.envCommand || '');
                setDepreciation(poc.depreciation || 0);
            } else {
                // Reset for creation
                setName('');
                setImage('');
                setDescription('');
                setStatus('active');
                setHealthStatus('healthy');
                setLaptop('');
                setFrontendPath('');
                setBackendPath('');
                setFrontendCommand('');
                setBackendCommand('');
                setEnvCommand('');
                setDepreciation(0);
            }
        }
    }, [isOpen, poc]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            name,
            image,
            description,
            status,
            healthStatus,
            laptop,
            frontendPath,
            backendPath,
            frontendCommand,
            backendCommand,
            envCommand,
            runCommand: frontendCommand, // Keep backward compatibility
            depreciation: Number(depreciation)
        };

        try {
            const url = isEditing
                ? `/api/pocs/${poc.id}`
                : `/api/pocs`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} POC`);

            onUpdate();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to save POC. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-cyan-500/20 overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit' : 'Add New'} POC
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-500" /> Health
                            </label>
                            <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="healthy">Healthy</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-purple-500" /> Laptop
                        </label>
                        <input type="text" value={laptop} onChange={(e) => setLaptop(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" /> Frontend Path
                            </label>
                            <input type="text" value={frontendPath} onChange={(e) => setFrontendPath(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-500" /> Backend Path
                            </label>
                            <input type="text" value={backendPath} onChange={(e) => setBackendPath(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-green-500" /> Frontend Command
                            </label>
                            <input type="text" value={frontendCommand} onChange={(e) => setFrontendCommand(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                                placeholder="npm run dev"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-orange-500" /> Backend Command
                            </label>
                            <input type="text" value={backendCommand} onChange={(e) => setBackendCommand(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                                placeholder="python app.py"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-purple-500" /> Environment Activation Command
                        </label>
                        <input type="text" value={envCommand} onChange={(e) => setEnvCommand(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                            placeholder="source venv/bin/activate or .\venv\Scripts\activate"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 z-10 border-t border-gray-200 dark:border-gray-800">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isEditing ? 'Save Changes' : 'Create POC'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
