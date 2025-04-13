
const nodemailer = require('nodemailer');

// Gmail üzerinden e-posta göndermek için bir transporter oluşturuyoruz.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL, // Gmail kullanıcı adı
        pass: process.env.ADMIN_PASS, // Gmail şifresi (App password kullanabilirsiniz)
    },
});

// Rezervasyon talebi e-postası gönderme
const sendReservationEmail = async (reservationDetails) => {
    const { name, email, phone, guests, checkIn, checkOut } = reservationDetails;
    console.log(reservationDetails)
    // E-posta içeriği
    const mailOptions = {
        from: email,
        //to: "onalnihat@outlook.com",
        to: process.env.ADMIN_EMAIL, // Otel sahibinin e-posta adresi
        subject: 'Yeni Rezervasyon Talebi',
        html: `
            <h2>Yeni Rezervasyon Talebi</h2>
            <p><strong>Ad:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Tel No:</strong> ${phone}</p>
            <p><strong>Misafir Sayısı:</strong> ${guests}</p>
            <p><strong>Giriş Tarihi:</strong> ${checkIn}</p>
            <p><strong>Çıkış Tarihi:</strong> ${checkOut}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("E-posta başarıyla gönderildi!");
    } catch (error) {
        console.error("E-posta gönderme hatası:", error);
    }
};
module.exports = { sendReservationEmail };