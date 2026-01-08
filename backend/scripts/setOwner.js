const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { usersContainer, getItems } = require('../config/db');

async function setOwner(email) {
    if (!email) {
        console.error("Please provide an email address.");
        console.log("Usage: node setOwner.js user@example.com");
        process.exit(1);
    }

    try {
        console.log(`Looking for user with email: ${email}...`);
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        const users = await getItems(usersContainer, querySpec);
        
        if (users.length === 0) {
            console.error("User not found!");
            process.exit(1);
        }

        const user = users[0];
        console.log(`User found: ${user.name} (${user.role})`);

        user.role = 'owner';
        user.status = 'active'; // Ensure they are active

        await usersContainer.item(user.id, user.id).replace(user);

        console.log("SUCCESS: User role updated to 'owner'.");
        console.log("This user is now protected from demotion.");

    } catch (error) {
        console.error("Error setting owner:", error);
    }
}

const email = process.argv[2];
setOwner(email);
