const axios = require('axios');

module.exports = function (app) {
  app.get('/maker/brat', async (req, res) => {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Text query wajib diisi. Contoh: /maker/brat?text=hai'
      });
    }

    const targetUrl = `https://zenzxz.dpdns.org/maker/brat?text=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(targetUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        }
      });

      res.setHeader('Content-Type', 'image/png');
      return res.send(response.data);
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: 'Gagal ambil gambar dari zenzxz: ' + error.message
      });
    }
  });
};
