require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { assetsContainer, usersContainer, client } = require('./config/db');

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
        console.log("Starting Robust Asset Import with User Mapping...");

        // 1. Fetch Users to build Mapping
        console.log("Fetching users from DB...");
        const { resources: users } = await usersContainer.items.query("SELECT * FROM c").fetchAll();
        console.log(`Found ${users.length} users.`);
        
        const userMap = new Map();
        users.forEach(u => {
            if (u.name) userMap.set(u.name.toLowerCase().trim(), u);
            if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
        });

        // 2. Read Excel
        console.log("Reading assets.xlsx...");
        const filePath = 'c:\\Users\\PnRIn\\OneDrive\\Desktop\\TRACKER\\assets.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        console.log(`Found ${rawData.length} rows in Excel.`);

        // 3. Wipe and Re-Import
        console.log("Wiping existing equipment...");
        // Use a more robust wipe if needed, but fetchAll+delete is standard for small datasets
        const { resources: items } = await assetsContainer.items.query("SELECT * FROM c").fetchAll();
        for (const item of items) {
             await assetsContainer.item(item.id, item.id).delete();
        }
        console.log("Wipe complete.");

        let matchCount = 0;

        for (const row of rawData) {
            const assetTag = getVal(row, 'Asset tag') || `TAG-${Math.floor(Math.random()*10000)}`;
            const displayName = getVal(row, 'Display name') || getVal(row, 'Name') || 'Untitled Asset';
            
            // Map Status
            let status = 'active';
            const rawStatus = getVal(row, 'Current Status') || getVal(row, 'Life Cycle Stage Status');
            if (rawStatus && rawStatus.toLowerCase().includes('retired')) status = 'retired';
            if (rawStatus && rawStatus.toLowerCase().includes('stock')) status = 'maintenance';
            
            // Map Health
            let healthStatus = 'healthy';
            if (status === 'retired') healthStatus = 'critical';

            // Resolve Assigned User
            const assignedName = getVal(row, 'Assigned to') || getVal(row, 'Assigned to Display Name');
            let assignedUser = {
                name: assignedName || 'Unassigned',
                id: 'unassigned',
                email: ''
            };

            if (assignedName) {
                const lowerName = assignedName.toLowerCase().trim();
                const matchedUser = userMap.get(lowerName);
                if (matchedUser) {
                    assignedUser = {
                        name: matchedUser.name,
                        id: matchedUser.id,
                        email: matchedUser.email
                    };
                    matchCount++;
                } else {
                    // console.log(`Warning: User '${assignedName}' not found in DB.`);
                }
            }

            const newItem = {
                id: assetTag, 
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
                ownedBy: getVal(row, 'Owned by'), 
                
                // Finance & Org
                costCenter: getVal(row, 'Cost center'),
                costCenterDisplay: getVal(row, 'Cost center Display'),
                department: getVal(row, 'Department'),
                warrantyExpiration: getVal(row, 'Warranty expiration'),
                
                // Assignment
                assignedToDisplayName: assignedUser.name, 
                assignedTo: assignedUser,
                
                // Defaults
                manufacturer: getVal(row, 'Manufacturer') || '',
                modelNumber: getVal(row, 'Model') || '',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000', 
                purchaseDate: new Date().toISOString(),
                lastCalibrated: new Date().toISOString(),
                nextCalibration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                depreciation: 0,
                type: 'equipment'
            };
            
            await assetsContainer.items.create(newItem);
            process.stdout.write('.');
        }

        console.log(`\nImport finished. Matched ${matchCount} users to assets.`);
        // Force cleanup if needed
        // client.dispose(); 

    } catch (err) {
        console.error("Import failed:", err);
    }
}

importAssets();
