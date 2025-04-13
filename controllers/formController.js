const nodemailer = require('nodemailer');


// Gmail üzerinden e-posta göndermek için bir transporter oluşturuyoruz.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL, // Gmail kullanıcı adı
        pass: process.env.ADMIN_PASS, // Gmail şifresi (App password kullanabilirsiniz)
    },
});

const sendForm = async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // E-posta gönder
        const mailOptions = {
            from: email,
            to: process.env.ADMIN_EMAIL,
            //to: process.env.ADMIN_EMAIL, // Otel sahibinin e-posta adresi
            subject: 'Monihomes Sayfasından email aldınız',
            html: `
                <h2>Yeni Rezervasyon Talebi</h2>
                <p><strong>Ad:</strong> ${name}</p>
                <p><strong>E-posta:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>

            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("E-posta başarıyla gönderildi!");
        } catch (error) {
            console.error("E-posta gönderme hatası:", error);
        }

        res.status(200).json({ message: "Form başarıyla gönderildi!" });
    } catch (error) {
        res.status(500).json({ message: "Form gönderilemedi!" });
    }
};

module.exports = { sendForm };