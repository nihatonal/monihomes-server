const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Yetkilendirme reddedildi, token eksik veya hatalı!" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token Başarıyla Doğrulandı: ", decoded);  // Debugging için
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("❌ Token Hatası:", error.message);
        return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token!" });
    }
};
module.exports = { verifyToken };