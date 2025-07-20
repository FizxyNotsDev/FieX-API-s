import axios from 'axios';
import cheerio from 'cheerio';

/*
 • Fitur By Anomaki Team
 • Created : xyzan code
 • Teks to image scrape simple
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
*/

async function txttoimage(prompt) {
  const datapost = `prompt=${encodeURIComponent(prompt)}`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://www.texttoimage.org/'
  };

  const res = await axios.post('https://www.texttoimage.org/generate', datapost, { headers });
  const result = res.data;

  if (!result.success || !result.url) throw new Error('Gagal dapat URL image');

  const pageUrl = `https://www.texttoimage.org/${result.url}`;
  const pageRes = await axios.get(pageUrl);
  const $ = cheerio.load(pageRes.data);
  const imgtag = $('a[data-lightbox="image-set"] img');
  const imgsrc = imgtag.attr('src');

  if (!imgsrc) throw new Error('Gagal nemu gambar di halaman hasil');

  return `https://www.texttoimage.org${imgsrc}`;
}

export default function(app) {
  app.get('/ai/txttoimage', async (req, res) => {
    try {
      const { prompt } = req.query;
      if (!prompt) {
        return res.status(400).json({
          status: false,
          message: 'Masukkan parameter ?prompt='
        });
      }

      const image = await txttoimage(prompt);
      res.json({
        status: true,
        prompt,
        image
      });
    } catch (error) {
      console.error('[ERROR txttoimage]', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Terjadi kesalahan internal saat generate gambar.'
      });
    }
  });
}
