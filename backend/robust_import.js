const XLSX = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const { pocsContainer } = require('./config/db');
require('dotenv').config();

async function importPOCs() {
    try {
        console.log("Starting Robust Import...");

        // 1. Read Excel
        const filePath = path.join(__dirname, '../Book1.xlsx');
        console.log(`Reading Excel: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        if (rawData.length === 0) {
            console.log("No data found in Excel.");
            return;
        }

        // 2. Identify Columns dynamically
        const firstRow = rawData[0];
        const keys = Object.keys(firstRow);
        console.log("Available Keys:", keys);

        const findKey = (searchTerms) => {
            return keys.find(k => {
                const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                return searchTerms.some(term => norm.includes(term.toLowerCase().replace(/[^a-z0-9]/g, '')));
            });
        };

        const nameKey = findKey(['POCName', 'ProjectName', 'Name']) || 'Name'; // default
        const descKey = findKey(['Description', 'Desc']);
        const primaryKey = findKey(['PrimaryPOC', 'Primary']);
        const secondaryKey = findKey(['SecondaryPOC', 'Secondary']);
        const categoryKey = findKey(['Category', 'Cat']);
        const laptopKey = findKey(['Device', 'Laptop', 'Machine']);

        console.log("Mapped Keys:", { 
            nameKey, descKey, primaryKey, secondaryKey, categoryKey, laptopKey 
        });

        // 3. Wipe DB
        console.log("WIPING Database...");
        const allItems = await pocsContainer.items.readAll().fetchAll();
        console.log(`Deleting ${allItems.resources.length} existing items...`);
        for (const item of allItems.resources) {
            await pocsContainer.item(item.id, item.id).delete();
        }
        console.log("Database cleared.");

        // 4. Import
        let count = 0;
        for (const row of rawData) {
            const name = row[nameKey] ? String(row[nameKey]).trim() : "Untitled POC";
            
            // Allow "Untitled" if we have other data, otherwise skip empty rows
            if (name === "Untitled POC" && !row[primaryKey] && !row[descKey]) continue;

            const newPOC = {
                id: crypto.randomUUID(),
                name: name,
                description: row[descKey] ? String(row[descKey]) : "",
                laptop: row[laptopKey] ? String(row[laptopKey]) : "Unknown",
                primaryPOC: row[primaryKey] ? String(row[primaryKey]) : "",
                secondaryPOC: row[secondaryKey] ? String(row[secondaryKey]) : "",
                category: row[categoryKey] ? String(row[categoryKey]) : "",
                
                // Fields to leave empty
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
            if (count % 10 === 0) process.stdout.write('.');
        }

        console.log(`\nSUCCESS: Imported ${count} POCs.`);

    } catch (error) {
        console.error("Import failed:", error);
    }
}

importPOCs();
