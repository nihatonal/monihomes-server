const express = require("express");

const adminControllers = require("../controllers/adminController");
const { verifyToken } = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.post("/register", adminControllers.adminRegister);
router.post("/login", adminControllers.adminLogin);
router.get('/protected', verifyToken, adminControllers.getProtectedAdminData);

module.exports = router;
