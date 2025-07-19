// cek-kuota-xl.js

import axios from 'axios';

const cache = new Map();

async function cekXL(nomor) {
  const h = {
    'authority': 'script.google.com',
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'origin': 'https://2079164363-atari-embeds.googleusercontent.com',
    'referer': 'https://2079164363-atari-embeds.googleusercontent.com/',
    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'x-client-data': 'CI//ygE='
  };

  try {
    const proses1 = await axios.get(`https://script.google.com/macros/s/AKfycbzWc8Gw-nDH_1BGZFsswNedO5v0GDV46NBe7RNaO_4xqMXxaLeEzp-YXodMju8shFoypw/exec?msisdn=${nomor}`, {
      headers: h,
      timeout: 10000
    });
    return proses1.data;
  } catch (e) {
    throw new Error(`${e.message}`);
  }
}

export default function(app) {
  app.get('/info/cek-kuota-xl', async (req, res) => {
    const nomor = req.query.nomor;

    if (!nomor) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?nomor= wajib diisi'
      });
    }

    if (!/^\d{10,}$/.test(nomor)) {
      return res.status(400).json({
        status: false,
        message: 'Nomor tidak valid. Contoh: 087812345678'
      });
    }

    const lastCheck = cache.get(nomor);
    const now = Date.now();
    const THIRTY_MIN = 30 * 60 * 1000;

    if (lastCheck && now - lastCheck < THIRTY_MIN) {
      const sisa = Math.ceil((THIRTY_MIN - (now - lastCheck)) / 60000);
      return res.status(429).json({
        status: false,
        message: `Limit: tunggu ${sisa} menit lagi untuk cek nomor ini`
      });
    }

    try {
      const result = await cekXL(nomor);
      cache.set(nomor, now);
      res.json({
        status: true,
        creator: 'Anomaki Team',
        result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: `Gagal memeriksa kuota: ${err.message}`
      });
    }
  });
}
