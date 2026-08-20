const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

function normalizePrivateKey(value) {
    if (!value) return '';
    let key = String(value).trim();

    // Handle keys pasted as a JSON string literal with surrounding quotes.
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }

    // Support both escaped and real line endings from env providers.
    key = key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
    return key.trim();
}

function getFirebaseConfig() {
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');
    const databaseURL = process.env.FIREBASE_DATABASE_URL || '';

    return { projectId, clientEmail, privateKey, databaseURL };
}

function ensureFirebaseApp() {
    const cfg = getFirebaseConfig();
    const missing = [];
    if (!cfg.projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!cfg.clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!cfg.privateKey) missing.push('FIREBASE_PRIVATE_KEY');
    if (!cfg.databaseURL) missing.push('FIREBASE_DATABASE_URL');

    if (missing.length > 0) {
        throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
    }

    if (getApps().length === 0) {
        initializeApp({
            credential: cert({
                projectId: cfg.projectId,
                clientEmail: cfg.clientEmail,
                privateKey: cfg.privateKey,
            }),
            databaseURL: cfg.databaseURL,
        });
    }
}

function getDataPath(envVar, fallback) {
    const rawPath = process.env[envVar] || fallback;
    const cleaned = String(rawPath).replace(/^\/+|\/+$/g, '').trim();
    return cleaned || fallback;
}

async function readTournamentData(envVar = 'FIREBASE_DATA_PATH', fallback = 'tournamentData') {
    ensureFirebaseApp();
    const db = getDatabase();
    const snapshot = await db.ref(getDataPath(envVar, fallback)).once('value');
    const value = snapshot.val();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return value;
}

async function writeTournamentData(data, envVar = 'FIREBASE_DATA_PATH', fallback = 'tournamentData') {
    ensureFirebaseApp();
    const db = getDatabase();
    await db.ref(getDataPath(envVar, fallback)).set(data);
}

module.exports = {
    readTournamentData,
    writeTournamentData,
};
