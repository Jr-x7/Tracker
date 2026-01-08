require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'Trackydb';
const containerId = 'equipment';

const client = new CosmosClient({ endpoint, key });

// Helper to normalize keys (remove spaces, lowercase)
const normalize = (str) => str ? str.toString().trim().toLowerCase().replace(/\s+/g, '') : '';

// Helper to find value in row by fuzzy matching key
const getVal = (row, targetKey) => {
    const rowKeys = Object.keys(row);
    const normalizedTarget = normalize(targetKey);
    const foundKey = rowKeys.find(k => normalize(k) === normalizedTarget);
    return foundKey ? row[foundKey] : '';
};

async function importAssets() {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        console.log("Reading assets.xlsx...");
        const filePath = 'c:\\Users\\PnRIn\\OneDrive\\Desktop\\TRACKER\\assets.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        console.log(`Found ${rawData.length} rows.`);

        // Optional: Wipe container?
        // Logic: Provide fresh start as requested "all data from excel to db"
        console.log("Wiping existing equipment...");
        const { resources: items } = await container.items.query("SELECT * FROM c").fetchAll();
        for (const item of items) {
             await container.item(item.id, item.id).delete();
        }
        console.log("Wipe complete.");

        for (const row of rawData) {
            const assetTag = getVal(row, 'Asset tag') || `TAG-${Math.floor(Math.random()*10000)}`;
            const displayName = getVal(row, 'Display name') || getVal(row, 'Name') || 'Untitled Asset';
            
            // Map Status
            let status = 'active';
            const rawStatus = getVal(row, 'Current Status') || getVal(row, 'Life Cycle Stage Status');
            if (rawStatus && rawStatus.toLowerCase().includes('retired')) status = 'retired';
            if (rawStatus && rawStatus.toLowerCase().includes('stock')) status = 'maintenance';
            
            // Map Health (simulated based on status or random if unknown)
            let healthStatus = 'healthy';
            if (status === 'retired') healthStatus = 'critical';

            const newItem = {
                id: assetTag, // using asset tag as ID for stability or UUID
                name: displayName,
                description: getVal(row, 'Notes') || '',
                
                // Core Fields
                assetTag: getVal(row, 'Asset tag'),
                serialNumber: getVal(row, 'Serial number'),
                location: getVal(row, 'Location'),
                
                // Lifecycle
                lifecycleStage: getVal(row, 'Life Cycle Stage'),
                lifecycleStageStatus: getVal(row, 'Life Cycle Stage Status'),
                status: status,
                healthStatus: healthStatus,

                // Categorization
                modelCategory: getVal(row, 'Model category'),
                ownedBy: getVal(row, 'Owned by'), // e.g. "Contoso"
                
                // Finance & Org
                costCenter: getVal(row, 'Cost center'),
                costCenterDisplay: getVal(row, 'Cost center Display'),
                department: getVal(row, 'Department'), // New
                warrantyExpiration: getVal(row, 'Warranty expiration'),
                
                // Assignment
                assignedToDisplayName: getVal(row, 'Assigned to Display Name'), // New
                assignedTo: {
                    name: getVal(row, 'Assigned to') || getVal(row, 'Assigned to Display Name') || 'Unassigned',
                    id: 'temp-id', 
                    email: ''
                },
                
                // Defaults for required UI fields not in Excel
                manufacturer: getVal(row, 'Manufacturer') || '',
                modelNumber: getVal(row, 'Model') || '',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000', // Generic laptop
                purchaseDate: new Date().toISOString(),
                lastCalibrated: new Date().toISOString(),
                nextCalibration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                depreciation: 0,
                type: 'equipment'
            };
            
            const { resource } = await container.items.create(newItem);
            console.log(`Imported: ${displayName} (${assetTag})`);
        }

        console.log("Import finished successfully.");

    } catch (err) {
        console.error("Import failed:", err);
    }
}

importAssets();
