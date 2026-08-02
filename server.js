const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

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

/**
 * FIXED: Added check to see if file exists before reading
 * Reads tournament data from the JSON file.
 * If the file doesn't exist or is empty, returns an empty object.
 */
app.get('/api/get-data', async (req, res) => {
    try {
        if (!BIN_ID || !API_KEY) {
            console.warn('JSONBin credentials not configured. Returning empty data.');
            return res.json({});
        }

        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch from JSONBin: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        return res.json(data.record || {});
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Error retrieving data.' });
    }
});

app.post('/api/save-data', async (req, res) => {
    try {
        const newData = req.body;

        if (!newData || typeof newData !== 'object') {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        if (!BIN_ID || !API_KEY) {
            console.error('Error saving data: JSONBin credentials not configured.');
            return res.status(500).json({ message: 'Server not configured for saving data.' });
        }

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
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Error saving data.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
