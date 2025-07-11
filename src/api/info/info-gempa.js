import axios from 'axios';

export default function (app) {
  app.get('/info/gempa', async (req, res) => {
    try {
      const { data } = await axios.get('https://zenzxz.dpdns.org/info/gempa');
      res.json(data); // langsung teruskan respons asli dari Zens
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({
        status: false,
        message: 'Gagal memuat data gempa.'
      });
    }
  });
}
