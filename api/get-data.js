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
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        if (!BIN_ID || !API_KEY) {
            return res.status(500).json({ message: 'Server cloud credentials are not configured (JSONBIN_BIN_ID / JSONBIN_API_KEY).' });
        }

        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': API_KEY,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch from JSONBin: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        return res.json(data.record || {});
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: error.message || 'Error retrieving data.' });
    }
};