/*
• Scrape AIFreeBox
• Author : SaaOfc's
*/

import axios from 'axios';

export default function(app) {
  app.get('/tools/aifreebox', async (req, res) => {
    const prompt = req.query.prompt;
    const aspectRatio = req.query.ratio || '16:9';
    const slug = req.query.slug || 'ai-art-generator';

    const validRatios = ['1:1', '2:3', '9:16', '16:9'];
    const validSlugs = [
      'ai-art-generator',
      'ai-fantasy-map-creator',
      'ai-youtube-thumbnail-generator',
      'ai-old-cartoon-characters-generator'
    ];

    if (!prompt) {
      return res.status(400).json({ status: false, message: 'Query "prompt" wajib diisi.' });
    }

    if (!validRatios.includes(aspectRatio)) {
      return res.status(400).json({
        status: false,
        message: `Aspect ratio tidak valid. Pilihan: ${validRatios.join(', ')}`
      });
    }

    if (!validSlugs.includes(slug)) {
      return res.status(400).json({
        status: false,
        message: `Slug tidak valid. Pilihan: ${validSlugs.join(', ')}`
      });
    }

    try {
      const { data } = await axios.post(
        'https://aifreebox.com/api/image-generator',
        {
          userPrompt: prompt,
          aspectRatio,
          slug
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://aifreebox.com',
            'Referer': `https://aifreebox.com/image-generator/${slug}`,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Safari/537.36'
          }
        }
      );

      if (data?.success && data.imageUrl) {
        return res.json({
          status: true,
          creator: 'FieX Team',
          image: data.imageUrl
        });
      } else {
        throw new Error('Gagal mendapatkan gambar');
      }
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat mengambil data',
        error: err.message
      });
    }
  });
}
