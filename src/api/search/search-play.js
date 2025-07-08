import axios from 'axios';
import yts from 'yt-search';

export default function (app) {
  app.get('/download/play', async (req, res) => {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({
        status: false,
        message: '❌ Parameter ?q= harus diisi. Contoh: /download/play?q=Lagu Favorit'
      });
    }

    try {
      // Cari video YouTube
      const searchResult = await yts(query);
      const video = searchResult.videos[0];

      if (!video) {
        return res.status(404).json({
          status: false,
          message: '❌ Video tidak ditemukan dari pencarian.'
        });
      }

      // Ambil audio dari API pihak ketiga
      const { data } = await axios.get('https://api.yogik.id/downloader/youtube', {
        params: {
          url: video.url,
          format: 'audio'
        },
        headers: {
          Accept: 'application/json'
        }
      });

      const result = data.result;

      return res.json({
        status: true,
        creator: 'FieX Team',
        result: {
          title: result.title,
          author: result.author_name,
          duration: result.duration,
          views: result.view_count,
          thumbnail: result.thumbnail_url,
          url: result.download_url,
          source: video.url
        }
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({
        status: false,
        message: '❌ Gagal memproses permintaan.',
        error: err.message
      });
    }
  });
}
