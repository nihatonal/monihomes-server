const { sendReservationEmail } = require("./emailController.js");
// import { sendReservationWhatsApp } from "./whatsappController.js";

// Rezervasyon talebini al ve otel sahibine ilet
const handleReservationRequest = async (req, res) => {
    const { name, email, phone, guests, checkIn, checkOut } = req.body;

    const reservationDetails = { name, email, phone, guests, checkIn, checkOut };

    try {
        // E-posta gönder
        await sendReservationEmail(reservationDetails);

        // WhatsApp mesajı gönder
        // await sendReservationWhatsApp(reservationDetails);

        res.status(200).json({ message: "Rezervasyon talebi başarıyla gönderildi!" });
    } catch (error) {
        res.status(500).json({ message: "Rezervasyon talebi gönderilemedi!" });
    }
};

module.exports = { handleReservationRequest };