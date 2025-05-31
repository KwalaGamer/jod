// Update your server.js with these changes
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Create default files if they don't exist
const defaultFiles = {
    'inventory.json': '[]',
    'customers.json': '[]',
    'workers.json': '[]',
    'importers.json': '[]',
    'importHistory.json': '[]',
    'sales.json': '[]',
    'logs.json': '[]'
};

Object.entries(defaultFiles).forEach(([filename, content]) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
    }
});

app.use(bodyParser.json());
app.use(express.static(__dirname));

// API endpoints with better error handling
app.post('/api/save', (req, res) => {
    try {
        const { filename, data } = req.body;
        if (!filename || !data) {
            return res.status(400).json({ error: 'Filename and data are required' });
        }

        const filePath = path.join(dataDir, filename);
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).json({ error: 'Failed to save data' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Error in save endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/load', (req, res) => {
    try {
        const { filename } = req.query;
        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        const filePath = path.join(dataDir, filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(404).json({ error: 'File not found' });
            }
            try {
                const parsedData = JSON.parse(data);
                res.json(parsedData);
            } catch (parseError) {
                console.error('Error parsing file:', parseError);
                res.status(500).json({ error: 'Invalid data format' });
            }
        });
    } catch (error) {
        console.error('Error in load endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});