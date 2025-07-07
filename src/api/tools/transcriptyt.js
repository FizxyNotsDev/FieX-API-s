/*
• Scrape YouTube Transcript API
• Author: SaaOfc's + FieX
*/

import fetch from 'node-fetch';

async function getTranscript(videoUrl) {
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
      throw new Error('Tidak ada transkrip tersedia.');
    }

    return data.transcript;
  } catch (err) {
    throw new Error(`Gagal mengambil data: ${err.message}`);
  }
}

export default function (app) {
  app.get('/tools/transcript', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?url= diperlukan.'
      });
    }

    try {
      const transcript = await getTranscript(url);
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
