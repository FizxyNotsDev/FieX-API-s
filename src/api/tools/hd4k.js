import axios from 'axios';
import FormData from 'form-data';

function generateFileName(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < length; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name + '.png';
}

async function upscaler4K(urls) {
  const imageResponse = await axios.get(urls, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(imageResponse.data);
  const randomFilename = generateFileName();

  const form = new FormData();
  form.append('file', imageBuffer, {
    filename: randomFilename,
    contentType: 'image/png'
  });

  const headers = {
    ...form.getHeaders(),
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Accept': '*/*',
    'Referer': 'https://malaji71-4k-upscaler.hf.space/'
  };

  const response = await axios.post('https://malaji71-4k-upscaler.hf.space/api/upload', form, { headers });
  const outputFile = response.data.output_filename;
  return `https://malaji71-4k-upscaler.hf.space/api/preview/${outputFile}`;
}

export default function app(app) {
  app.get('/tools/hd4k', async (req, res) => {
    const { url } = req.query;
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ status: false, message: 'Masukkan URL gambar yang valid' });
    }

    try {
      const result = await upscaler4K(url);
      res.json({
        status: true,
        input: url,
        result
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: 'Gagal melakukan upscale',
        error: e.message || e
      });
    }
  });
}
