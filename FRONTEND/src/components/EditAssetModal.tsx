import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Activity, DollarSign, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserData {
    id: string;
    name: string;
    email: string;
}

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    asset?: any; // Optional for creation
    type: 'equipment' | 'software';
}

export function EditAssetModal({ isOpen, onClose, onUpdate, asset, type }: EditAssetModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [modelNumber, setModelNumber] = useState(''); // New field
    const [depreciationStatus, setDepreciationStatus] = useState('healthy'); // Renamed from healthStatus
    const [assignedTo, setAssignedTo] = useState(''); // Text input now
    const [lastCalibrated, setLastCalibrated] = useState('');
    const [nextCalibration, setNextCalibration] = useState('');

    const [depreciation, setDepreciation] = useState(0);

    // New Fields
    const [assetTag, setAssetTag] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('');
    const [ownedBy, setOwnedBy] = useState('');
    const [costCenter, setCostCenter] = useState('');
    const [warrantyExpiration, setWarrantyExpiration] = useState('');
    const [category, setCategory] = useState('');

    // Software specific
    const [licenseValidity, setLicenseValidity] = useState('');
    const [softwareType, setSoftwareType] = useState('Subscription');

    const isEditing = !!asset;

    useEffect(() => {
        if (isOpen) {
            if (asset) {
                setName(asset.name || '');
                setImage(asset.image || '');
                setModelNumber(asset.modelNumber || '');
                setDepreciationStatus(asset.healthStatus || 'healthy'); // Map healthStatus to depreciationStatus
                setAssignedTo(asset.assignedTo?.name || asset.assignedTo || ''); // Handle object or string
                setLastCalibrated(asset.lastCalibrated || '');
                setNextCalibration(asset.nextCalibration || '');
                setDepreciation(asset.depreciation || 0);

                setAssetTag(asset.assetTag || '');
                setSerialNumber(asset.serialNumber || '');
                setLocation(asset.location || '');
                setStatus(asset.status || '');
                setOwnedBy(asset.ownedBy || '');
                setCostCenter(asset.costCenter || '');
                setWarrantyExpiration(asset.warrantyExpiration || '');
                setCategory(asset.category || '');

                // Software specific
                setLicenseValidity(asset.licenseValidity || '');
                setSoftwareType(asset.softwareType || 'Subscription');
            } else {
                // Reset for creation
                setName('');
                setImage('');
                setModelNumber('');
                setDepreciationStatus('healthy');
                setAssignedTo('');
                setLastCalibrated('');
                setNextCalibration('');
                setDepreciation(0);
                setAssetTag('');
                setSerialNumber('');
                setLocation('');
                setStatus('');
                setOwnedBy('');
                setCostCenter('');
                setWarrantyExpiration('');
                setCategory('');
                setLicenseValidity('');
                setSoftwareType('Subscription');
            }
        }
    }, [isOpen, asset]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Construct payload
        const payload: any = {
            type,
            name,
            image,
            modelNumber: type === 'equipment' ? (modelNumber || undefined) : undefined,
            healthStatus: depreciationStatus, // Backend expects healthStatus
            assignedTo: assignedTo ? { name: assignedTo, email: '', id: 'manual' } : null,
            lastCalibrated: lastCalibrated || undefined,
            nextCalibration: nextCalibration || undefined,
            depreciation: Number(depreciation),
            licenseValidity: type === 'software' ? (licenseValidity || undefined) : undefined,
            softwareType: type === 'software' ? softwareType : undefined,
            assetTag,
            serialNumber,
            location,
            status,
            ownedBy,
            costCenter,
            warrantyExpiration,
            category
        };

        try {
            const url = isEditing
                ? `/api/assets/${asset.id}`
                : `/api/assets`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} asset`);

            onUpdate();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to save asset. Check console for details.");
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
                        {isEditing ? 'Edit' : 'Add New'} {type === 'equipment' ? 'Equipment' : 'Software'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* Name & Image */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder={`Enter ${type} name...`}
                            />
                        </div>
                        {type === 'equipment' && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model Number</label>
                                <input
                                    type="text"
                                    value={modelNumber}
                                    onChange={(e) => setModelNumber(e.target.value)}
                                    className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Enter model number..."
                                />
                            </div>
                        )}
                        {type === 'equipment' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Asset Tag</label>
                                    <input
                                        type="text"
                                        value={assetTag}
                                        onChange={(e) => setAssetTag(e.target.value)}
                                        className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Serial Number</label>
                                    <input
                                        type="text"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                        )}
                        {type === 'equipment' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Center</label>
                                    <input
                                        type="text"
                                        value={costCenter}
                                        onChange={(e) => setCostCenter(e.target.value)}
                                        className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL (Optional)</label>
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Assigned To - Text Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-500" /> Assigned User
                        </label>
                        <input
                            type="text"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter user name..."
                        />
                    </div>

                    {/* Software Type & License Validity */}
                    {type === 'software' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-pink-500" /> Type
                                </label>
                                <select
                                    value={softwareType}
                                    onChange={(e) => setSoftwareType(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                >
                                    <option value="Subscription">Subscription</option>
                                    <option value="One-Time Purchase">One-Time Purchase</option>
                                    <option value="Open Source">Open Source</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-pink-500" /> License Validity
                                </label>
                                <input
                                    type="date"
                                    value={licenseValidity ? new Date(licenseValidity).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setLicenseValidity(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Depreciation Status (Renamed from Health) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-500" /> Depreciation Status
                        </label>
                        <select
                            value={depreciationStatus}
                            onChange={(e) => setDepreciationStatus(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="healthy">Healthy</option>
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" /> {type === 'software' ? 'Last Updated' : 'Last Calibrated'}
                            </label>
                            <input
                                type="date"
                                value={lastCalibrated ? new Date(lastCalibrated).toISOString().split('T')[0] : ''}
                                onChange={(e) => setLastCalibrated(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" /> {type === 'software' ? 'Next Update' : 'Next Due'}
                            </label>
                            <input
                                type="date"
                                value={nextCalibration ? new Date(nextCalibration).toISOString().split('T')[0] : ''}
                                onChange={(e) => setNextCalibration(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>
                    {/* Warranty & Status */}
                    {type === 'equipment' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-green-500" /> Warranty Expiration
                                </label>
                                <input
                                    type="date"
                                    value={warrantyExpiration ? new Date(warrantyExpiration).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setWarrantyExpiration(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <input
                                    type="text"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g. In Use"
                                />
                            </div>
                        </div>
                    )}

                    {/* Depreciation */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" /> Depreciation (%)
                        </label>
                        <input
                            type="number"
                            min="0" max="100"
                            value={depreciation}
                            onChange={(e) => setDepreciation(Number(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 z-10 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isEditing ? 'Save Changes' : 'Create Asset'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
