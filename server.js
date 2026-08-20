const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { readTournamentData, writeTournamentData } = require('./api/_firebase');

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
        const data = await readTournamentData();
        return res.json(data || {});
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: error.message || 'Error retrieving data.' });
    }
});

app.post('/api/save-data', async (req, res) => {
    try {
        const newData = req.body;

        if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        await writeTournamentData(newData);
        return res.status(200).json({ message: 'Data saved successfully to Firebase.' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: error.message || 'Error saving data.' });
    }
});

app.get('/api/get-girls-data', async (req, res) => {
    try {
        const data = await readTournamentData('FIREBASE_GIRLS_DATA_PATH', 'girlsTournamentData');
        return res.json(data || {});
    } catch (error) {
        console.error('Error retrieving girls data:', error);
        res.status(500).json({ message: error.message || 'Error retrieving data.' });
    }
});

app.post('/api/save-girls-data', async (req, res) => {
    try {
        const newData = req.body;

        if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        await writeTournamentData(newData, 'FIREBASE_GIRLS_DATA_PATH', 'girlsTournamentData');
        return res.status(200).json({ message: 'Girls data saved successfully to Firebase.' });
    } catch (error) {
        console.error('Error saving girls data:', error);
        res.status(500).json({ message: error.message || 'Error saving data.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
