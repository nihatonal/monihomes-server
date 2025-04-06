const https = require('https');


const get_reviews = async (req, res, next) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${process.env.PLACE_ID}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`;

  https.get(url, ress => {
    let data = '';
    ress.on('data', chunk => {
      data += chunk;
    });
    ress.on('end', () => {
      data = JSON.parse(data);
      //console.log(data);
      res.json({
        data,
      });
    })
  }).on('error', err => {
    console.log(err.message);
  })

};

module.exports = { get_reviews };