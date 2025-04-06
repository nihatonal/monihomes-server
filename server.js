const express = require("express");
const mongoose = require('mongoose');

const axios = require("axios");
require("dotenv").config();
const querystring = require('querystring');
const app = express();
const cors = require("cors");
const reservationRoutes = require("./routes/reservationRoutes.js");
const adminRoutes = require("./routes/adminRoutes");
const reviewsRoute = require("./routes/reviewsRoutes");
const formRoutes = require("./routes/formRoutes");
const priceRoutes = require("./controllers/priceController");

const PORT = process.env.PORT;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const PROJECT_URL = process.env.PROJECT_URL;
const scope = 'https://www.googleapis.com/auth/calendar';
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${scope}&response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&access_type=offline`;


const allowedOrigins = ['http://localhost:3000', PROJECT_URL];  // Allow only your frontend URL




app.use(cors({
    origin: allowedOrigins,  // Only allow requests from the allowed origins
    methods: ['GET', 'POST','DELETE','PUT'],  // You can add other HTTP methods if needed
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", reservationRoutes);
app.use("/api", reviewsRoute);
app.use("/api", formRoutes);
app.use("/api", priceRoutes);
app.use("/api/admin", adminRoutes);
app.get('/api/login', (req, res) => {
    // Redirect the user to the Google authorization page
    res.redirect(authUrl);
});

// Route to handle the callback from Google
app.get('/auth/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
        return res.status(400).send('Authorization code not found');
    }

    const tokenData = querystring.stringify({
        code: authorizationCode,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
    });

    try {
        // Request the access token and refresh token
        const response = await axios.post('https://oauth2.googleapis.com/token', tokenData);
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Send the tokens to the parent window (frontend) using postMessage
        res.send(`
        <script>
          window.opener.postMessage({ accessToken: '${accessToken}', refreshToken: '${refreshToken}' }, '*');
          window.close();
        </script>
      `);
    } catch (error) {
        console.error('Error exchanging authorization code:', error.response.data);
        res.status(500).send('Error exchanging authorization code');
    }
});

app.get('/api/auth/userinfo', async (req, res) => {
    const accessToken = req.query.accessToken;

    if (!accessToken) {
        return res.status(400).json({ error: "Access token is required" });
    }

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching user info:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching user info", details: error.response?.data });
    }
});

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));


// // Price Modeli
// const priceSchema = new mongoose.Schema({
//     price: []
// });
// const Price = mongoose.model('Price', priceSchema);

// //Fiyat guncelleme
// app.post('/api/admin/setprice', async (req, res) => {
//     const { price } = req.body;

//     if (!price) return

//     let new_price;

//     try {
//         new_price = await Price.findById(process.env.PRICE_ID);
//     } catch (err) {
//         res.status(500).json({ message: 'Kayıt bulunamdı', error: err });
//     }

//     new_price.price = price;

//     try {
//         await new_price.save();
//     } catch (err) {
//         res.status(500).json({ message: 'Kayıt başarısız', error: err });
//     }

//     res.status(200).json({ price });

// });


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



