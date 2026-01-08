require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const XLSX = require('xlsx');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'Trackydb';
const containerId = 'pocs'; // Verify container name? "pocsContainer" or "pocs"? Usually "pocs" in my previous edits.

const client = new CosmosClient({ endpoint, key });

const normalize = (str) => str ? str.toString().trim().toLowerCase().replace(/\s+/g, '') : '';
const getVal = (row, targetKey) => {
    const rowKeys = Object.keys(row);
    const normalizedTarget = normalize(targetKey);
    const foundKey = rowKeys.find(k => normalize(k) === normalizedTarget);
    return foundKey ? row[foundKey] : '';
};

async function importPOCs() {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        console.log("Reading Book1.xlsx...");
        const filePath = 'c:\\Users\\PnRIn\\OneDrive\\Desktop\\TRACKER\\Book1.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        console.log(`Found ${rawData.length} rows.`);

        console.log("Wiping existing POCs...");
        const { resources: items } = await container.items.query("SELECT * FROM c").fetchAll();
        for (const item of items) {
             await container.item(item.id, item.id).delete();
        }

        for (const row of rawData) {
            const name = getVal(row, 'POC Name') || getVal(row, 'Name') || 'Untitled POC';
            
            // Map known fields
            const newItem = {
                id: `POC-${Math.floor(Math.random() * 100000)}`,
                name: name,
                description: getVal(row, 'Description') || '',
                laptop: getVal(row, 'Device') || getVal(row, 'Laptop') || '',
                
                primaryPOC: getVal(row, 'Primary POC'),
                secondaryPOC: getVal(row, 'Secondary POC'),
                category: getVal(row, 'Category'),
                planogramCompliance: getVal(row, 'Planogram compliance'),

                runCommand: getVal(row, 'Run Command') || '',
                envCommand: getVal(row, 'Env Command') || '',
                frontendPath: getVal(row, 'Frontend Path') || '',
                backendPath: getVal(row, 'Backend Path') || '',
                
                status: 'healthy', // Default
                depreciation: 0,
                type: 'poc'
            };
            
            await container.items.create(newItem);
            console.log(`Imported: ${name}`);
        }
    } catch (err) {
        console.error("Import failed:", err);
    }
}

importPOCs();
