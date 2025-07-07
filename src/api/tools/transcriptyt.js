/*
• Scrape YouTube Transcript API
• Author: SaaOfc's + FieX
*/

import fetch from 'node-fetch';

function extractVideoId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    if (host === 'youtu.be') return parsed.pathname.slice(1);
    if (host.includes('youtube.com')) return parsed.searchParams.get('v');

    throw new Error('❌ URL YouTube tidak valid.');
  } catch {
    throw new Error('❌ Format URL salah.');
  }
}

export default function (app) {
  app.get('/tools/transcript', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?url= dibutuhkan.'
      });
    }

    try {
      const videoId = extractVideoId(url);

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
          video_id: videoId,
          format: true
        })
      });

      if (!response.ok) {
        return res.status(500).json({
          status: false,
          message: `Gagal mengambil transkrip (Status: ${response.status})`
        });
      }

      const data = await response.json();

      if (!data.transcript) {
        return res.status(404).json({
          status: false,
          message: 'Transkrip tidak ditemukan untuk video ini.'
        });
      }

      const transcript = data.transcript.length > 4000
        ? data.transcript.slice(0, 4000) + '\n\n...(terpotong)'
        : data.transcript;

      res.json({
        status: true,
        transcript
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message
      });
    }
  });
}
