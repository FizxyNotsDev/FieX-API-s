import axios from 'axios';

export default function (app) {
  app.get('/tools/nik-checker', async (req, res) => {
    const { nik } = req.query;

    if (!nik || nik.length !== 16 || isNaN(nik)) {
      return res.status(400).json({
        status: false,
        creator: 'FieX Team',
        message: '❌ Parameter ?nik= harus berisi 16 digit angka.'
      });
    }

    try {
      const { data } = await axios.get('https://api.siputzx.my.id/api/tools/nik-checker', {
        params: { nik },
        headers: { accept: '*/*' }
      });

      if (data?.status && data.data) {
        const result = {
          nama: data.data.data.nama,
          kelamin: data.data.data.kelamin,
          tempat_lahir: data.data.data.tempat_lahir,
          usia: data.data.data.usia,
          provinsi: data.data.data.provinsi,
          kabupaten: data.data.data.kabupaten,
          kecamatan: data.data.data.kecamatan,
          kelurahan: data.data.data.kelurahan,
          alamat: data.data.data.alamat,
          tps: data.data.data.tps,
          koordinat: data.data.data.koordinat,
          zodiak: data.data.data.zodiak,
          ultah_mendatang: data.data.data.ultah_mendatang,
          pasaran: data.data.data.pasaran,
          jumlah_lhp: data.data.data.jumlah_lhp,
          metadata: data.data.metadata,
          data_lhp: data.data.data_lhp
        };

        return res.json({
          status: true,
          creator: 'FieX Team',
          result
        });
      } else {
        return res.status(404).json({
          status: false,
          creator: 'FieX Team',
          message: '❌ Data tidak ditemukan.'
        });
      }

    } catch (err) {
      res.status(500).json({
        status: false,
        creator: 'FieX Team',
        message: '❌ Gagal memproses data.',
        error: err.message
      });
    }
  });
}
