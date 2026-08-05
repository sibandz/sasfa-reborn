const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        if (!BIN_ID || !API_KEY) {
            return res.status(500).json({ message: 'Server cloud credentials are not configured.' });
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
        res.status(500).json({ message: 'Error retrieving data.' });
    }
};