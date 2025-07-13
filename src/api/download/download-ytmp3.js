import axios from "axios";
import qs from "qs";

const yt = {
  headers: {
    "accept": "*/*",
    "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  },

  getKey: async () => {
    const headers = {
      ...yt.headers,
      "origin": "https://iframe.y2meta-uk.com",
      "referer": "https://iframe.y2meta-uk.com/",
      "content-type": "application/json",
    };

    const res = await axios.get("https://api.mp3youtube.cc/v2/sanity/key", { headers });
    if (!res.data?.key) throw new Error("Gagal ambil kunci");
    return res.data.key;
  },

  handleFormat: (link, formatId) => {
    const formatList = ["128kbps", "320kbps", "144p", "240p", "360p", "720p", "1080p"];
    if (!formatList.includes(formatId)) throw new Error("Format tidak valid");

    const match = formatId.match(/(\d+)(\w+)/);
    const format = match[2] === "kbps" ? "mp3" : "mp4";
    const audioBitrate = format === "mp3" ? match[1] : 128;
    const videoQuality = format === "mp4" ? match[1] : 720;

    return {
      link,
      format,
      audioBitrate,
      videoQuality,
      filenameStyle: "pretty",
      vCodec: "h264"
    };
  },

  convert: async (youtubeUrl, formatId = "128kbps") => {
    const key = await yt.getKey();
    const payload = yt.handleFormat(youtubeUrl, formatId);

    const headers = {
      ...yt.headers,
      "Key": key,
      "origin": "https://iframe.y2meta-uk.com",
      "referer": "https://iframe.y2meta-uk.com/",
      "content-type": "application/x-www-form-urlencoded",
    };

    const body = qs.stringify(payload);
    const res = await axios.post("https://api.mp3youtube.cc/v2/converter", body, { headers });

    return {
      status: res.data.status,
      url: res.data.url,
      filename: res.data.filename,
      chosenFormat: formatId,
    };
  }
};

export default function (app) {
  app.get("/download/ytmp3", async (req, res) => {
    const { url, type = "128kbps" } = req.query;
    if (!url) return res.status(400).json({ status: false, message: "Parameter url diperlukan" });

    try {
      const result = await yt.convert(url, type);
      if (!result?.url) return res.status(500).json({ status: false, message: "Gagal mendapatkan link unduh" });
      res.json({
        status: true,
        format: result.chosenFormat,
        filename: result.filename,
        downloadUrl: result.url
      });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
    }
  });
}
