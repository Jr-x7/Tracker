const XLSX = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const { assetsContainer } = require('./config/db');
require('dotenv').config();

function excelDateToJSDate(serial) {
    if (typeof serial === 'string') return serial; // Already a string
    if (!serial) return null;
   const utc_days  = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;                                        
   const date_info = new Date(utc_value * 1000);
   return date_info.toISOString().split('T')[0];
}

async function importAssets() {
    try {
        console.log("Starting Asset Import...");
        
        const filePath = path.join(__dirname, '../assets.xlsx');
        console.log(`Reading Excel: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`Found ${rawData.length} rows.`);

        let count = 0;
        let skipped = 0;

        for (const rawRow of rawData) {
             const getVal = (keyLike) => {
                const key = Object.keys(rawRow).find(k => k.trim().toLowerCase() === keyLike.toLowerCase());
                return rawRow[key];
            };

            const assetTag = getVal('Asset tag');
            const displayName = getVal('Display name');
            
            if (!displayName && !assetTag) {
                skipped++;
                continue;
            }

            // Check if exists? For now just insert new ID.
            
            const newAsset = {
                id: crypto.randomUUID(),
                type: 'equipment',
                
                // Mapped Fields
                assetTag: assetTag ? String(assetTag) : '',
                serialNumber: getVal('Serial number') ? String(getVal('Serial number')) : '',
                name: displayName || 'Unknown Asset',
                
                assignedTo: {
                    name: getVal('Assigned to') || 'Unassigned',
                    id: 'excel',
                    email: ''
                },
                
                location: getVal('Location') || '',
                
                // Status mapping
                status: getVal('Life Cycle Stage Status') || getVal('Current Status') || 'Unknown',
                healthStatus: 'healthy', // Default
                lifeCycleStage: getVal('Life Cycle Stage') || '',
                
                warrantyExpiration: excelDateToJSDate(getVal('Warranty expiration')),
                
                category: getVal('Model category') || '',
                ownedBy: getVal('Owned by') || '',
                costCenter: getVal('Cost center Display') ? String(getVal('Cost center Display')) : '',
                
                // Defaults
                depreciation: 0,
                lastCalibrated: new Date().toISOString(), // Mock
                nextCalibration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // +90 days
                createdAt: new Date().toISOString()
            };

            await assetsContainer.items.create(newAsset);
            count++;
            
            if (count % 10 === 0) process.stdout.write('.');
        }

        console.log(`\nSUCCESS: Imported ${count} assets. Skipped ${skipped} empty rows.`);

    } catch (error) {
        console.error("\nImport failed:", error);
    }
}

importAssets();
