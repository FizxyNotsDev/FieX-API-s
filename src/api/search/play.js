import axios from 'axios';

export default function (app) {
  app.get('/search/play', async (req, res) => {
    const query = req.query.q;
    const format = req.query.type || '128kbps';

    if (!query) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "q" (query) dibutuhkan.'
      });
    }

    try {
      // 1. Search video
      const searchRes = await axios.get(`https://wwd.mp3juice.blog/search.php?q=${encodeURIComponent(query)}`, {
        headers: {
          'accept': '*/*',
          'user-agent': 'Mozilla/5.0',
          'origin': 'https://v2.www-y2mate.com',
          'referer': 'https://v2.www-y2mate.com/'
        }
      });

      const videoId = searchRes.data?.items?.[0]?.id;
      if (!videoId) throw new Error('Video tidak ditemukan');

      // 2. Get conversion key
      const keyRes = await axios.get('https://api.mp3youtube.cc/v2/sanity/key', {
        headers: {
          'content-type': 'application/json',
          'origin': 'https://iframe.y2meta-uk.com',
          'referer': 'https://iframe.y2meta-uk.com/',
          'user-agent': 'Mozilla/5.0'
        }
      });

      const key = keyRes.data.key;
      if (!key) throw new Error('Key tidak ditemukan');

      // 3. Convert & get download URL
      const formatType = format.includes('kbps') ? 'mp3' : 'mp4';
      const bitrate = format.replace(/[^\d]/g, '') || '128';

      const body = new URLSearchParams({
        link: `https://youtu.be/${videoId}`,
        format: formatType,
        audioBitrate: bitrate,
        videoQuality: '720',
        filenameStyle: 'pretty',
        vCodec: 'h264'
      }).toString();

      const convertRes = await axios.post('https://api.mp3youtube.cc/v2/converter', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Key': key,
          'origin': 'https://iframe.y2meta-uk.com',
          'referer': 'https://iframe.y2meta-uk.com/',
          'user-agent': 'Mozilla/5.0'
        }
      });

      const { url, filename } = convertRes.data;

      if (!url) throw new Error('Link unduhan tidak ditemukan');

      // 4. Kirim hasil JSON
      res.json({
        status: true,
        title: filename,
        format: formatType,
        download: url
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message
      });
    }
  });
}
