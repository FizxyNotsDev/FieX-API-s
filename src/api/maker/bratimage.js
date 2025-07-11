// file brat.js (ESM)
export default function (app) {
  app.get('/maker/brat', async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, message: 'Text kosong' });

    try {
      const axios = (await import('axios')).default;
      const { data } = await axios.get(`https://zenzxz.dpdns.org/maker/brat`, {
        responseType: 'arraybuffer',
        params: { text },
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      res.setHeader('Content-Type', 'image/png');
      res.end(data);
    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal ambil brat sticker' });
    }
  });
}
