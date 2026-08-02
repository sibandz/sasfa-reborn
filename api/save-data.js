const fs = require('node:fs/promises');
const path = require('node:path');

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const DATA_FILE = path.join(process.cwd(), 'tournament-data.json');

async function writeLocalData(payload) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

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
                    throw new Error('Failed to save data to JSONBin');
                }

                return res.status(200).json({ message: 'Data saved successfully to cloud.' });
            } catch (error) {
                console.warn('Falling back to local server data file:', error.message);
            }
        }

        await writeLocalData(newData);
        return res.status(200).json({ message: 'Data saved successfully to local server file.' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Error saving data.' });
    }
};