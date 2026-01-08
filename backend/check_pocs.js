const { pocsContainer } = require('./config/db');
require('dotenv').config();

async function checkPocs() {
    try {
        console.log("Querying ALL POCs...");
        const response = await pocsContainer.items.readAll().fetchAll();
        
        console.log(`Found ${response.resources.length} POCs in DB.`);
        
        if (response.resources.length > 0) {
            console.log("\n--- Sample Entry ---");
            const sample = response.resources[0];
            console.log("Name:", sample.name);
            console.log("Primary:", sample.primaryPOC);
            console.log("Secondary:", sample.secondaryPOC);
            console.log("Category:", sample.category);
            console.log("--------------------\n");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

checkPocs();
