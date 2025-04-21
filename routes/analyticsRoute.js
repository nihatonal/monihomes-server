const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const path = require('path');

const auth = new google.auth.GoogleAuth({
    keyFile:"/etc/secrets/GA_KEY.json",
    // keyFile: path.join(__dirname, '../config/GA_KEY.json'), // Anahtar dosyası konumu
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

router.get('/analytics-data', async (req, res) => {
    try {
        const analyticsDataClient = google.analyticsdata({ version: 'v1beta', auth });
        const response = await analyticsDataClient.properties.runReport({
            property: 'properties/389457889', // GA4 Property ID buraya
            requestBody: {
                dimensions: [{ name: 'date' }],
                metrics: [{ name: 'activeUsers' }],
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/analytics-data/yearly', async (req, res) => {
    try {
        const analyticsDataClient = google.analyticsdata({ version: 'v1beta', auth });
        const response = await analyticsDataClient.properties.runReport({
            property: 'properties/389457889', // GA4 Property ID buraya
            requestBody: {
                dimensions: [{ name: 'month' }],
                metrics: [{ name: 'activeUsers' }],
                dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
                orderBys: [
                    {
                        dimension: { dimensionName: 'month' },
                    },
                ],
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Yıllık analytics hatası:', error);
        res.status(500).json({ error: 'Veri alınamadı' });
    }
});

module.exports = router;
