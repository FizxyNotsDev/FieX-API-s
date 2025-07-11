const axios = require('axios');

module.exports = function (app) {
  app.get('/maker/brat-image', async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi'
      });
    }

    try {
      const response = await axios.get(`https://zenzxz.dpdns.org/maker/brat?text=${encodeURIComponent(text)}`, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      res.setHeader('Content-Type', 'image/png');
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil brat sticker',
        error: err.message
      });
    }
  });
};
