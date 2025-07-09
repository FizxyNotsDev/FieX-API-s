import axios from 'axios';

export default function (app) {
  app.get('/info/jadwaltv', async (req, res) => {
    const channel = req.query.channel;

    if (!channel) {
      return res.status(400).json({
        status: false,
        message: '❌ Parameter ?channel= harus diisi. Contoh: MNCTV, RCTI, SCTV, dll.'
      });
    }

    try {
      const { data } = await axios.get(`https://zenzxz.dpdns.org/info/jadwaltv?channel=${encodeURIComponent(channel)}`);

      if (!data || !Array.isArray(data)) {
        return res.status(404).json({
          status: false,
          message: '❌ Jadwal tidak ditemukan atau format tidak sesuai.'
        });
      }

      res.json({
        status: true,
        creator: 'FieX Team',
        channel,
        result: data
      });
    } catch (err) {
      console.error('JadwalTV Error:', err.message);
      res.status(500).json({
        status: false,
        message: '❌ Gagal mengambil data jadwal TV.',
        error: err.message
      });
    }
  });
}
