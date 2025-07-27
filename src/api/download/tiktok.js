import axios from "axios"
import * as cheerio from "cheerio"; // ⬅️ ESM style for latest Cheerio
import qs from "qs"

async function tikDownloader(urlss) {
  const data = qs.stringify({ q: urlss, lang: "id" })
  const headers = {
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Referer: "https://tikdownloader.io/id",
    Origin: "https://tikdownloader.io"
  }

  try {
    const res = await axios.post("https://tikdownloader.io/api/ajaxSearch", data, { headers })
    const $ = cheerio.load(res.data.data)

    const links = {}
    $("a.tik-button-dl").each((_, el) => {
      const text = $(el).text().trim()
      const href = $(el).attr("href")
      if (text.includes("MP4 [1]")) links.mp4_1 = href
      else if (text.includes("MP4 [2]")) links.mp4_2 = href
      else if (text.includes("MP4 HD")) links.mp4_hd = href
      else if (text.includes("MP3")) links.mp3 = href
    })

    return links
  } catch (err) {
    return { error: err.message }
  }
}

export default function (app) {
  app.get("/download/tiktok", async (req, res) => {
    const { url } = req.query
    if (!url) return res.status(400).json({ status: false, error: "Masukkan parameter ?url=" })

    const result = await tikDownloader(url)
    res.json(result)
  })
}
