import axios from 'axios';

export default function(app) {
  app.get('/info/jadwaltv', async (req, res) => {
    const { channel } = req.query;
    if (!channel) {
      return res.status(400).json({
        status: false,
        creator: 'FieX Team',
        message: '❌ Parameter ?channel= harus diisi.'
      });
    }

    try {
      const { data } = await axios.get(`https://zenzxz.dpdns.org/info/jadwaltv?channel=${encodeURIComponent(channel)}`);

      if (!data || data.status === false || !data.result) {
        return res.status(404).json({
          status: false,
          creator: 'FieX Team',
          message: '❌ Jadwal tidak ditemukan atau format tidak sesuai.'
        });
      }

      res.json({
        status: true,
        creator: 'FieX Team',
        result: data.result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: 'FieX Team',
        message: '❌ Gagal terhubung ke API jadwal TV.'
      });
    }
  });
}
