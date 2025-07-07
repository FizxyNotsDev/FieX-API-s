import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Fungsi utama untuk scrape transcript YouTube
async function Transcript(videoUrl) {
  try {
    const response = await fetch('https://kome.ai/api/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://kome.ai',
        'Referer': 'https://kome.ai/tools/youtube-transcript-generator',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        video_id: videoUrl,
        format: true
      })
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil transkrip! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.transcript) {
      throw new Error("Tidak ada respon transcript.");
    }

    return data.transcript;
  } catch (err) {
    throw new Error(`Error: ${err.message}`);
  }
}

// Endpoint API: /tools/transcript?url=https://youtu.be/xxxxx
app.get("/tools/transcript", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Parameter ?url= wajib diisi."
    });
  }

  try {
    const transcript = await Transcript(url);
    res.json({
      status: true,
      creator: "FieX Team",
      transcript
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
});

// Tes langsung jika buka root
app.get("/", (req, res) => {
  res.send("🎤 YouTube Transcript API is running. Gunakan endpoint /tools/transcript?url=");
});

app.listen(PORT, () => {
  console.log(`✅ Server aktif di http://localhost:${PORT}`);
});
