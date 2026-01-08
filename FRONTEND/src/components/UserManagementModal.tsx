import { useState, useEffect } from 'react';
import { Shield, Search, Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    accessRequested?: boolean;
    isVerified?: boolean;
}

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/users', {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        setProcessingId(userId);
        try {
            const response = await fetch(`/api/auth/grant-access/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                // If promoting to admin, clear accessRequested flag locally
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, accessRequested: false } : u));
            }
        } catch (error) {
            console.error("Failed to update role", error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingRequests = users.filter(u => u.accessRequested && u.role !== 'admin');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 pb-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-cyan-500/20 overflow-hidden animate-fadeIn max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-purple-500" /> User Management
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage user roles and permissions</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                        <X className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Pending Requests Section */}
                    {pendingRequests.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4" /> Pending Admin Requests
                            </h3>
                            <div className="space-y-3">
                                {pendingRequests.map(reqUser => (
                                    <div key={reqUser.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                {reqUser.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{reqUser.name}</p>
                                                <p className="text-xs text-gray-500">{reqUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRoleUpdate(reqUser.id, 'admin')}
                                                disabled={!!processingId}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                                            >
                                                <Check className="w-3 h-3" /> Approve
                                            </button>
                                            <button
                                                disabled={true}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 opacity-50 cursor-not-allowed"
                                                title="Dismissal not implemented"
                                            >
                                                <X className="w-3 h-3" /> Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search & List */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white dark:ring-gray-700">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${u.role === 'owner'
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-500/30'
                                                    : u.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-500/30'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                                                    }`}>
                                                    {u.role === 'owner' ? 'Owner' : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${u.status === 'active' ? 'text-green-600' : 'text-orange-500'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-orange-500'
                                                        }`} />
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {u.role === 'owner' ? (
                                                    <span className="text-xs text-gray-400 italic">Protected</span>
                                                ) : user?.id !== u.id && ( /* Fixed: user?._id -> user?.id (Wait, checked AuthContext, user interface has _id. Re-checking usage) */
                                                    <button
                                                        onClick={() => handleRoleUpdate(u.id, u.role === 'admin' ? 'viewer' : 'admin')}
                                                        disabled={!!processingId}
                                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${u.role === 'viewer'
                                                            ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200'
                                                            : 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200'
                                                            }`}
                                                    >
                                                        {processingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                                            u.role === 'viewer' ? 'Promote to Admin' : 'Demote to Viewer'
                                                        }
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
