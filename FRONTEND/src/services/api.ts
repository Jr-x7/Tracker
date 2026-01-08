const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export const fetchStats = async () => {
    const response = await fetch(`${API_BASE_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

export const fetchEquipment = async () => {
    const response = await fetch(`${API_BASE_URL}/api/equipment`);
    if (!response.ok) throw new Error('Failed to fetch equipment');
    return response.json();
};

export const fetchSoftware = async () => {
    const response = await fetch(`${API_BASE_URL}/api/software`);
    if (!response.ok) throw new Error('Failed to fetch software');
    return response.json();
};

export const fetchPOCs = async () => {
    const response = await fetch(`${API_BASE_URL}/api/pocs`);
    if (!response.ok) throw new Error('Failed to fetch POCs');
    return response.json();
};
