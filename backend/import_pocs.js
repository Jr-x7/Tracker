const XLSX = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const { pocsContainer } = require('./config/db');
require('dotenv').config();

async function importPOCs() {
    try {
        // 1. Delete Bad Data
        console.log("Cleaning up 'Untitled POC' entries...");
        const badItems = await pocsContainer.items
            .query("SELECT * FROM c WHERE c.name = 'Untitled POC'")
            .fetchAll();
            
        for (const item of badItems.resources) {
            await pocsContainer.item(item.id, item.id).delete();
        }
        console.log(`Deleted ${badItems.resources.length} bad entries.`);

        // 2. Read Excel
        const filePath = path.join(__dirname, '../Book1.xlsx');
        console.log(`Reading Excel: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        let count = 0;
        for (const rawRow of rawData) {
            // Helper to get value ignoring case/trim
            const getVal = (keyLike) => {
                const key = Object.keys(rawRow).find(k => k.trim().toLowerCase() === keyLike.toLowerCase());
                return rawRow[key];
            };

            const name = getVal('POC Name') || getVal('Name') || 'Untitled POC';
            
            // Skip empty rows
            if (name === 'Untitled POC' && !getVal('Primary POC')) continue;

            const newPOC = {
                id: crypto.randomUUID(),
                name: name,
                description: getVal('Description') || '',
                laptop: getVal('Device') || getVal('Laptop') || 'Unknown',
                
                primaryPOC: getVal('Primary POC') || '',
                secondaryPOC: getVal('Secondary POC') || '',
                category: getVal('Category') || '',

                frontendPath: "",
                backendPath: "",
                runCommand: "",
                envCommand: "",
                
                status: 'healthy', 
                depreciation: 100,
                createdAt: new Date().toISOString()
            };

            await pocsContainer.items.create(newPOC);
            count++;
        }

        console.log(`SUCCESS: Re-imported ${count} POCs.`);

    } catch (error) {
        console.error("Import failed:", error);
    }
}

importPOCs();
