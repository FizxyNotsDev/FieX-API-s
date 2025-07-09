import axios from 'axios';

export default function (app) {
  app.get('/info/jadwaltv', async (req, res) => {
    const { channel = 'MNCTV' } = req.query;

    try {
      const { data } = await axios.get('https://zenzxz.dpdns.org/info/jadwaltv', {
        params: { channel },
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });

      if (!data?.status || !data.jadwal) {
        return res.status(404).json({
          status: false,
          creator: 'FieX Team',
          message: '❌ Jadwal tidak ditemukan atau channel tidak tersedia.'
        });
      }

      res.json({
        status: true,
        creator: 'FieX Team',
        channel: data.channel,
        jadwal: data.jadwal
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: 'FieX Team',
        message: '❌ Gagal mengambil data jadwal TV.',
        error: err.message
      });
    }
  });
}
