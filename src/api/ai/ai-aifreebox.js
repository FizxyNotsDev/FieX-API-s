// aifreebox.js
import axios from 'axios';

export default function (app) {
  app.get('/ai/aifreebox', async (req, res) => {
    const { prompt, aspectRatio = '16:9', slug = 'ai-art-generator' } = req.query;

    const validRatios = ['1:1', '2:3', '9:16', '16:9'];
    const validSlugs = [
      'ai-art-generator',
      'ai-fantasy-map-creator',
      'ai-youtube-thumbnail-generator',
      'ai-old-cartoon-characters-generator'
    ];

    try {
      if (!prompt) {
        return res.status(400).json({ status: false, message: '❌ Parameter ?prompt= wajib diisi.' });
      }

      if (!validRatios.includes(aspectRatio)) {
        return res.status(400).json({ status: false, message: `❌ Aspect ratio tidak valid. Gunakan: ${validRatios.join(', ')}` });
      }

      if (!validSlugs.includes(slug)) {
        return res.status(400).json({ status: false, message: `❌ Slug tidak valid. Gunakan: ${validSlugs.join(', ')}` });
      }

      const { data } = await axios.post('https://aifreebox.com/api/image-generator', {
        userPrompt: prompt,
        aspectRatio,
        slug
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://aifreebox.com',
          'Referer': `https://aifreebox.com/image-generator/${slug}`,
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Safari/537.36'
        }
      });

      if (data?.success && data.imageUrl) {
        return res.json({
          status: true,
          creator: 'FieX',
          prompt,
          aspectRatio,
          slug,
          image: data.imageUrl
        });
      } else {
        return res.status(500).json({ status: false, message: '❌ Gagal mendapatkan gambar.' });
      }
    } catch (err) {
      return res.status(500).json({ status: false, message: '❌ Error: ' + err.message });
    }
  });
}
