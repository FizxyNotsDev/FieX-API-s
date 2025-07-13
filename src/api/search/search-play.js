import axios from 'axios';
import fetch from 'node-fetch';

const yt = {
  headers: {
    "accept": "*/*",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  },

  mintaJson: async (desc, url, headers, method = "get", body) => {
    const res = await axios({ method, url, headers, data: body });
    return res.data;
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
    const isMp3 = formatId.includes("kbps");
    const bitrate = formatId.replace(/[^\d]/g, '');
    return {
      link,
      format: isMp3 ? "mp3" : "mp4",
      audioBitrate: isMp3 ? bitrate : 128,
      videoQuality: !isMp3 ? bitrate : 720,
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
    return await yt.mintaJson("convert", `https://api.mp3youtube.cc/v2/converter`, headers, "post", body);
  },

  searchAndDownload: async (query, formatId = "128kbps") => {
    const result = await yt.search(query);
    if (!result?.items?.length) throw new Error('Tidak ditemukan hasil YouTube');
    const youtubeUrl = `https://youtu.be/${result.items[0].id}`;
    return await yt.convert(youtubeUrl, formatId);
  }
};

export default async function handler(req, res) {
  const { q, type = "128kbps" } = req.query;
  if (!q) {
    return res.status(400).json({
      status: false,
      message: 'Parameter `q` (query) wajib diisi.'
    });
  }

  try {
    const result = await yt.searchAndDownload(q, type);
    if (!result?.url) {
      return res.status(500).json({ status: false, message: 'Gagal mendapatkan URL download.' });
    }

    const buffer = await fetch(result.url).then(r => r.buffer());
    res.setHeader('Content-Type', type.includes('kbps') ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan.',
      error: err.message
    });
  }
}
