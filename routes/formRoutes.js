const express = require("express");
const { sendForm } = require("../controllers/formController");

const router = express.Router();

router.post("/sending_form", sendForm);

module.exports = router;
