const express = require("express");
const { handleReservationRequest } = require("../controllers/reservationController.js");

const router = express.Router();

router.post("/reservation", handleReservationRequest);

module.exports = router;
