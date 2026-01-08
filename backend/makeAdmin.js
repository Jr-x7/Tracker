const { usersContainer, getItems, client } = require('./config/db');
require('dotenv').config();

async function makeAdmin(email) {
    try {
        console.log(`Looking for user: ${email}...`);
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };

        // We need to initialize the client implicitly by requiring db.js
        // But db.js initializes on load.

        const users = await getItems(usersContainer, querySpec);
        
        if (users.length === 0) {
            console.log("User not found!");
            return;
        }

        const user = users[0];
        console.log(`Found user: ${user.name} (${user.id})`);
        console.log(`Current Role: ${user.role}`);

        if (user.role === 'admin') {
            console.log("User is already admin.");
            return;
        }

        user.role = 'admin';
        user.status = 'active';
        user.isVerified = true; // Ensure they are verified too

        // Sanitize before update (remove system fields if any)
        const { _rid, _self, _etag, _attachments, _ts, ...cleanUser } = user;

        await usersContainer.item(user.id, user.id).replace(cleanUser);
        
        console.log("SUCCESS: User updated to ADMIN.");

    } catch (error) {
        console.error("Error updating user:", error);
    }
}

// Run it
makeAdmin('jawaharprasad990@gmail.com');
