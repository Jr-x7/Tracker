const { CosmosClient } = require('@azure/cosmos');
const dotenv = require('dotenv');

dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID;
const assetsContainerId = process.env.COSMOS_ASSETS_CONTAINER_ID;
const pocsContainerId = process.env.COSMOS_POCS_CONTAINER_ID;
const visitsContainerId = process.env.COSMOS_VISITS_CONTAINER_ID;
const usersContainerId = process.env.COSMOS_USERS_CONTAINER_ID;

if (!endpoint || !key || !databaseId) {
  console.error("Critical: Cosmos DB environment variables are missing.");
  // We might want to throw here, but for now just log
}

console.log("Initializing Cosmos DB Client...");
const client = new CosmosClient({ endpoint, key });
console.log("Cosmos Client initialized.");

const database = client.database(databaseId);
console.log(`Database reference created for: ${databaseId}`);

const assetsContainer = database.container(assetsContainerId);
const pocsContainer = database.container(pocsContainerId);
const visitsContainer = database.container(visitsContainerId);
const usersContainer = database.container(usersContainerId);
console.log("Container references created.");


async function getItems(container, querySpec) {
  try {
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();
    return items;
  } catch (err) {
    console.error(`Error querying container ${container.id}:`, err);
    throw err;
  }
}

async function initializeDatabase() {
  try {
    console.log("DEBUG: execution entered initializeDatabase");
    console.log(`DEBUG: Users Container ID from env: '${usersContainerId}'`);
    if (!usersContainerId) {
        throw new Error("usersContainerId is undefined!");
    }
    console.log(`Ensuring container ${usersContainerId} exists...`);
    await database.containers.createIfNotExists({ id: usersContainerId, partitionKey: '/id' });
    console.log(`Container ${usersContainerId} verified/created.`);
  } catch (error) {
    console.error("Error initializing database containers:", error);
  }
}

module.exports = {
  client,
  database,
  assetsContainer,
  pocsContainer,
  visitsContainer,
  usersContainer,
  getItems,
  initializeDatabase
};
