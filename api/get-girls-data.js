const { readTournamentData } = require('./_firebase');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const data = await readTournamentData('FIREBASE_GIRLS_DATA_PATH', 'girlsTournamentData');
        return res.json(data || {});
    } catch (error) {
        console.error('Error fetching girls data:', error);
        res.status(500).json({ message: error.message || 'Error retrieving data.' });
    }
};
