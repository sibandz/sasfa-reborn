const RAW_BIN_ID = process.env.JSONBIN_BIN_ID || process.env.JSONBIN_BIN || process.env.JSONBIN_ID || '';
const API_KEY = process.env.JSONBIN_API_KEY || process.env.JSONBIN_MASTER_KEY || process.env.JSONBIN_KEY || '';

function normalizeBinId(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';
    const urlMatch = value.match(/\/b\/([a-zA-Z0-9]+)/i);
    if (urlMatch) return urlMatch[1];
    return value;
}

const BIN_ID = normalizeBinId(RAW_BIN_ID);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        let newData = req.body;
        if (typeof newData === 'string') {
            try {
                newData = JSON.parse(newData);
            } catch (parseError) {
                return res.status(400).json({ message: 'Invalid JSON payload.' });
            }
        }

        if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        if (!BIN_ID || !API_KEY) {
            return res.status(500).json({ message: 'Server cloud credentials are not configured (JSONBIN_BIN_ID / JSONBIN_API_KEY).' });
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
            throw new Error(`Failed to save data to JSONBin: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        return res.status(200).json({ message: 'Data saved successfully to cloud.' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: error.message || 'Error saving data.' });
    }
};