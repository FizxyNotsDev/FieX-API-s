import axios from 'axios';

async function ssweb(url) {
  const headers = {
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json',
    'origin': 'https://imagy.app',
    'priority': 'u=1, i',
    'referer': 'https://imagy.app/',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
  };

  const data = {
    url,
    browserWidth: 1280,
    browserHeight: 720,
    fullPage: false,
    deviceScaleFactor: 1,
    format: 'png'
  };

  try {
    const res = await axios.post('https://gcp.imagy.app/screenshot/createscreenshot', data, { headers });
    return {
      id: res.data.id,
      fileUrl: res.data.fileUrl,
      success: true
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}

export default function(app) {
  app.get('/tools/screenshot', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, message: 'Parameter "url" diperlukan.' });

    const result = await ssweb(url);
    if (!result.success) {
      return res.status(500).json({
        status: false,
        message: result.error || 'Gagal mengambil screenshot'
      });
    }

    res.json({
      status: true,
      fileUrl: result.fileUrl,
      id: result.id
    });
  });
}
