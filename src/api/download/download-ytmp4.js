import axios from 'axios';
import qs from 'querystring';

const ytHeaders = {
  'accept': 'application/json',
  'user-agent': 'Mozilla/5.0',
  'origin': 'https://iframe.y2meta-uk.com',
  'referer': 'https://iframe.y2meta-uk.com/',
};

const handleFormat = (link, formatId) => {
  const listFormat = ["144p", "240p", "360p", "720p", "1080p"];
  if (!link || !formatId) throw new Error("Invalid link or formatId");

  if (!listFormat.includes(formatId)) {
    throw new Error(`Invalid formatId: ${formatId}. Valid: ${listFormat.join(", ")}`);
  }

  const match = formatId.match(/(\d+)(\w+)/);
  const format = match[2] === "p" ? "mp4" : "mp3";
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
};

const getKey = async () => {
  const response = await axios.get("https://api.mp3youtube.cc/v2/sanity/key", {
    headers: {
      ...ytHeaders,
      'content-type': 'application/json',
    },
  });

  if (!response.data?.key) throw new Error("Gagal ambil key");
  return response.data.key;
};

const convert = async (youtubeUrl, formatId = "360p") => {
  const key = await getKey();
  const payload = handleFormat(youtubeUrl, formatId);
  const body = qs.stringify(payload);

  const response = await axios.post(
    "https://api.mp3youtube.cc/v2/converter",
    body,
    {
      headers: {
        ...ytHeaders,
        'content-type': 'application/x-www-form-urlencoded',
        'Key': key,
      },
    }
  );

  return {
    status: response.data.status,
    url: response.data.url,
    filename: response.data.filename,
    chosenFormat: response.data.chosenFormat || formatId,
  };
};

export default function (app) {
  app.get("/download/ytmp4", async (req, res) => {
    const { url, type = "360p" } = req.query;
    if (!url) return res.status(400).json({ status: false, message: "Parameter url diperlukan" });

    try {
      const result = await convert(url, type);
      if (!result?.url) return res.status(500).json({ status: false, message: "Gagal mendapatkan link unduh" });

      res.json({
        status: true,
        format: result.chosenFormat,
        filename: result.filename,
        downloadUrl: result.url
      });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
}
