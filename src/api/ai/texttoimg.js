import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

async function txttoimage(prompt) {
  const datapost = `prompt=${encodeURIComponent(prompt)}`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://www.texttoimage.org/',
  };

  const res = await axios.post('https://www.texttoimage.org/generate', datapost, { headers });
  const result = res.data;

  if (!result.success || !result.url) {
    throw new Error('Gagal mendapatkan URL gambar');
  }

  const pageUrl = `https://www.texttoimage.org/${result.url}`;
  const pageRes = await axios.get(pageUrl);
  const $ = cheerio.load(pageRes.data);
  const imgTag = $('a[data-lightbox="image-set"] img');
  const imgSrc = imgTag.attr('src');

  if (!imgSrc) {
    throw new Error('Gagal menemukan gambar di halaman hasil');
  }

  return `https://www.texttoimage.org${imgSrc}`;
}

/*
 * [ TEKS TO IMAGE ] 
 * - Source: https://www.texttoimage.org/
 * - Endpoint: /ai/txttoimage?prompt=
 */

export default function(app) {
  app.get('/ai/txttoimage', async (req, res) => {
    try {
      const { prompt } = req.query;
      if (!prompt) return res.status(400).json({ status: false, message: 'Masukkan parameter ?prompt=' });

      const imageUrl = await txttoimage(prompt);
      res.json({
        status: true,
        prompt,
        image: imageUrl
      });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  });
}
