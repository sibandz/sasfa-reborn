const { readTournamentData } = require('./_firebase');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const data = await readTournamentData();
        return res.json(data || {});
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: error.message || 'Error retrieving data.' });
    }
};