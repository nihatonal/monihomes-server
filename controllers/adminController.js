const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Admin Modeli
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);


const adminRegister = async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const newAdmin = new Admin({ username, password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin başarıyla oluşturuldu' });
    } catch (err) {
        res.status(500).json({ message: 'Kayıt başarısız', error: err });
    }
};
const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

// Korunan Admin Endpoint Örneği
const getProtectedAdminData = (req, res) => {
    res.json({ message: 'Bu adminlere özel bir veridir' });
};


module.exports = { adminRegister, adminLogin, getProtectedAdminData };