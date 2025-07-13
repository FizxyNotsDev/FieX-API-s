import fetch from 'node-fetch';

const yt = {
  headers: {
    "accept": "*/*",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  },

  mintaJson: async (deskripsi, url, headers, method = "get", body) => {
    const res = await fetch(url, { headers, method, body });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },

  search: async (query) => {
    const headers = {
      ...yt.headers,
      "origin": "https://v2.www-y2mate.com",
      "referer": "https://v2.www-y2mate.com/"
    };
    return await yt.mintaJson("search", `https://wwd.mp3juice.blog/search.php?q=${encodeURIComponent(query)}`, headers);
  },

  getKey: async () => {
    const headers = {
      "content-type": "application/json",
      "origin": "https://iframe.y2meta-uk.com",
      "referer": "https://iframe.y2meta-uk.com/",
      ...yt.headers
    };
    return await yt.mintaJson("get key", `https://api.mp3youtube.cc/v2/sanity/key`, headers);
  },

  handleFormat: (link, formatId) => {
    const list = ["128kbps", "320kbps", "144p", "240p", "360p", "720p", "1080p"];
    if (!list.includes(formatId)) throw new Error(`Format tidak valid. Gunakan: ${list.join(', ')}`);
    const format = formatId.includes('kbps') ? 'mp3' : 'mp4';
    const bitrate = formatId.replace(/[^\d]/g, '');
    return {
      link,
      format,
      audioBitrate: format === 'mp3' ? bitrate : 128,
      videoQuality: format === 'mp4' ? bitrate : 720,
      filenameStyle: "pretty",
      vCodec: "h264"
    };
  },

  convert: async (youtubeUrl, formatId) => {
    const { key } = await yt.getKey();
    const payload = yt.handleFormat(youtubeUrl, formatId);
    const headers = {
      "content-type": "application/x-www-form-urlencoded",
      "Key": key,
      "origin": "https://iframe.y2meta-uk.com",
      "referer": "https://iframe.y2meta-uk.com/",
      ...yt.headers
    };
    const body = new URLSearchParams(payload).toString();
    const json = await yt.mintaJson("convert", `https://api.mp3youtube.cc/v2/converter`, headers, "post", body);
    json.chosenFormat = formatId;
    return json;
  },

  searchAndDownload: async (query, formatId = "128kbps") => {
    const result = await yt.search(query);
    const youtubeUrl = `https://youtu.be/${result.items?.[0]?.id}`;
    if (!youtubeUrl) throw new Error('❌ Video tidak ditemukan');
    return await yt.convert(youtubeUrl, formatId);
  }
};

export default function (app) {
  app.get('/search/play', async (req, res) => {
    const { q, type = '128kbps' } = req.query;
    if (!q) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "q" tidak ditemukan'
      });
    }

    try {
      const result = await yt.searchAndDownload(q, type);
      if (!result?.url) {
        return res.status(404).json({
          status: false,
          message: 'Gagal mendapatkan URL download'
        });
      }

      res.json({
        status: true,
        creator: 'fiex',
        format: result.chosenFormat,
        filename: result.filename,
        url: result.url
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: e.message
      });
    }
  });
}
