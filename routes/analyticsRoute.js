const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const path = require('path');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const auth = new google.auth.GoogleAuth({
    // keyFile: "/etc/secrets/GA_KEY.json",
    keyFile: path.join(__dirname, '../config/GA_KEY.json'), // Anahtar dosyası konumu
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});
const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFile: path.join(__dirname, '../config/GA_KEY.json'),
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

router.get('/analytics-countries', async (req, res) => {
    try {
        const analyticsDataClient = google.analyticsdata({ version: 'v1beta', auth });
        const response = await analyticsDataClient.properties.runReport({
            property: 'properties/389457889', // GA4 Property ID buraya
            requestBody: {
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }],
                dateRanges: [{ startDate: '31daysAgo', endDate: 'today' }]

            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Yıllık analytics hatası:', error);
        res.status(500).json({ error: 'Veri alınamadı' });
    }
});

router.get("/analytics-traffic-sources", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: 'properties/389457889',
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'sessions' }],
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        });

        // const result = response.rows.map(row => ({
        //   source: row.dimensionValues[0].value,
        //   sessions: parseInt(row.metricValues[0].value),
        // }));
        res.json(response);
    } catch (error) {
        console.error("Traffic Source Error:", error);
        res.status(500).json({ error: "Analytics error" });
    }
});

function formatDate(dateStr) {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const year = dateStr.slice(0, 4);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = dateStr.slice(6, 8);
  return `${months[month]} ${day}`;
}
router.get('/traffic-sources/weekly', async (req, res) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/389457889`,
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today',
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'sessionDefaultChannelGroup' },
        ],
        metrics: [
          { name: 'sessions' },
        ],
      });
  
      const rows = response.rows || [];
  
      // Verileri organize et
      const grouped = {};
  
      rows.forEach(row => {
        const date = row.dimensionValues[0].value;
        const source = row.dimensionValues[1].value;
        const count = parseInt(row.metricValues[0].value, 10);
  
        if (!grouped[date]) {
          grouped[date] = { date, sources: {} };
        }
  
        grouped[date].sources[source] = (grouped[date].sources[source] || 0) + count;
      });
  
      const result = Object.values(grouped).map(entry => ({
        date: formatDate(entry.date), // YYYYMMDD -> 2025-04-20
        sources: entry.sources
      }));
  
      res.json(result);
    } catch (err) {
      console.error('Traffic Sources Weekly Error:', err);
      res.status(500).json({ error: 'Failed to fetch traffic sources data' });
    }
  });
  

module.exports = router;
