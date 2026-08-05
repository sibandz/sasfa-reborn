const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const DATA_FILE = path.join(__dirname, 'tournament-data.json');

async function readLocalData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        throw error;
    }
}

async function writeLocalData(payload) {
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(express.static(__dirname));

app.get('/api/get-data', async (req, res) => {
    try {
        if (BIN_ID && API_KEY) {
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                    headers: { 'X-Master-Key': API_KEY }
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Failed to fetch from JSONBin: ${response.status} ${response.statusText} - ${errorBody}`);
                }
                const data = await response.json();
                return res.json(data.record || {});
            } catch (cloudError) {
                console.warn('Falling back to local data file for GET:', cloudError.message);
            }
        }

        const localData = await readLocalData();
        return res.json(localData);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Error retrieving data.' });
    }
});

app.post('/api/save-data', async (req, res) => {
    try {
        const newData = req.body;

        if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        if (BIN_ID && API_KEY) {
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': API_KEY,
                    },
                    body: JSON.stringify(newData),
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Failed to save to JSONBin: ${response.status} ${response.statusText} - ${errorBody}`);
                }
                return res.status(200).json({ message: 'Data saved successfully to cloud.' });
            } catch (cloudError) {
                console.warn('Falling back to local data file for POST:', cloudError.message);
            }
        }

        await writeLocalData(newData);
        return res.status(200).json({ message: 'Data saved successfully to local server file.' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Error saving data.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
