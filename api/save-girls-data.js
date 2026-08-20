const { writeTournamentData } = require('./_firebase');

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

        await writeTournamentData(newData, 'FIREBASE_GIRLS_DATA_PATH', 'girlsTournamentData');

        return res.status(200).json({ message: 'Girls data saved successfully to Firebase.' });
    } catch (error) {
        console.error('Error saving girls data:', error);
        res.status(500).json({ message: error.message || 'Error saving data.' });
    }
};
