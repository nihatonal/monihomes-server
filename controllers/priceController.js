// models/Price.js
const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const Price = mongoose.model('Price', priceSchema);


// routes/priceRoutes.js
const express = require('express');
const router = express.Router();

// ✅ 1. Add new price range (handles overlap by splitting existing)
router.post('/admin/protected/prices/add', async (req, res) => {
    const { startDate, endDate, price } = req.body;
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    try {
        // Find and delete overlapping records
        const overlapping = await Price.find({
            $or: [
                { startDate: { $lte: newEnd }, endDate: { $gte: newStart } },
                { startDate: { $gte: newStart, $lte: newEnd } },
            ],
        });

        for (const entry of overlapping) {
            await Price.findByIdAndDelete(entry._id);
            // Optional: re-split remaining parts if needed
            if (entry.startDate < newStart) {
                await Price.create({ startDate: entry.startDate, endDate: newStart, price: entry.price });
            }
            if (entry.endDate > newEnd) {
                await Price.create({ startDate: newEnd, endDate: entry.endDate, price: entry.price });
            }
        }

        const created = await Price.create({ startDate, endDate, price });
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 2. Get all prices
router.get('/prices', async (req, res) => {
    try {
        const prices = await Price.find().sort({ startDate: 1 });
        res.json(prices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 3. Get price by specific date
router.get('/date/:target', async (req, res) => {
    try {
        const target = new Date(req.params.target);
        const price = await Price.findOne({
            startDate: { $lte: target },
            endDate: { $gte: target },
        });
        if (price) res.json(price);
        else res.status(404).json({ error: 'No price for this date' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 4. Update price by ID
router.put('/admin/protected/prices/:id', async (req, res) => {
    try {
        const updated = await Price.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 5. Delete price by ID
router.delete('/admin/protected/prices/:id', async (req, res) => {
    try {
        await Price.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
