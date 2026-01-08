const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { assetsContainer, pocsContainer, getItems, initializeDatabase } = require('./config/db');
const { registerUser, loginUser, getMe, grantAccess, getUsers, verifyEmail, requestAdminAccess } = require('./controllers/authController');
const { protect, admin } = require('./middleware/authMiddleware');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
// Serve static files from the public directory (Frontend build)
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.send('Tracker Backend API is running with Azure Cosmos DB');
});

app.get('/api/stats', async (req, res) => {
  try {
    const querySpec = { query: "SELECT * FROM c" };
    const assets = await getItems(assetsContainer, querySpec);
    
    const totalAssets = assets.length;
    const healthyAssets = assets.filter(a => a.healthStatus === 'healthy').length;
    const healthyPercentage = totalAssets > 0 ? Math.round((healthyAssets / totalAssets) * 100) : 0;
    const totalDepreciation = assets.reduce((sum, item) => sum + (item.depreciation || 0), 0);
    const avgDepreciation = totalAssets > 0 ? Math.round(totalDepreciation / totalAssets) : 0;
    const upcomingCalibrations = assets.filter(a => a.nextCalibration).length;

    res.json({
      totalAssets,
      healthyAssets: healthyPercentage,
      depreciation: avgDepreciation,
      upcomingCalibrations
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get('/api/equipment', async (req, res) => {
  try {
    const querySpec = { 
      query: "SELECT * FROM c WHERE c.type = 'equipment'" 
    };
    const items = await getItems(assetsContainer, querySpec);
    res.json(items);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ error: "Failed to fetch equipment" });
  }
});

app.get('/api/software', async (req, res) => {
    try {
        const querySpec = { 
          query: "SELECT * FROM c WHERE c.type = 'software'" 
        };
        const items = await getItems(assetsContainer, querySpec);
        res.json(items);
      } catch (error) {
        console.error("Error fetching software:", error);
        res.status(500).json({ error: "Failed to fetch software" });
      }
});

app.get('/api/pocs', async (req, res) => {
  try {
    const querySpec = { query: "SELECT * FROM c" };
    const items = await getItems(pocsContainer, querySpec);
    res.json(items);
  } catch (error) {
    console.error("Error fetching POCs:", error);
    res.status(500).json({ error: "Failed to fetch POCs" });
  }
});

// Auth Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/verify-email', verifyEmail);
app.get('/api/auth/me', protect, getMe);
app.get('/api/auth/users', protect, admin, getUsers);
app.put('/api/auth/grant-access/:id', protect, admin, grantAccess);
app.post('/api/auth/request-access', protect, requestAdminAccess);

// --- Extended Editing Endpoints ---

// Create Asset (Equipment or Software)
app.post('/api/assets', protect, admin, async (req, res) => {
  try {
    const newItem = {
      id: crypto.randomUUID(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const { resource: createdItem } = await assetsContainer.items.create(newItem);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

// Create POC
app.post('/api/pocs', protect, admin, async (req, res) => {
  try {
    const newItem = {
      id: crypto.randomUUID(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const { resource: createdItem } = await pocsContainer.items.create(newItem);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error("Error creating POC:", error);
    res.status(500).json({ error: "Failed to create POC" });
  }
});

// Update Asset (Generic) - Handles Health, AssignedTo, Date, Depreciation, etc.
app.put('/api/assets/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Full object or partial updates

  try {
    // 1. Fetch existing to get partition key (assuming it might be needed or for safety)
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: id }]
    };
    const items = await getItems(assetsContainer, querySpec);
    if (items.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }
    const asset = items[0];

    // 2. Merge updates
    const updatedAsset = { ...asset, ...updates };

    // 3. Persist
    const { resource: result } = await assetsContainer.items.upsert(updatedAsset);
    res.json(result);

  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// Delete Asset
app.delete('/api/assets/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Fetch to ensure exists and get partition key if needed (defaulting to id if not found)
      // For delete, we need id and partition key.
      const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: id }]
      };
      const items = await getItems(assetsContainer, querySpec);
      if (items.length === 0) {
        return res.status(404).json({ error: "Asset not found" });
      }
      const asset = items[0];
      
      // Determine Partition Key. If container defined with /id, it's the id.
      // If defined with /type or /category, we need that value.
      // We will try using the id as PK if 'partitionKey' prop is missing, 
      // but safest is to try to derive it or assume standard /id.
      // NOTE: db.js doesn't explicitly set PK for assetsContainer (defaults usually to /id or /partitionKey).
      // Let's assume /id for now or use the value itself if we can.
      // The `item` method takes (id, partitionKeyValue).
      
      const partitionKey = asset.id; // Most common default. 
      // If this fails, user might need to specify PK schema.
  
      await assetsContainer.item(id, partitionKey).delete();
      res.json({ message: "Asset deleted successfully", id });
  
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ error: "Failed to delete asset" });
    }
});

// Update POC
app.put('/api/pocs/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: id }]
      };
      const items = await getItems(pocsContainer, querySpec);
      if (items.length === 0) {
        return res.status(404).json({ error: "POC not found" });
      }
      const poc = items[0];
  
      const updatedPOC = { ...poc, ...updates };
  
      const { resource: result } = await pocsContainer.items.upsert(updatedPOC);
      res.json(result);
  
    } catch (error) {
      console.error("Error updating POC:", error);
      res.status(500).json({ error: "Failed to update POC" });
    }
});
  
// Delete POC
app.delete('/api/pocs/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };
        const items = await getItems(pocsContainer, querySpec);
        if (items.length === 0) {
            return res.status(404).json({ error: "POC not found" });
        }
        const poc = items[0];
        
        await pocsContainer.item(id, poc.id).delete(); // Assuming PK is /id
        res.json({ message: "POC deleted successfully", id });

    } catch (error) {
        console.error("Error deleting POC:", error);
        res.status(500).json({ error: "Failed to delete POC" });
    }
});

// SPA Fallback: Serve index.html for any unknown routes
const path = require('path');
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize DB (Ensure Users container exists)
  console.log("DEBUG: Calling initializeDatabase()...");
  await initializeDatabase();
  console.log("DEBUG: initializeDatabase() returned.");

  // Test DB connection
  try {
    console.log("Testing DB connection...");
    const { resources } = await assetsContainer.items.query("SELECT * FROM c OFFSET 0 LIMIT 1").fetchAll();
    console.log("DB Connection successful. Found " + resources.length + " items.");
  } catch (err) {
    console.error("DB Connection failed:", err);
  }
});

// Force keep-alive to prevent process exit if event loop is empty
// This is a debugging measure for "process stops itself"
setInterval(() => {
  // Heartbeat to keep process alive
}, 10000);

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
