// src/api/tools/transcript.js

import fetch from 'node-fetch';

export default function (app) {
  app.get('/tools/transcript', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "url" diperlukan.'
      });
    }

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
          video_id: url,
          format: true
        })
      });

      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          message: `Gagal mengambil transkrip! Status: ${response.status}`
        });
      }

      const data = await response.json();

      if (!data.transcript) {
        return res.status(404).json({
          status: false,
          message: 'Transkrip tidak ditemukan.'
        });
      }

      return res.json({
        status: true,
        transcript: data.transcript
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message
      });
    }
  });
}
