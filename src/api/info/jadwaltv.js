app.get('/info/jadwaltv', async (req, res) => {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({
      status: false,
      message: "❌ Parameter ?channel= harus diisi."
    });
  }

  try {
    // Query API untuk mendapatkan jadwal berdasarkan channel
    const { data } = await axios.get(`https://zenzxz.dpdns.org/info/jadwaltv?channel=${encodeURIComponent(channel)}`);
    
    if (data.status === true) {
      return res.json({
        status: true,
        creator: data.creator,
        channel: data.channel,
        jadwal: data.jadwal
      });
    } else {
      return res.status(404).json({
        status: false,
        creator: "FieX Team",
        message: "❌ Jadwal tidak ditemukan atau format tidak sesuai."
      });
    }
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "❌ Terjadi kesalahan saat mengambil jadwal."
    });
  }
});
