const express = require("express");
const { get_reviews } = require('../controllers/reviewsController.js');

const router = express.Router();

router.get("/google_reviews", get_reviews);

module.exports = router;
