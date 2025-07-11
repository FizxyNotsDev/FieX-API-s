const axios = require('axios');

module.exports = function(app) {
  app.get('/maker/brat', async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, message: 'Parameter text wajib' });

    try {
      const url = `https://zenzxz.dpdns.org/sticker/brat?text=${encodeURIComponent(text)}`; // PATH yang dikonfirmasi
      const r = await axios.get(url, { responseType: 'arraybuffer' });
      res.setHeader('Content-Type', 'image/png');
      res.send(r.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        status: false,
        message: `Gagal ambil sticker: ${err.response?.status} ${err.response?.statusText}`,
        error: err.message
      });
    }
  });
};
