import axios from 'axios'

export default function (app) {
  app.get('/info/gempa', async (req, res) => {
    try {
      const response = await axios.get('https://zenzxz.dpdns.org/info/gempa', {
        headers: {
          'User-Agent': 'Mozilla/5.0' // Tambah ini kalau perlu
        },
        timeout: 5000 // opsional
      })

      // Check apakah API berhasil
      if (!response.data || !response.data.status) {
        return res.status(502).json({
          status: false,
          message: 'Respon dari API Zenz tidak valid',
          raw: response.data
        })
      }

      // Sukses
      res.json({
        status: true,
        source: 'Zenzxz API',
        data: response.data.data
      })

    } catch (err) {
      console.error('❌ Error:', err.message)
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data gempa dari zenzxz API',
        error: err.response?.data || err.message
      })
    }
  })
}
