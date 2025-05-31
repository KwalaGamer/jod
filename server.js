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

app.use(bodyParser.json());
app.use(express.static(__dirname));

// API endpoints for data operations
app.post('/api/save', (req, res) => {
    const { filename, data } = req.body;
    fs.writeFile(path.join(dataDir, filename), JSON.stringify(data), (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/load', (req, res) => {
    const { filename } = req.query;
    fs.readFile(path.join(dataDir, filename), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});