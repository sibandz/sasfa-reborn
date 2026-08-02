const fs = require('node:fs/promises');
const path = require('node:path');

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const DATA_FILE = path.join(process.cwd(), 'tournament-data.json');

async function readLocalData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        if (BIN_ID && API_KEY) {
            try {
                const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                    headers: {
                        'X-Master-Key': API_KEY,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch from JSONBin');
                }

                const data = await response.json();
                return res.json(data.record || {});
            } catch (error) {
                console.warn('Falling back to local server data file:', error.message);
            }
        }

        const data = await readLocalData();
        return res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error retrieving data.' });
    }
};