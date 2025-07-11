import axios from 'axios';

export default function (app) {
  app.get('/info/gempa', async (req, res) => {
    try {
      const response = await axios.get('https://zenzxz.dpdns.org/info/gempa');
      const data = response.data?.data;

      if (!data) {
        return res.status(502).json({
          status: false,
          message: 'Gagal mengambil data gempa.'
        });
      }

      res.json({
        status: true,
        result: {
          waktu: data.waktu,
          magnitude: data.magnitude,
          kedalaman: data.kedalaman,
          wilayah: data.wilayah,
          potensi: data.potensi,
          koordinat: data.coordinates,
          shakemap: data.shakemap
        }
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal memuat data gempa.',
        error: err.message
      });
    }
  });
}
